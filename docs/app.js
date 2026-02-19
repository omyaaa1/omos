const desktop = document.getElementById("desktop");
const activeApp = document.getElementById("activeApp");
const clock = document.getElementById("clock");
const launcher = document.getElementById("launcher");
const launcherBtn = document.getElementById("launcherBtn");
const launcherGrid = document.getElementById("launcherGrid");
const launcherSearch = document.getElementById("launcherSearch");
const contextMenu = document.getElementById("contextMenu");
const toast = document.getElementById("toast");

const windowTemplate = document.getElementById("windowTemplate");
const dockButtons = document.querySelectorAll(".dock-btn[data-app]");
const desktopIcons = document.querySelectorAll(".icon");

const STORAGE_KEYS = {
  settings: "omos-settings",
  notes: "omos-notes"
};

let zIndexTop = 10;
let noteCounter = 1;
const windows = new Map();
let notesStore = loadNotes();
let settingsStore = loadSettings();

const apps = {
  terminal: {
    title: "Terminal",
    width: 520,
    height: 320,
    single: true,
    content: () => `
      <div class="terminal">
        <div><span class="prompt">omos@kali</span>:~$ neofetch</div>
        <div>OS: Omos 1.0 (web)</div>
        <div>Host: Virtual Desktop</div>
        <div>Kernel: JS 2026</div>
        <div>Shell: zsh</div>
        <div>Theme: Kali Night</div>
        <div>CPU: Browser Core</div>
        <div>GPU: Canvas</div>
        <div>Memory: ∞ (ish)</div>
        <div><span class="prompt">omos@kali</span>:~$ _</div>
      </div>
    `
  },
  files: {
    title: "Files",
    width: 560,
    height: 360,
    single: true,
    content: () => `
      <div class="files-grid">
        <div class="file-card">Documents</div>
        <div class="file-card">Downloads</div>
        <div class="file-card">Projects</div>
        <div class="file-card">Wallpapers</div>
        <div class="file-card">Notes</div>
        <div class="file-card">Backups</div>
      </div>
    `
  },
  browser: {
    title: "Browser",
    width: 640,
    height: 380,
    single: true,
    content: () => `
      <div class="file-card">
        <div class="badge">Secure Session</div>
        <p>Quick links</p>
        <p><a class="link" href="https://github.com/omyaaa1/omos" target="_blank" rel="noreferrer">Repo</a></p>
        <p><a class="link" href="https://omyaaa1.github.io/omos/" target="_blank" rel="noreferrer">Live Desktop</a></p>
      </div>
    `
  },
  settings: {
    title: "Settings",
    width: 520,
    height: 320,
    single: true,
    content: () => `
      <div class="settings-group">
        <div class="toggle">
          <span>Ambient glow</span>
          <input id="glowToggle" type="checkbox" />
        </div>
        <div class="toggle">
          <span>Show noise overlay</span>
          <input id="noiseToggle" type="checkbox" />
        </div>
        <div class="toggle">
          <span>Dock transparency</span>
          <input id="dockToggle" type="checkbox" />
        </div>
      </div>
    `
  },
  about: {
    title: "About",
    width: 480,
    height: 280,
    single: true,
    content: () => `
      <div class="file-card">
        <div class="badge">Omos OS</div>
        <p>Cyber-inspired web desktop with a Kali-like vibe.</p>
        <p>Built for speed, style, and playful interfaces.</p>
      </div>
    `
  },
  notes: {
    title: "Notes",
    width: 520,
    height: 340,
    single: false,
    content: () => `
      <div class="file-card">
        <textarea class="note" placeholder="Type your notes here..."></textarea>
      </div>
    `
  },
  monitor: {
    title: "System Monitor",
    width: 520,
    height: 320,
    single: true,
    content: () => `
      <div class="file-card">
        <div class="monitor-grid">
          <div>CPU</div><div id="cpu">12%</div>
          <div>RAM</div><div id="ram">38%</div>
          <div>Disk</div><div id="disk">54%</div>
          <div>Net</div><div id="netStat">120 Mbps</div>
        </div>
      </div>
    `
  }
};

