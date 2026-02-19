import { API_BASE } from './config.js';

const apps = [
  'terminal','files','browser','server','writer','editor','monitor','network','settings','installer'
];

const state = {
  windows: [],
  z: 10,
};

const bootLogo = `  ____  _
 / __ \\| |
| |  | | |__   ___  ___  ___
| |  | | '_ \\ / _ \\/ __|/ _ \\
| |__| | | | |  __/\\__ \\  __/
 \\____/|_| |_|\\___||___/\\___|`;

const boot = document.getElementById('boot');
const desktop = document.getElementById('desktop');
const windowsEl = document.getElementById('windows');
const launcher = document.getElementById('launcher');
const launcherGrid = document.getElementById('launcher-grid');
const launcherSearch = document.getElementById('launcher-search');
const notifications = document.getElementById('notifications');

function init() {
  document.getElementById('boot-logo').textContent = bootLogo;
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !boot.classList.contains('hidden')) {
      boot.classList.add('hidden');
      desktop.classList.remove('hidden');
      loadState();
      initClock();
    }
  });

  document.querySelectorAll('.dock-btn').forEach(btn => {
    btn.addEventListener('click', () => openApp(btn.dataset.app));
  });

  document.getElementById('launcher-btn').addEventListener('click', () => {
    launcher.classList.toggle('hidden');
  });

  document.getElementById('notif-btn').addEventListener('click', () => {
    notifications.classList.toggle('hidden');
  });

  launcherSearch.addEventListener('input', renderLauncher);

  renderLauncher();
}

function renderLauncher() {
  const q = launcherSearch.value?.toLowerCase() || '';
  launcherGrid.innerHTML = '';
  apps.filter(a => a.includes(q)).forEach(app => {
    const b = document.createElement('button');
    b.className = 'dock-btn';
    b.textContent = app;
    b.addEventListener('click', () => openApp(app));
    launcherGrid.appendChild(b);
  });
}

function initClock() {
  const el = document.getElementById('clock');
  setInterval(() => {
    const d = new Date();
    el.textContent = d.toLocaleTimeString();
  }, 1000);
}

function openApp(app) {
  const win = createWindow(app);
  windowsEl.appendChild(win.el);
  notify(`Opened ${app}`);
  persistWindows();
}

function createWindow(app, opts = {}) {
  const id = opts.id || `w_${Date.now()}_${Math.floor(Math.random()*1000)}`;
  const el = document.createElement('div');
  el.className = 'window';
  el.dataset.winId = id;
  el.style.left = `${opts.x ?? (80 + Math.random()*200)}px`;
  el.style.top = `${opts.y ?? (80 + Math.random()*120)}px`;
  if (opts.w) el.style.width = `${opts.w}px`;
  if (opts.h) el.style.height = `${opts.h}px`;
  el.style.zIndex = String(++state.z);

  const header = document.createElement('div');
  header.className = 'window-header';
  header.innerHTML = `<span>${app}</span>`;

  const controls = document.createElement('div');
  controls.className = 'window-controls';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'x';
  closeBtn.addEventListener('click', () => {
    el.remove();
    state.windows = state.windows.filter(w => w.id !== id);
    persistWindows();
  });
  controls.appendChild(closeBtn);
  header.appendChild(controls);

  const body = document.createElement('div');
  body.className = 'window-body';
  body.appendChild(appBody(app));

  el.appendChild(header);
  el.appendChild(body);

  makeDraggable(el, header);
  el.addEventListener('mousedown', () => el.style.zIndex = String(++state.z));
  el.addEventListener('mouseup', () => {
    syncWindowState(el, app);
    persistWindows();
  });
  el.addEventListener('mouseleave', () => {
    syncWindowState(el, app);
    persistWindows();
  });

  if (!opts.skipState) {
    syncWindowState(el, app);
    persistWindows();
  }

  return { el };
}

function appBody(app) {
  if (app === 'terminal') return terminalApp();
  if (app === 'files') return filesApp();
  if (app === 'browser') return browserApp();
  if (app === 'server') return serverApp();
  if (app === 'writer') return writerApp();
  if (app === 'editor') return editorApp();
  if (app === 'monitor') return monitorApp();
  if (app === 'network') return networkApp();
  if (app === 'settings') return settingsApp();
  if (app === 'installer') return installerApp();
  return document.createTextNode('Unknown app');
}

