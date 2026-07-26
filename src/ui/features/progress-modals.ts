function closeModal(): void {
  document.querySelector("#modal-scrim")?.remove();
}

function createScrim(content: string): HTMLDivElement {
  const scrim = document.createElement("div");
  scrim.className = "modal-scrim";
  scrim.id = "modal-scrim";
  scrim.innerHTML = content;
  document.body.appendChild(scrim);
  const cancel = scrim.querySelector<HTMLButtonElement>("#cancel");
  if (cancel) cancel.onclick = closeModal;
  scrim.addEventListener("click", (event) => {
    if (event.target === scrim) closeModal();
  });
  return scrim;
}

export function showBackupModal(code: string): void {
  const scrim = createScrim(`<div class="modal">
    <h3>Backup Code</h3>
    <p>Copy this code and keep it somewhere safe. Paste it into Restore on any device to recover your progress as of this moment.</p>
    <textarea id="code" readonly style="min-height:110px">${code}</textarea>
    <div class="actions">
      <button class="btn" id="copy">Copy code</button>
      <button class="btn ghost" id="cancel">Done</button>
    </div>
    <div class="msg" id="msg"></div>
  </div>`);
  const textarea = scrim.querySelector<HTMLTextAreaElement>("#code");
  const copy = scrim.querySelector<HTMLButtonElement>("#copy");
  const message = scrim.querySelector<HTMLElement>("#msg");
  if (!textarea || !copy || !message) throw new Error("Backup modal failed to render");
  textarea.onclick = () => textarea.select();
  copy.onclick = () => {
    textarea.select();
    const done = (): void => {
      message.textContent = "Copied.";
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(done, () => {
        document.execCommand("copy");
        done();
      });
    } else {
      document.execCommand("copy");
      done();
    }
  };
}

interface RestoreModalOptions {
  restore(code: string): boolean;
  onRestored(): void;
}

export function showRestoreModal(options: RestoreModalOptions): void {
  const scrim = createScrim(`<div class="modal">
    <h3>Restore Progress</h3>
    <p>Paste a saved code below. This replaces your current progress on this device.</p>
    <textarea id="code" placeholder="paste your code here…"></textarea>
    <div class="actions">
      <button class="btn" id="do">Restore</button>
      <button class="btn ghost" id="cancel">Cancel</button>
    </div>
    <div class="msg" id="msg"></div>
  </div>`);
  const textarea = scrim.querySelector<HTMLTextAreaElement>("#code");
  const restore = scrim.querySelector<HTMLButtonElement>("#do");
  const message = scrim.querySelector<HTMLElement>("#msg");
  if (!textarea || !restore || !message) throw new Error("Restore modal failed to render");
  restore.onclick = () => {
    if (!options.restore(textarea.value)) {
      message.className = "msg bad";
      message.textContent = "That code could not be read.";
      return;
    }
    closeModal();
    options.onRestored();
  };
}
