export function registerPwa(): void {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js", { scope: "./" }).catch(() => {
      // The app remains usable when service workers are unavailable.
    });
  });
}
