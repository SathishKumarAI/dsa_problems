// Shared UI preferences (all pages). Owns: theme choice + #btn-theme wiring.
// Not: any visualizer/playback state. Load in <head> so the theme attribute is
// set before first paint — no dark→light flash.
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
})();
