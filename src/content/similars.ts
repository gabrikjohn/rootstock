import type { StringListMap, StringMap } from "../types/content";

export const SIMILARS = {
  "similis": [
    "simulare"
  ],
  "simulare": [
    "similis"
  ],
  "vir": [
    "vivere"
  ],
  "vivere": [
    "vir"
  ],
  "verus": [
    "vertere / versus"
  ],
  "vertere / versus": [
    "verus"
  ],
  "mori / mort-": [
    "mos"
  ],
  "mos": [
    "mori / mort-"
  ],
  "pater": [
    "patria"
  ],
  "patria": [
    "pater"
  ],
  "gauche": [
    "droit"
  ],
  "droit": [
    "gauche"
  ]
} satisfies StringListMap;

export const SIMILAR_GLOSSES = {
  "mos": "custom, habit",
  "patria": "fatherland"
} satisfies StringMap;
