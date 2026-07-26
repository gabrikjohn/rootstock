export type ChoiceResolver = (correct: boolean, picked: string) => void;

export function wireChoices(app: HTMLElement, resolve: ChoiceResolver): void {
  const choices = [...app.querySelectorAll<HTMLButtonElement>(".choice")];
  choices.forEach((choice) => {
    choice.onclick = () => {
      if (choice.classList.contains("locked")) return;
      choices.forEach((item) => item.classList.add("locked"));
      const correct = choice.dataset.ok === "true";
      choice.classList.add(correct ? "correct" : "wrong");
      if (!correct) {
        choices.find((item) => item.dataset.ok === "true")?.classList.add("correct");
      }
      const picked = choice.querySelectorAll("span")[1]?.textContent ?? "";
      resolve(correct, picked);
    };
  });
}

export function applyPredictionVeil(app: HTMLElement, enabled: boolean): void {
  if (!enabled) return;
  const target = app.querySelector<HTMLElement>(".choices, .chipbank");
  if (!target?.parentNode) return;
  target.classList.add("veiled");
  const prompt = document.createElement("label");
  prompt.className = "veil-prompt";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  prompt.append(checkbox, document.createTextNode("What's your prediction?"));
  target.parentNode.insertBefore(prompt, target);
  checkbox.onchange = () => {
    if (!checkbox.checked) return;
    target.classList.remove("veiled");
    checkbox.disabled = true;
  };
}

export function applyRootLearningPrompt(app: HTMLElement, enabled: boolean): void {
  if (!enabled) return;
  const verdict = app.querySelector<HTMLElement>("#v");
  if (!verdict?.parentNode) return;
  const prompt = document.createElement("label");
  prompt.className = "learn-prompt";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  prompt.append(checkbox, document.createTextNode("Learn more about this root"));
  verdict.parentNode.insertBefore(prompt, verdict);
}
