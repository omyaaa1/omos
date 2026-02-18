const desktop = document.getElementById("desktop");
const activeApp = document.getElementById("activeApp");
const clock = document.getElementById("clock");

const windowTemplate = document.getElementById("windowTemplate");
const dockButtons = document.querySelectorAll(".dock-btn");

let zIndexTop = 10;
const windows = new Map();

const apps = {
  terminal: {
    title: "Terminal",
    width: 520,
    height: 320,
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
    height: 340,
    content: () => `
      <div class="files-grid">
        <div class="file-card">Documents</div>
        <div class="file-card">Downloads</div>
        <div class="file-card">Projects</div>
        <div class="file-card">Wallpapers</div>
        <div class="file-card">Notes</div>
      </div>
    `
  },
  browser: {
    title: "Browser",
    width: 640,
    height: 360,
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
    content: () => `
      <div class="settings-group">
        <div class="toggle">
          <span>Ambient glow</span>
          <input id="glowToggle" type="checkbox" checked />
        </div>
        <div class="toggle">
          <span>Show noise overlay</span>
          <input id="noiseToggle" type="checkbox" checked />
        </div>
        <div class="toggle">
          <span>Dock transparency</span>
          <input id="dockToggle" type="checkbox" checked />
        </div>
      </div>
    `
  },
  about: {
    title: "About",
    width: 480,
    height: 280,
    content: () => `
      <div class="file-card">
        <div class="badge">Omos OS</div>
        <p>Cyber-inspired web desktop with a Kali-like vibe.</p>
        <p>Built for speed, style, and playful interfaces.</p>
      </div>
    `
  }
};

function tickClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  clock.textContent = time;
}

function bringToFront(win) {
  zIndexTop += 1;
  win.style.zIndex = zIndexTop;
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

function createWindow(appKey) {
  const app = apps[appKey];
  if (!app) return;

  if (windows.has(appKey)) {
    const existing = windows.get(appKey);
    existing.classList.remove("minimized");
    bringToFront(existing);
    activeApp.textContent = app.title;
    return;
  }

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
        windows.delete(appKey);
        activeApp.textContent = "Desktop";
      }
      if (action === "minimize") {
        win.classList.add("minimized");
        activeApp.textContent = "Desktop";
      }
    });
  });

  desktop.appendChild(win);
  windows.set(appKey, win);
  activeApp.textContent = app.title;

  if (appKey === "settings") {
    const glowToggle = win.querySelector("#glowToggle");
    const noiseToggle = win.querySelector("#noiseToggle");
    const dockToggle = win.querySelector("#dockToggle");
    glowToggle.addEventListener("change", (e) => {
      document.body.style.filter = e.target.checked ? "none" : "saturate(0.9)";
    });
    noiseToggle.addEventListener("change", (e) => {
      document.querySelector(".noise").style.display = e.target.checked ? "block" : "none";
    });
    dockToggle.addEventListener("change", (e) => {
      document.querySelector(".dock").style.background = e.target.checked
        ? "rgba(9, 12, 18, 0.6)"
        : "rgba(9, 12, 18, 0.9)";
    });
  }
}

function initDock() {
  dockButtons.forEach((btn) => {
    btn.addEventListener("click", () => createWindow(btn.dataset.app));
  });
}

window.addEventListener("resize", () => {
  windows.forEach((win) => bringToFront(win));
});

initDock();
tickClock();
setInterval(tickClock, 1000 * 30);

createWindow("terminal");
