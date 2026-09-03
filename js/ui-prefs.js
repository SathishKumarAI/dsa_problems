// Shared UI preferences (all pages). Owns: theme choice + #btn-theme wiring,
// sidebar resize handle + width persistence. Not: any visualizer/playback
// state. Load in <head> so the theme attribute is set before first paint —
// no dark→light flash.
(() => {
  const saved = localStorage.getItem("theme");
  const theme =
    saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  document.documentElement.dataset.theme = theme;

  function paint(btn) {
    const light = document.documentElement.dataset.theme === "light";
    btn.textContent = light ? "🌙" : "☀";
    btn.title = light ? "switch to dark theme" : "switch to light theme";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-theme");
    if (!btn) return;
    paint(btn);
    btn.onclick = () => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      localStorage.setItem("theme", next);
      paint(btn);
    };
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
})();