function terminalApp() {
  const wrap = document.createElement('div');
  const out = document.createElement('pre');
  out.style.height = '200px';
  out.style.overflow = 'auto';
  out.style.margin = '0 0 6px 0';
  const input = document.createElement('input');
  input.placeholder = 'type a command';
  input.addEventListener('keydown', async e => {
    if (e.key === 'Enter') {
      const cmd = input.value;
      input.value = '';
      const res = await api('/api/terminal', { command: cmd });
      out.textContent += res.output + '\n';
      out.scrollTop = out.scrollHeight;
    }
  });
  wrap.appendChild(out);
  wrap.appendChild(input);
  return wrap;
}

function filesApp() {
  const wrap = document.createElement('div');
  const path = document.createElement('input');
  path.value = '/';

  const search = document.createElement('input');
  search.placeholder = 'search';

  const list = document.createElement('pre');
  list.style.height = '120px';

  const filePath = document.createElement('input');
  filePath.placeholder = '/notes.txt';

  const content = document.createElement('textarea');
  content.style.height = '80px';

  const perms = document.createElement('input');
  perms.placeholder = '644';

  const row = document.createElement('div');
  row.className = 'row';
  const btnList = btn('list', async () => {
    const data = await api('/api/files/list', { path: path.value });
    list.textContent = data.entries.join('\n');
  });
  const btnRead = btn('read', async () => {
    const data = await api('/api/files/read', { path: filePath.value });
    content.value = data.content || '';
  });
  const btnWrite = btn('write', async () => {
    await api('/api/files/write', { path: filePath.value, content: content.value });
    notify('saved');
  });
  const btnMkdir = btn('mkdir', async () => {
    await api('/api/files/mkdir', { path: filePath.value });
    notify('dir created');
  });
  const btnSearch = btn('search', async () => {
    const data = await api('/api/files/search', { path: path.value, query: search.value });
    list.textContent = data.results.join('\n');
  });
  const btnChmod = btn('chmod', async () => {
    await api('/api/files/chmod', { path: filePath.value, perms: perms.value });
    notify('perms updated');
  });
  const btnExtract = btn('extract', async () => {
    await api('/api/files/extract', { path: path.value, name: 'archive_extracted' });
    notify('archive extracted');
  });

  row.appendChild(btnList);
  row.appendChild(btnRead);
  row.appendChild(btnWrite);
  row.appendChild(btnMkdir);
  row.appendChild(btnSearch);
  row.appendChild(btnChmod);
  row.appendChild(btnExtract);

  wrap.appendChild(path);
  wrap.appendChild(search);
  wrap.appendChild(list);
  wrap.appendChild(filePath);
  wrap.appendChild(content);
  wrap.appendChild(perms);
  wrap.appendChild(row);
  return wrap;
}

function browserApp() {
  const wrap = document.createElement('div');
  const input = document.createElement('input');
  input.placeholder = 'https://example.com';
  const frame = document.createElement('iframe');
  frame.style.width = '100%';
  frame.style.height = '220px';
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') frame.src = input.value;
  });
  wrap.appendChild(input);
  wrap.appendChild(frame);
  return wrap;
}

