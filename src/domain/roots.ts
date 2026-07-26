import type { Root } from "../types/content";

export function splitRootEntry(root: Root): Root[] {
  if (!root.root.includes(" + ")) return [root];
  const roots = root.root.split(" + ").map((part) => part.trim());
  const glosses = root.gloss.includes(" + ")
    ? root.gloss.split(" + ").map((part) => part.trim())
    : roots.map(() => root.gloss);
  return roots.map((part, index) => ({
    root: part,
    lang: root.lang,
    gloss: glosses[index] ?? glosses[0] ?? root.gloss,
    compoundOf: root.root
  }));
}

export function withRootKeys(root: Root): Root {
  return {
    ...root,
    key: root.compoundOf ? `${root.compoundOf}::${root.root}` : root.root
  };
}

export function normalizeRoot(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

export function rootForms(root: Pick<Root, "root">): string[] {
  return root.root.split(/[\/,]/).map((part) => part.trim()).filter(Boolean);
}

export function rootMatches(input: string, root: Pick<Root, "root">): boolean {
  const normalized = normalizeRoot(input);
  return Boolean(normalized) && rootForms(root).some((form) => normalizeRoot(form) === normalized);
}
