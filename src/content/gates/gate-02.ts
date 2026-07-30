import type { Gate } from "../../types/content";

export const gate02 = {
  "id": 2,
  "title": "The Doctors",
  "theme": "Ten specialists, named by the organ or patient they serve.",
  "roots": [
    {
      "root": "internus",
      "lang": "Latin",
      "gloss": "within"
    },
    {
      "root": "obstetrix",
      "lang": "Latin",
      "gloss": "midwife"
    },
    {
      "root": "pais, paidos",
      "lang": "Greek",
      "gloss": "child"
    },
    {
      "root": "derma",
      "lang": "Greek",
      "gloss": "skin"
    },
    {
      "root": "ophthalmos",
      "lang": "Greek",
      "gloss": "eye"
    },
    {
      "root": "orthos",
      "lang": "Greek",
      "gloss": "straight, correct"
    },
    {
      "root": "kardia",
      "lang": "Greek",
      "gloss": "heart"
    },
    {
      "root": "neuron",
      "lang": "Greek",
      "gloss": "nerve"
    },
    {
      "root": "psyche",
      "lang": "Greek",
      "gloss": "mind, soul"
    },
    {
      "root": "iatreia",
      "lang": "Greek",
      "gloss": "healing"
    },
    {
      "root": "oculus",
      "lang": "Latin",
      "gloss": "eye"
    }
  ],
  "words": [
    {
      "word": "internist",
      "pos": "n.",
      "parts": [
        [
          "intern",
          "within"
        ],
        [
          "ist",
          "one who"
        ]
      ],
      "pron": "in-TUR-nist",
      "def": "A physician of the internal organs.",
      "sentence": "Her internist ordered bloodwork before naming the ailment.",
      "distractors": [
        "A physician for infants and children.",
        "A physician of the nervous system.",
        "A physician of the health of women."
      ],
      "kin": [
        "internal medicine"
      ]
    },
    {
      "word": "obstetrician",
      "pos": "n.",
      "parts": [
        [
          "obstetr",
          "midwife"
        ],
        [
          "ician",
          "specialist"
        ]
      ],
      "pron": "ob-stuh-TRISH-un",
      "def": "A physician of pregnancy and childbirth.",
      "sentence": "The obstetrician was paged at midnight for the delivery.",
      "distractors": [
        "A physician of the skin and its diseases.",
        "An eye physician, licensed for surgery.",
        "A physician of the bones and joints."
      ],
      "kin": [
        "obstetrics",
        "obstetric"
      ]
    },
    {
      "word": "pediatrician",
      "pos": "n.",
      "parts": [
        [
          "ped",
          "child"
        ],
        [
          "iatr",
          "healing"
        ],
        [
          "ician",
          "specialist"
        ]
      ],
      "pron": "pee-dee-uh-TRISH-un",
      "def": "A physician for infants and children.",
      "sentence": "The pediatrician charted the newborn's weight gain weekly.",
      "distractors": [
        "An eye physician, licensed for surgery.",
        "A physician of the bones and joints.",
        "A physician of the nervous system."
      ],
      "kin": [
        "pediatrics",
        "pediatric"
      ]
    },
    {
      "word": "dermatologist",
      "pos": "n.",
      "parts": [
        [
          "dermato",
          "skin"
        ],
        [
          "log",
          "study"
        ],
        [
          "ist",
          "one who"
        ]
      ],
      "pron": "dur-muh-TOL-uh-jist",
      "def": "A physician of the skin and its diseases.",
      "sentence": "The dermatologist froze the lesion off in seconds.",
      "distractors": [
        "A physician of the disorders of the mind.",
        "A physician of pregnancy and childbirth.",
        "A physician for infants and children."
      ],
      "kin": [
        "dermatology",
        "dermal"
      ]
    },
    {
      "word": "ophthalmologist",
      "pos": "n.",
      "parts": [
        [
          "ophthalmo",
          "eye"
        ],
        [
          "log",
          "study"
        ],
        [
          "ist",
          "one who"
        ]
      ],
      "pron": "of-thal-MOL-uh-jist",
      "def": "An eye physician, licensed for surgery.",
      "sentence": "The ophthalmologist repaired the torn retina that afternoon.",
      "distractors": [
        "A physician of the skin and its diseases.",
        "A physician specializing in the heart.",
        "A physician of the health of women."
      ],
      "kin": [
        "ophthalmology",
        "ophthalmic"
      ]
    },
    {
      "word": "orthopedist",
      "pos": "n.",
      "parts": [
        [
          "ortho",
          "straight"
        ],
        [
          "ped",
          "child"
        ],
        [
          "ist",
          "one who"
        ]
      ],
      "pron": "or-thuh-PEE-dist",
      "def": "A physician of the bones and joints.",
      "sentence": "The orthopedist set the fracture and cast it.",
      "distractors": [
        "A physician specializing in the heart.",
        "A physician of the health of women.",
        "A physician of the nervous system."
      ],
      "kin": [
        "orthopedics",
        "orthopedic"
      ]
    },
    {
      "word": "cardiologist",
      "pos": "n.",
      "parts": [
        [
          "cardio",
          "heart"
        ],
        [
          "log",
          "study"
        ],
        [
          "ist",
          "one who"
        ]
      ],
      "pron": "kar-dee-OL-uh-jist",
      "def": "A physician specializing in the heart.",
      "sentence": "The cardiologist read the arrhythmia off the monitor.",
      "distractors": [
        "A physician of pregnancy and childbirth.",
        "A physician for infants and children.",
        "A physician of the nervous system."
      ],
      "kin": [
        "cardiology",
        "cardiac"
      ]
    },
    {
      "word": "neurologist",
      "pos": "n.",
      "parts": [
        [
          "neuro",
          "nerve"
        ],
        [
          "log",
          "study"
        ],
        [
          "ist",
          "one who"
        ]
      ],
      "pron": "noo-ROL-uh-jist",
      "def": "A physician of the nervous system.",
      "sentence": "The neurologist mapped the tremor to a single nerve.",
      "distractors": [
        "A physician of the bones and joints.",
        "A physician of the health of women.",
        "A physician of the internal organs."
      ],
      "kin": [
        "neurology",
        "neural"
      ]
    },
    {
      "word": "psychiatrist",
      "pos": "n.",
      "parts": [
        [
          "psych",
          "mind"
        ],
        [
          "iatr",
          "healing"
        ],
        [
          "ist",
          "one who"
        ]
      ],
      "pron": "sy-KY-uh-trist",
      "def": "A physician of the disorders of the mind.",
      "sentence": "The psychiatrist adjusted the prescription at each visit.",
      "distractors": [
        "A physician of the skin and its diseases.",
        "A physician of pregnancy and childbirth.",
        "A physician for infants and children."
      ],
      "kin": [
        "psychiatry",
        "psychiatric"
      ]
    },
    {
      "word": "gynecologist",
      "pos": "n.",
      "parts": [
        [
          "gyneco",
          "woman"
        ],
        [
          "log",
          "study"
        ],
        [
          "ist",
          "one who"
        ]
      ],
      "pron": "gy-nuh-KOL-uh-jist",
      "def": "A physician of the health of women.",
      "sentence": "Her gynecologist found the cyst on a routine pelvic exam.",
      "distractors": [
        "A physician for infants and children.",
        "A physician of the nervous system.",
        "A physician of the internal organs."
      ],
      "kin": [
        "gynecology",
        "gynecological"
      ]
    }
  ]
} satisfies Gate;