function serverApp() {
  const wrap = document.createElement('div');
  const servicesEl = document.createElement('div');
  const logsEl = document.createElement('pre');
  const vhostList = document.createElement('div');
  vhostList.className = 'list';

  const domain = document.createElement('input');
  domain.placeholder = 'site.local';
  const root = document.createElement('input');
  root.placeholder = '/var/www/site';
  const addBtn = btn('add vhost', async () => {
    await api('/api/server/vhosts', { domain: domain.value, root: root.value });
    load();
  });

  async function load() {
    const services = await api('/api/server', null, 'GET');
    servicesEl.innerHTML = '';
    Object.entries(services).forEach(([name, running]) => {
      const row = document.createElement('div');
      row.className = 'row';
      const label = document.createElement('span');
      label.textContent = name;
      const state = document.createElement('span');
      state.className = 'badge';
      state.textContent = running ? 'running' : 'stopped';
      const toggle = btn(running ? 'stop' : 'start', async () => {
        await api('/api/server/toggle', { name, running: !running });
        load();
      });
      row.appendChild(label);
      row.appendChild(state);
      row.appendChild(toggle);
      servicesEl.appendChild(row);
    });

    const logs = await api('/api/server/logs', null, 'GET');
    logsEl.textContent = logs.lines.join('\n');

    const vhosts = await api('/api/server/vhosts', null, 'GET');
    vhostList.textContent = '';
    vhosts.forEach(v => {
      const line = document.createElement('div');
      line.textContent = `${v.domain} -> ${v.root}`;
      vhostList.appendChild(line);
    });
  }

  wrap.appendChild(servicesEl);
  wrap.appendChild(logsEl);

  const vrow = document.createElement('div');
  vrow.className = 'row';
  vrow.appendChild(domain);
  vrow.appendChild(root);
  vrow.appendChild(addBtn);

  wrap.appendChild(vrow);
  wrap.appendChild(vhostList);
  load();
  return wrap;
}

function writerApp() {
  const ta = document.createElement('textarea');
  ta.placeholder = 'Write here...';
  loadKV('writer', '').then(v => ta.value = v || '');
  ta.addEventListener('input', debounce(() => saveKV('writer', ta.value), 400));
  return ta;
}

function editorApp() {
  const ta = document.createElement('textarea');
  ta.placeholder = 'Code editor...';
  loadKV('editor', '').then(v => ta.value = v || '');
  ta.addEventListener('input', debounce(() => saveKV('editor', ta.value), 400));
  return ta;
}

function monitorApp() {
  const wrap = document.createElement('div');
  const pre = document.createElement('pre');
  async function load() {
    const data = await api('/api/system', null, 'GET');
    pre.textContent = JSON.stringify(data, null, 2);
  }
  load();
  wrap.appendChild(pre);
  return wrap;
}

function networkApp() {
  const wrap = document.createElement('div');
  const vpn = document.createElement('input');
  vpn.type = 'checkbox';
  const tor = document.createElement('input');
  tor.type = 'checkbox';
  const mac = document.createElement('input');
  mac.type = 'checkbox';

  async function load() {
    const data = await api('/api/network', null, 'GET');
    vpn.checked = !!data.vpn;
    tor.checked = !!data.tor;
    mac.checked = !!data.mac_random;
  }

  async function save() {
    await api('/api/network', { vpn: vpn.checked, tor: tor.checked, mac_random: mac.checked });
  }

  [vpn, tor, mac].forEach(el => el.addEventListener('change', save));

  wrap.appendChild(labelRow('VPN', vpn));
  wrap.appendChild(labelRow('TOR', tor));
  wrap.appendChild(labelRow('MAC random', mac));
  load();
  return wrap;
}

function settingsApp() {
  const wrap = document.createElement('div');
  const font = document.createElement('input');
  font.type = 'number';
  font.min = '9';
  font.max = '14';
  font.value = '11';
  const accent = document.createElement('input');
  accent.value = '#6cff6c';

  loadKV('settings', {}).then(s => {
    if (s.font) font.value = s.font;
    if (s.accent) accent.value = s.accent;
    applySettings(s);
  });

  font.addEventListener('input', () => {
    const s = { font: font.value, accent: accent.value };
    applySettings(s);
    saveKV('settings', s);
  });
  accent.addEventListener('input', () => {
    const s = { font: font.value, accent: accent.value };
    applySettings(s);
    saveKV('settings', s);
  });

  wrap.appendChild(labelRow('Font Size', font));
  wrap.appendChild(labelRow('Accent', accent));
  return wrap;
}