function loadSettings() {
  const fallback = { glow: true, noise: true, dock: true };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settingsStore));
}

function applySettings() {
  document.body.style.filter = settingsStore.glow ? "none" : "saturate(0.9)";
  document.querySelector(".noise").style.display = settingsStore.noise ? "block" : "none";
  document.querySelector(".dock").style.background = settingsStore.dock
    ? "rgba(9, 12, 18, 0.6)"
    : "rgba(9, 12, 18, 0.9)";
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.notes);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notesStore));
}

function tickClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  clock.textContent = time;
}

function bringToFront(win) {
  zIndexTop += 1;
  win.style.zIndex = zIndexTop;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function makeDraggable(win, bar) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let winX = 0;
  let winY = 0;

  bar.addEventListener("pointerdown", (e) => {
    isDragging = true;
    bar.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startY = e.clientY;
    const rect = win.getBoundingClientRect();
    winX = rect.left;
    winY = rect.top;
    bringToFront(win);
  });

  bar.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    win.style.left = `${Math.max(0, winX + dx)}px`;
    win.style.top = `${Math.max(60, winY + dy)}px`;
  });

  bar.addEventListener("pointerup", (e) => {
    isDragging = false;
    bar.releasePointerCapture(e.pointerId);
  });
}

function setWindowPosition(win, width, height) {
  win.style.left = `${(window.innerWidth - width) / 2}px`;
  win.style.top = `${90 + Math.random() * 80}px`;
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
}

function windowKey(appKey) {
  if (apps[appKey]?.single) return appKey;
  if (appKey === "notes") {
    noteCounter += 1;
    return `${appKey}-${noteCounter}`;
  }
  return `${appKey}-${Date.now()}`;
}

function createWindow(appKey) {
  const app = apps[appKey];
  if (!app) return;

  if (app.single && windows.has(appKey)) {
    const existing = windows.get(appKey);
    existing.classList.remove("minimized");
    bringToFront(existing);
    activeApp.textContent = app.title;
    return;
  }

  const key = windowKey(appKey);

  const fragment = windowTemplate.content.cloneNode(true);
  const win = fragment.querySelector(".window");
  const bar = fragment.querySelector(".window-bar");
  const title = fragment.querySelector(".window-title");
  const body = fragment.querySelector(".window-body");

  title.textContent = app.title;
  body.innerHTML = app.content();

  setWindowPosition(win, app.width, app.height);
  bringToFront(win);
  makeDraggable(win, bar);

  bar.addEventListener("dblclick", () => {
    win.classList.toggle("minimized");
  });

  win.addEventListener("pointerdown", () => bringToFront(win));

  win.querySelectorAll(".win-btn").forEach((btn) => {
    const action = btn.dataset.action;
    btn.addEventListener("click", () => {
      if (action === "close") {
        win.remove();
        windows.delete(key);
        activeApp.textContent = "Desktop";
      }
      if (action === "minimize") {
        win.classList.add("minimized");
        activeApp.textContent = "Desktop";
      }
    });
  });

  desktop.appendChild(win);
  windows.set(key, win);
  activeApp.textContent = app.title;

  if (appKey === "settings") {
    const glowToggle = win.querySelector("#glowToggle");
    const noiseToggle = win.querySelector("#noiseToggle");
    const dockToggle = win.querySelector("#dockToggle");

    glowToggle.checked = settingsStore.glow;
    noiseToggle.checked = settingsStore.noise;
    dockToggle.checked = settingsStore.dock;

    glowToggle.addEventListener("change", (e) => {
      settingsStore.glow = e.target.checked;
      applySettings();
      saveSettings();
    });
    noiseToggle.addEventListener("change", (e) => {
      settingsStore.noise = e.target.checked;
      applySettings();
      saveSettings();
    });
    dockToggle.addEventListener("change", (e) => {
      settingsStore.dock = e.target.checked;
      applySettings();
      saveSettings();
    });
  }

  if (appKey === "monitor") {
    const cpu = win.querySelector("#cpu");
    const ram = win.querySelector("#ram");
    const disk = win.querySelector("#disk");
    const netStat = win.querySelector("#netStat");
    const interval = setInterval(() => {
      if (!document.body.contains(win)) return clearInterval(interval);
      cpu.textContent = `${10 + Math.floor(Math.random() * 30)}%`;
      ram.textContent = `${30 + Math.floor(Math.random() * 40)}%`;
      disk.textContent = `${50 + Math.floor(Math.random() * 30)}%`;
      netStat.textContent = `${100 + Math.floor(Math.random() * 80)} Mbps`;
    }, 1200);
  }

  if (appKey === "notes") {
    const area = win.querySelector(".note");
    const noteId = key;
    const existing = notesStore.find((note) => note.id === noteId);
    if (!existing) {
      notesStore.push({ id: noteId, body: "" });
      saveNotes();
    }
    const stored = notesStore.find((note) => note.id === noteId);
    if (stored) area.value = stored.body;
    area.addEventListener("input", (e) => {
      const note = notesStore.find((item) => item.id === noteId);
      if (note) note.body = e.target.value;
      saveNotes();
    });
    area?.focus();
  }
}

