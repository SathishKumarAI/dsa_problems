// Shared UI preferences (all pages). Owns: theme + reduce-motion + default
// speed (settings gear, injected into the header), sidebar resize handle +
// width persistence, focus mode (#btn-focus / f / Esc). Not: any
// visualizer/playback state. Load in <head> so theme/motion attributes are
// set before first paint — no dark→light flash.
(() => {
  const theme =
    localStorage.getItem("theme") ||
    (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.dataset.theme = theme;

  const savedMotion = localStorage.getItem("reduceMotion");
  if (
    savedMotion === "1" ||
    (savedMotion === null && matchMedia("(prefers-reduced-motion: reduce)").matches)
  ) {
    document.documentElement.classList.add("reduce-motion");
  }

  // settings gear: appended to <header>, native <details> handles open/close
  document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    if (!header) return;
    const speedEl = document.getElementById("speed");

    const details = document.createElement("details");
    details.id = "settings";
    details.innerHTML =
      `<summary title="settings" aria-label="settings">⚙</summary>
       <div id="settings-panel">
         <label>theme
           <select id="set-theme">
             <option value="dark">dark</option>
             <option value="light">light</option>
           </select>
         </label>
         ${speedEl ? `<label>default speed <input id="set-speed" type="range" min="1" max="100"></label>` : ""}
         <label><input type="checkbox" id="set-motion"> reduce motion</label>
       </div>`;
    header.appendChild(details);

    const themeSel = details.querySelector("#set-theme");
    themeSel.value = document.documentElement.dataset.theme;
    themeSel.onchange = () => {
      document.documentElement.dataset.theme = themeSel.value;
      localStorage.setItem("theme", themeSel.value);
    };

    const motionEl = details.querySelector("#set-motion");
    motionEl.checked = document.documentElement.classList.contains("reduce-motion");
    motionEl.onchange = () => {
      document.documentElement.classList.toggle("reduce-motion", motionEl.checked);
      localStorage.setItem("reduceMotion", motionEl.checked ? "1" : "0");
    };

    if (speedEl) {
      const saved = Number(localStorage.getItem("speed"));
      if (saved) {
        speedEl.value = saved;
        // main.js/journey.js assigned oninput before DOMContentLoaded fires,
        // so this event applies the saved speed to the player
        speedEl.dispatchEvent(new Event("input"));
      }
      const setSpeed = details.querySelector("#set-speed");
      setSpeed.value = speedEl.value;
      setSpeed.oninput = () => {
        speedEl.value = setSpeed.value;
        speedEl.dispatchEvent(new Event("input"));
        localStorage.setItem("speed", setSpeed.value);
      };
      speedEl.addEventListener("input", () => {
        setSpeed.value = speedEl.value;
        localStorage.setItem("speed", speedEl.value);
      });
    }
  });

  // sidebar resize: drag handle inserted before #side, width saved per page
  document.addEventListener("DOMContentLoaded", () => {
    const side = document.getElementById("side");
    if (!side) return;
    const key = "sideWidth:" + location.pathname;
    const saved = Number(localStorage.getItem(key));
    if (saved) side.style.width = saved + "px";

    const handle = document.createElement("div");
    handle.id = "resize-handle";
    handle.title = "drag to resize · double-click to reset";
    side.parentNode.insertBefore(handle, side);

    handle.onpointerdown = (e) => {
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startW = side.offsetWidth;
      handle.onpointermove = (ev) => {
        const w = Math.min(600, Math.max(220, startW + (startX - ev.clientX)));
        side.style.width = w + "px";
      };
      handle.onpointerup = () => {
        handle.onpointermove = null;
        localStorage.setItem(key, side.offsetWidth);
      };
    };
    handle.ondblclick = () => {
      side.style.width = "";
      localStorage.removeItem(key);
    };
  });

  // keyboard-shortcut overlay: ? opens a native <dialog>; replaces the
  // unscalable footer hint text on any page that has a #keys span
  document.addEventListener("DOMContentLoaded", () => {
    const keysEl = document.getElementById("keys");
    if (!keysEl) return;
    const dlg = document.createElement("dialog");
    dlg.id = "shortcuts";
    const rows = [
      ["space", "play / pause"],
      ["← →", "step back / forward"],
      ["r", "reset to the start"],
      ["f", "focus mode (visualization only)"],
      ["Esc", "exit focus mode / close this"],
      ["drag timeline", "scrub anywhere in the run"],
      ["?", "this overlay"],
    ];
    dlg.innerHTML =
      `<h2>keyboard shortcuts</h2><table>` +
      rows.map(([k, d]) => `<tr><td><kbd>${k}</kbd></td><td>${d}</td></tr>`).join("") +
      `</table><button id="shortcuts-close">close (Esc)</button>`;
    document.body.appendChild(dlg);
    dlg.querySelector("#shortcuts-close").onclick = () => dlg.close();
    dlg.onclick = (e) => {
      if (e.target === dlg) dlg.close(); // backdrop click
    };
    keysEl.innerHTML = `<button id="keys-btn" title="keyboard shortcuts">? shortcuts</button>`;
    keysEl.querySelector("#keys-btn").onclick = () => dlg.showModal();
    document.addEventListener("keydown", (e) => {
      if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "?") dlg.open ? dlg.close() : dlg.showModal();
    });
  });

  // focus mode: strip the page down to the visualization + playback controls
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-focus");
    if (!btn) return;
    const paint = () => {
      const on = document.body.classList.contains("focus");
      btn.textContent = on ? "✕ Exit" : "⛶ Focus";
      btn.title = on ? "exit focus mode (Esc)" : "focus mode (f)";
    };
    const toggle = (force) => {
      document.body.classList.toggle("focus", force);
      paint();
    };
    btn.onclick = () => toggle();
    document.addEventListener("keydown", (e) => {
      if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (document.querySelector("dialog[open]")) return; // Esc belongs to the dialog
      if (e.key === "f") toggle();
      else if (e.key === "Escape") toggle(false);
    });
    paint();
  });
})();