function installerApp() {
  const wrap = document.createElement('div');
  const steps = ['welcome', 'disk', 'user', 'timezone', 'summary', 'install'];
  const title = document.createElement('div');
  const content = document.createElement('div');
  const controls = document.createElement('div');
  controls.className = 'row';
  const back = btn('back', () => setStep(current - 1));
  const next = btn('next', () => setStep(current + 1));

  let current = 0;
  let data = {};

  async function load() {
    const st = await api('/api/installer', null, 'GET');
    current = st.step || 0;
    data = st.data || {};
    render();
  }

  async function save() {
    await api('/api/installer', { step: current, data });
  }

  function setStep(idx) {
    if (idx < 0 || idx >= steps.length) return;
    current = idx;
    save();
    render();
  }

  function render() {
    title.textContent = `Step ${current + 1}: ${steps[current]}`;
    content.innerHTML = '';
    if (steps[current] === 'welcome') {
      content.textContent = 'Welcome to Omos installer.';
    } else if (steps[current] === 'disk') {
      const disk = document.createElement('input');
      disk.placeholder = '/dev/sda';
      disk.value = data.disk || '';
      disk.addEventListener('input', () => data.disk = disk.value);
      content.appendChild(labelRow('Disk', disk));
    } else if (steps[current] === 'user') {
      const user = document.createElement('input');
      user.placeholder = 'username';
      user.value = data.user || '';
      user.addEventListener('input', () => data.user = user.value);
      content.appendChild(labelRow('User', user));
    } else if (steps[current] === 'timezone') {
      const tz = document.createElement('input');
      tz.placeholder = 'UTC';
      tz.value = data.tz || '';
      tz.addEventListener('input', () => data.tz = tz.value);
      content.appendChild(labelRow('Timezone', tz));
    } else if (steps[current] === 'summary') {
      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(data, null, 2);
      content.appendChild(pre);
    } else if (steps[current] === 'install') {
      content.textContent = 'Installing...';
    }
  }

  controls.appendChild(back);
  controls.appendChild(next);

  wrap.appendChild(title);
  wrap.appendChild(content);
  wrap.appendChild(controls);
  load();
  return wrap;
}

function makeDraggable(win, handle) {
  let offsetX = 0, offsetY = 0, dragging = false;
  handle.addEventListener('mousedown', e => {
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  });
  document.addEventListener('mouseup', () => dragging = false);
}

function notify(text) {
  const item = document.createElement('div');
  item.textContent = text;
  item.style.padding = '4px 0';
  notifications.prepend(item);
}

function btn(label, fn) {
  const b = document.createElement('button');
  b.className = 'btn';
  b.textContent = label;
  b.addEventListener('click', fn);
  return b;
}

function labelRow(label, input) {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.gap = '8px';
  row.style.alignItems = 'center';
  const l = document.createElement('div');
  l.textContent = label;
  row.appendChild(l);
  row.appendChild(input);
  return row;
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

async function api(path, body, method = 'POST') {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'GET' ? undefined : JSON.stringify(body || {})
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (err) {
    notify(`error: ${err.message || err}`);
    return {};
  }
}

async function loadKV(key, def) {
  const res = await api('/api/kv/get', { key, default: def });
  return res.value;
}

async function saveKV(key, value) {
  await api('/api/kv/set', { key, value });
}

function applySettings(s) {
  if (s?.font) document.documentElement.style.setProperty('--font', `${s.font}px`);
  if (s?.accent) document.documentElement.style.setProperty('--accent', s.accent);
}

async function loadState() {
  try {
    const data = await api('/api/state', null, 'GET');
    state.windows = data.windows || [];
    state.windows.forEach(w => {
      const win = createWindow(w.app, { ...w, skipState: true });
      windowsEl.appendChild(win.el);
    });
  } catch (e) {
    // ignore
  }
}

function syncWindowState(el, app) {
  const id = el.dataset.winId;
  const rect = el.getBoundingClientRect();
  const existing = state.windows.find(w => w.id === id);
  const data = {
    id,
    app,
    x: Math.round(rect.left),
    y: Math.round(rect.top),
    w: Math.round(rect.width),
    h: Math.round(rect.height)
  };
  if (existing) {
    Object.assign(existing, data);
  } else {
    state.windows.push(data);
  }
}

const persistWindows = debounce(async () => {
  await api('/api/state', { windows: state.windows, settings: {} });
}, 500);

init();