function initDock() {
  dockButtons.forEach((btn) => {
    btn.addEventListener("click", () => createWindow(btn.dataset.app));
  });
}

function initDesktopIcons() {
  desktopIcons.forEach((icon) => {
    icon.addEventListener("dblclick", () => createWindow(icon.dataset.app));
  });
}

function renderLauncher(filter = "") {
  launcherGrid.innerHTML = "";
  const list = Object.entries(apps).filter(([key, app]) =>
    app.title.toLowerCase().includes(filter.toLowerCase())
  );
  list.forEach(([key, app]) => {
    const item = document.createElement("button");
    item.className = "launcher-item";
    item.innerHTML = `<strong>${app.title}</strong><span>${key}</span>`;
    item.addEventListener("click", () => {
      createWindow(key);
      toggleLauncher(false);
    });
    launcherGrid.appendChild(item);
  });
}

function toggleLauncher(force) {
  const shouldShow = typeof force === "boolean" ? force : !launcher.classList.contains("show");
  launcher.classList.toggle("show", shouldShow);
  if (shouldShow) {
    launcherSearch.focus();
    renderLauncher(launcherSearch.value);
  }
}

function hideContextMenu() {
  contextMenu.classList.remove("show");
  contextMenu.setAttribute("aria-hidden", "true");
}

function showContextMenu(x, y) {
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
  contextMenu.classList.add("show");
  contextMenu.setAttribute("aria-hidden", "false");
}

function initContextMenu() {
  desktop.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY);
  });

  document.addEventListener("click", () => hideContextMenu());

  contextMenu.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    if (!action) return;
    if (action === "refresh") {
      showToast("Desktop refreshed");
    }
    if (action === "new-terminal") {
      createWindow("terminal");
    }
    if (action === "new-note") {
      createWindow("notes");
    }
    if (action === "toggle-glow") {
      settingsStore.glow = !settingsStore.glow;
      applySettings();
      saveSettings();
    }
    hideContextMenu();
  });
}

launcherBtn.addEventListener("click", () => toggleLauncher());
launcherSearch.addEventListener("input", (e) => renderLauncher(e.target.value));

window.addEventListener("click", (e) => {
  if (!launcher.contains(e.target) && e.target !== launcherBtn) {
    toggleLauncher(false);
  }
});

window.addEventListener("resize", () => {
  windows.forEach((win) => bringToFront(win));
});

applySettings();
initDock();
initDesktopIcons();
initContextMenu();
renderLauncher();

tickClock();
setInterval(tickClock, 1000 * 30);

createWindow("terminal");
showToast("Welcome to Omos OS");
