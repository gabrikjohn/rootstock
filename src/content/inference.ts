import type { InferenceWord } from "../types/content";

export const INFER_POOL = [
  {
    "word": "oculist",
    "pos": "n.",
    "parts": [
      [
        "ocul",
        "eye"
      ],
      [
        "ist",
        "one who"
      ]
    ],
    "req": 1,
    "def": "a specialist in disorders of the eye",
    "distractors": [
      "an admirer of England and English ways",
      "one who denies the existence of God",
      "social and political rule by men"
    ],
    "roots": "oculus (Latin: eye) — the older title for an ophthalmologist"
  },
  {
    "word": "orthography",
    "pos": "n.",
    "parts": [
      [
        "ortho",
        "straight, correct"
      ],
      [
        "graphy",
        "writing"
      ]
    ],
    "req": 2,
    "def": "correct or conventional spelling",
    "distractors": [
      "the measurement of mental capacities",
      "the care of the hands and feet",
      "handwriting; penmanship"
    ],
    "roots": "orthos (correct) + graphein (to write)"
  },
  {
    "word": "cardiography",
    "pos": "n.",
    "parts": [
      [
        "cardio",
        "heart"
      ],
      [
        "graphy",
        "writing"
      ]
    ],
    "req": 2,
    "def": "the recording of the heart's activity",
    "distractors": [
      "the measurement of mental capacities",
      "correct or conventional spelling",
      "the care of the hands and feet"
    ],
    "roots": "kardia (heart) + graphein (to write)"
  },
  {
    "word": "psychometry",
    "pos": "n.",
    "parts": [
      [
        "psycho",
        "mind"
      ],
      [
        "metry",
        "measure"
      ]
    ],
    "req": 2,
    "def": "the measurement of mental capacities",
    "distractors": [
      "the recording of the heart's activity",
      "correct or conventional spelling",
      "the care of the hands and feet"
    ],
    "roots": "psyche (mind) + metron (measure)"
  },
  {
    "word": "chiropody",
    "pos": "n.",
    "parts": [
      [
        "chiro",
        "hand"
      ],
      [
        "pody",
        "foot"
      ]
    ],
    "req": 2,
    "def": "the care of the hands and feet",
    "distractors": [
      "correct or conventional spelling",
      "handwriting; penmanship",
      "the measurement of mental capacities"
    ],
    "roots": "cheir (hand) + pous, podos (foot)"
  },
  {
    "word": "chirography",
    "pos": "n.",
    "parts": [
      [
        "chiro",
        "hand"
      ],
      [
        "graphy",
        "writing"
      ]
    ],
    "req": 2,
    "def": "handwriting; penmanship",
    "distractors": [
      "the care of the hands and feet",
      "correct or conventional spelling",
      "the measurement of mental capacities"
    ],
    "roots": "cheir (hand) + graphein (to write)"
  },
  {
    "word": "zoography",
    "pos": "n.",
    "parts": [
      [
        "zoo",
        "animal"
      ],
      [
        "graphy",
        "writing"
      ]
    ],
    "req": 3,
    "def": "the descriptive study of animals",
    "distractors": [
      "the measurement of living things",
      "one who reads fate in the stars",
      "devoted to the love of music"
    ],
    "roots": "zoion (animal) + graphein (to write)"
  },
  {
    "word": "nomology",
    "pos": "n.",
    "parts": [
      [
        "nomo",
        "law"
      ],
      [
        "logy",
        "study"
      ]
    ],
    "req": 3,
    "def": "the science of law and lawmaking",
    "distractors": [
      "the descriptive study of animals",
      "one who reads fate in the stars",
      "devoted to the love of music"
    ],
    "roots": "nomos (law) + logos (study)"
  },
  {
    "word": "biometry",
    "pos": "n.",
    "parts": [
      [
        "bio",
        "life"
      ],
      [
        "metry",
        "measure"
      ]
    ],
    "req": 3,
    "def": "the measurement of living things",
    "distractors": [
      "the descriptive study of animals",
      "one who reads fate in the stars",
      "devoted to the love of music"
    ],
    "roots": "bios (life) + metron (measure)"
  },
  {
    "word": "philogyny",
    "pos": "n.",
    "parts": [
      [
        "philo",
        "lover of"
      ],
      [
        "gyny",
        "woman"
      ]
    ],
    "req": 3,
    "def": "love of or fondness for women",
    "distractors": [
      "one who reads fate in the stars",
      "devoted to the love of music",
      "one who loves and aids mankind"
    ],
    "roots": "philein (to love) + gyne (woman)"
  },
  {
    "word": "philanthropist",
    "pos": "n.",
    "parts": [
      [
        "phil",
        "loving"
      ],
      [
        "anthrop",
        "mankind"
      ],
      [
        "ist",
        "one who"
      ]
    ],
    "req": 3,
    "def": "one who loves and aids mankind",
    "distractors": [
      "the science of law and lawmaking",
      "love of or fondness for women",
      "devoted to the love of music"
    ],
    "roots": "philein (to love) + anthropos (mankind)"
  },
  {
    "word": "philosophy",
    "pos": "n.",
    "parts": [
      [
        "philo",
        "loving"
      ],
      [
        "sophy",
        "wisdom"
      ]
    ],
    "req": 3,
    "def": "the love and pursuit of wisdom",
    "distractors": [
      "the science of law and lawmaking",
      "love of or fondness for women",
      "devoted to the love of music"
    ],
    "roots": "philein (to love) + sophia (wisdom)"
  },
  {
    "word": "logophile",
    "pos": "n.",
    "parts": [
      [
        "logo",
        "word"
      ],
      [
        "phile",
        "lover of"
      ]
    ],
    "req": 3,
    "def": "a lover of words",
    "distractors": [
      "devoted to the love of music",
      "love of or fondness for women",
      "one who loves and aids mankind"
    ],
    "roots": "logos (word) + philein (to love)"
  },
  {
    "word": "philharmonic",
    "pos": "adj.",
    "parts": [
      [
        "phil",
        "loving"
      ],
      [
        "harmonic",
        "harmony"
      ]
    ],
    "req": 3,
    "def": "devoted to the love of music",
    "distractors": [
      "one who loves and aids mankind",
      "love of or fondness for women",
      "the love and pursuit of wisdom"
    ],
    "roots": "philein (to love) + harmonia (harmony)"
  },
  {
    "word": "philately",
    "pos": "n.",
    "parts": [
      [
        "phil",
        "loving"
      ],
      [
        "ately",
        "tax exemption"
      ]
    ],
    "req": 3,
    "def": "the collecting of postage stamps",
    "distractors": [
      "the measurement of living things",
      "one who reads fate in the stars",
      "devoted to the love of music"
    ],
    "roots": "philein (to love) + ateleia (exemption from tax — a stamp shows postage prepaid)"
  },
  {
    "word": "astrologer",
    "pos": "n.",
    "parts": [
      [
        "astro",
        "star"
      ],
      [
        "log",
        "study"
      ],
      [
        "er",
        "one who"
      ]
    ],
    "req": 3,
    "def": "one who reads fate in the stars",
    "distractors": [
      "the science of law and lawmaking",
      "the love and pursuit of wisdom",
      "devoted to the love of music"
    ],
    "roots": "astron (star) + logos (study) — the star-reader, as distinct from the star-scientist"
  },
  {
    "word": "pathography",
    "pos": "n.",
    "parts": [
      [
        "patho",
        "suffering"
      ],
      [
        "graphy",
        "writing"
      ]
    ],
    "req": 4,
    "def": "a biography focused on illness",
    "distractors": [
      "the measurement of living things",
      "at home anywhere in the world",
      "the chief city of a region"
    ],
    "roots": "pathos (suffering) + graphein (to write)"
  },
  {
    "word": "neuropathy",
    "pos": "n.",
    "parts": [
      [
        "neuro",
        "nerve"
      ],
      [
        "pathy",
        "disease"
      ]
    ],
    "req": 4,
    "def": "disease or disorder of the nerves",
    "distractors": [
      "one who denies the existence of God",
      "the descriptive study of animals",
      "at home anywhere in the world"
    ],
    "roots": "neuron (nerve) + pathos (disease)"
  },
  {
    "word": "malversation",
    "pos": "n.",
    "parts": [
      [
        "mal",
        "bad"
      ],
      [
        "vers",
        "to turn"
      ],
      [
        "ation",
        ""
      ]
    ],
    "req": 5,
    "def": "corrupt conduct in public office",
    "distractors": [
      "deliberate treachery; broken faith",
      "wishing evil or harm to others",
      "reasoning clever but deceptive"
    ],
    "roots": "malus (bad) + vertere (to turn)"
  },
  {
    "word": "sophistry",
    "pos": "n.",
    "parts": [
      [
        "soph",
        "wisdom"
      ],
      [
        "istry",
        "practice of"
      ]
    ],
    "req": 5,
    "def": "reasoning clever but deceptive",
    "distractors": [
      "corrupt conduct in public office",
      "wishing evil or harm to others",
      "overconfident and immature"
    ],
    "roots": "sophia (wisdom) — via sophistes, a paid teacher of clever argument"
  },
  {
    "word": "sophomoric",
    "pos": "adj.",
    "parts": [
      [
        "sopho",
        "wise"
      ],
      [
        "moric",
        "foolish"
      ]
    ],
    "req": 5,
    "def": "overconfident and immature",
    "distractors": [
      "wishing evil or harm to others",
      "one who rejects the faith",
      "a raw beginner; a novice"
    ],
    "roots": "sophos (wise) + moros (foolish) — literally a 'wise fool'"
  },
  {
    "word": "perfidy",
    "pos": "n.",
    "parts": [
      [
        "per",
        "away"
      ],
      [
        "fid",
        "faith"
      ],
      [
        "y",
        ""
      ]
    ],
    "req": 5,
    "def": "deliberate treachery; broken faith",
    "distractors": [
      "to excite pleasantly, as by tickling",
      "corrupt conduct in public office",
      "wishing evil or harm to others"
    ],
    "roots": "per- (away) + fides (faith)"
  },
  {
    "word": "infidel",
    "pos": "n.",
    "parts": [
      [
        "in",
        "not"
      ],
      [
        "fidel",
        "faithful"
      ]
    ],
    "req": 5,
    "def": "one who rejects the faith",
    "distractors": [
      "overconfident and immature",
      "a raw beginner; a novice",
      "wishing evil or harm to others"
    ],
    "roots": "in- (not) + fides (faith)"
  },
  {
    "word": "malevolent",
    "pos": "adj.",
    "parts": [
      [
        "male",
        "bad"
      ],
      [
        "vol",
        "to wish"
      ],
      [
        "ent",
        ""
      ]
    ],
    "req": 5,
    "def": "wishing evil or harm to others",
    "distractors": [
      "corrupt conduct in public office",
      "reasoning clever but deceptive",
      "overconfident and immature"
    ],
    "roots": "malus (bad) + velle, volo (to wish)"
  },
  {
    "word": "dissimulate",
    "pos": "v.",
    "parts": [
      [
        "dis",
        "apart"
      ],
      [
        "simul",
        "to pretend"
      ],
      [
        "ate",
        ""
      ]
    ],
    "req": 4,
    "def": "to hide true feelings behind a mask",
    "distractors": [
      "the recording of the heart's activity",
      "the practice of having one husband",
      "one who reads fate in the stars"
    ],
    "roots": "dis- (apart) + simulare (to pretend) — to simulate feigns what is false; to dissimulate conceals what is true"
  },
  {
    "word": "titillate",
    "pos": "v.",
    "parts": [
      [
        "titill",
        "to tickle"
      ],
      [
        "ate",
        ""
      ]
    ],
    "req": 5,
    "def": "to excite pleasantly, as by tickling",
    "distractors": [
      "off center; departing from the norm",
      "deliberate treachery; broken faith",
      "corrupt conduct in public office"
    ],
    "roots": "titillare (to tickle)"
  },
  {
    "word": "tyro",
    "pos": "n.",
    "parts": [
      [
        "tyro",
        "recruit"
      ]
    ],
    "req": 5,
    "def": "a raw beginner; a novice",
    "distractors": [
      "overconfident and immature",
      "one who rejects the faith",
      "wishing evil or harm to others"
    ],
    "roots": "tiro (Latin: a newly recruited soldier)"
  },
  {
    "word": "eccentric",
    "pos": "adj.",
    "parts": [
      [
        "ec",
        "out of"
      ],
      [
        "centr",
        "center"
      ],
      [
        "ic",
        ""
      ]
    ],
    "req": 5,
    "def": "off center; departing from the norm",
    "distractors": [
      "to excite pleasantly, as by tickling",
      "deliberate treachery; broken faith",
      "wishing evil or harm to others"
    ],
    "roots": "ek- (out of) + kentron (center)"
  },
  {
    "word": "verbatim",
    "pos": "adv.",
    "parts": [
      [
        "verb",
        "word"
      ],
      [
        "atim",
        "by, in order"
      ]
    ],
    "req": 6,
    "def": "in exactly the same words",
    "distractors": [
      "possessing unlimited power",
      "eating every kind of food",
      "knowing all things"
    ],
    "roots": "verbum (word)"
  },
  {
    "word": "insomnia",
    "pos": "n.",
    "parts": [
      [
        "in",
        "not"
      ],
      [
        "somn",
        "sleep"
      ],
      [
        "ia",
        "condition"
      ]
    ],
    "req": 6,
    "def": "the chronic inability to sleep",
    "distractors": [
      "one who walks in his sleep",
      "possessing unlimited power",
      "in exactly the same words"
    ],
    "roots": "in- (not) + somnus (sleep)"
  },
  {
    "word": "somnambulist",
    "pos": "n.",
    "parts": [
      [
        "somn",
        "sleep"
      ],
      [
        "ambul",
        "to walk"
      ],
      [
        "ist",
        "one who"
      ]
    ],
    "req": 6,
    "def": "one who walks in his sleep",
    "distractors": [
      "the chronic inability to sleep",
      "eating every kind of food",
      "in exactly the same words"
    ],
    "roots": "somnus (sleep) + ambulare (to walk)"
  },
  {
    "word": "omniscient",
    "pos": "adj.",
    "parts": [
      [
        "omni",
        "all"
      ],
      [
        "sci",
        "to know"
      ],
      [
        "ent",
        ""
      ]
    ],
    "req": 6,
    "def": "knowing all things",
    "distractors": [
      "eating every kind of food",
      "flesh-eating",
      "in exactly the same words"
    ],
    "roots": "omnis (all) + scire (to know)"
  },
  {
    "word": "omnipotent",
    "pos": "adj.",
    "parts": [
      [
        "omni",
        "all"
      ],
      [
        "potent",
        "powerful"
      ]
    ],
    "req": 6,
    "def": "possessing unlimited power",
    "distractors": [
      "the chronic inability to sleep",
      "eating every kind of food",
      "in exactly the same words"
    ],
    "roots": "omnis (all) + potens (powerful)"
  },
  {
    "word": "omnivorous",
    "pos": "adj.",
    "parts": [
      [
        "omni",
        "all"
      ],
      [
        "vor",
        "to devour"
      ],
      [
        "ous",
        ""
      ]
    ],
    "req": 6,
    "def": "eating every kind of food",
    "distractors": [
      "possessing unlimited power",
      "in exactly the same words",
      "knowing all things"
    ],
    "roots": "omnis (all) + vorare (to devour)"
  },
  {
    "word": "carnivorous",
    "pos": "adj.",
    "parts": [
      [
        "carni",
        "flesh"
      ],
      [
        "vor",
        "to devour"
      ],
      [
        "ous",
        ""
      ]
    ],
    "req": 6,
    "def": "flesh-eating",
    "distractors": [
      "knowing all things",
      "eating every kind of food",
      "in exactly the same words"
    ],
    "roots": "caro, carnis (flesh) + vorare (to devour)"
  },
  {
    "word": "egomania",
    "pos": "n.",
    "parts": [
      [
        "ego",
        "self"
      ],
      [
        "mania",
        "madness"
      ]
    ],
    "req": 7,
    "def": "obsessive focus on oneself",
    "distractors": [
      "an abnormal fear of the dead",
      "one who rejects the faith",
      "government by the old"
    ],
    "roots": "ego (self) + mania (madness)"
  },
  {
    "word": "graphomania",
    "pos": "n.",
    "parts": [
      [
        "grapho",
        "to write"
      ],
      [
        "mania",
        "madness"
      ]
    ],
    "req": 7,
    "def": "a compulsive urge to write",
    "distractors": [
      "an abnormal fear of the dead",
      "one who rejects the faith",
      "government by the old"
    ],
    "roots": "graphein (to write) + mania (madness)"
  },
  {
    "word": "animism",
    "pos": "n.",
    "parts": [
      [
        "anim",
        "spirit"
      ],
      [
        "ism",
        "belief"
      ]
    ],
    "req": 8,
    "def": "the belief all things have a spirit",
    "distractors": [
      "full of lively, spirited energy",
      "skillful and clever in handling",
      "able to use both hands equally"
    ],
    "roots": "animus, anima (spirit)"
  },
  {
    "word": "vivacious",
    "pos": "adj.",
    "parts": [
      [
        "viv",
        "to live"
      ],
      [
        "acious",
        "full of"
      ]
    ],
    "req": 8,
    "def": "full of lively, spirited energy",
    "distractors": [
      "the belief all things have a spirit",
      "able to use both hands equally",
      "socially awkward; tactless"
    ],
    "roots": "vivere (to live)"
  },
  {
    "word": "dexterous",
    "pos": "adj.",
    "parts": [
      [
        "dexter",
        "right hand"
      ],
      [
        "ous",
        ""
      ]
    ],
    "req": 8,
    "def": "skillful with the hands; deft",
    "distractors": [
      "skillful and clever in handling",
      "able to use both hands equally",
      "threatening evil; ominous"
    ],
    "roots": "dexter (Latin: right, the right hand — the side of skill)"
  },
  {
    "word": "ambidextrous",
    "pos": "adj.",
    "parts": [
      [
        "ambi",
        "both"
      ],
      [
        "dextr",
        "right hand"
      ],
      [
        "ous",
        ""
      ]
    ],
    "req": 8,
    "def": "able to use both hands equally",
    "distractors": [
      "skillful and clever in handling",
      "skillful with the hands; deft",
      "socially awkward; tactless"
    ],
    "roots": "ambi- (both) + dexter (right hand) — literally 'right-handed on both sides'"
  },
  {
    "word": "adroit",
    "pos": "adj.",
    "parts": [
      [
        "a",
        "to"
      ],
      [
        "droit",
        "the right"
      ]
    ],
    "req": 8,
    "def": "skillful and clever in handling",
    "distractors": [
      "the belief all things have a spirit",
      "able to use both hands equally",
      "socially awkward; tactless"
    ],
    "roots": "French à droit (to the right) — the right hand as the able hand"
  },
  {
    "word": "gauche",
    "pos": "adj.",
    "parts": [
      [
        "gauche",
        "left"
      ]
    ],
    "req": 8,
    "def": "socially awkward; tactless",
    "distractors": [
      "skillful with the hands; deft",
      "threatening evil; ominous",
      "able to use both hands equally"
    ],
    "roots": "French gauche (left) — the left hand as the clumsy hand"
  },
  {
    "word": "sinister",
    "pos": "adj.",
    "parts": [
      [
        "sinister",
        "left"
      ]
    ],
    "req": 8,
    "def": "threatening evil; ominous",
    "distractors": [
      "socially awkward; tactless",
      "skillful with the hands; deft",
      "able to use both hands equally"
    ],
    "roots": "sinister (Latin: left) — the left side, read as unlucky by Roman augurs"
  },
  {
    "word": "vivisection",
    "pos": "n.",
    "parts": [
      [
        "vivi",
        "living"
      ],
      [
        "sect",
        "to cut"
      ],
      [
        "ion",
        ""
      ]
    ],
    "req": 21,
    "def": "surgery on living animals",
    "distractors": [
      "to pay off a debt over time",
      "an inscription on a tomb",
      "government by the old"
    ],
    "roots": "vivus (living) + secare (to cut)"
  },
  {
    "word": "misandry",
    "pos": "n.",
    "parts": [
      [
        "mis",
        "to hate"
      ],
      [
        "andry",
        "man, male"
      ]
    ],
    "req": 9,
    "def": "hatred of men",
    "distractors": [
      "a man who trifles with women",
      "one drawn to foreign cultures",
      "one who abstains from marriage"
    ],
    "roots": "misein (to hate) + aner, andros (man)"
  },
  {
    "word": "monandry",
    "pos": "n.",
    "parts": [
      [
        "mon",
        "one"
      ],
      [
        "andry",
        "man, male"
      ]
    ],
    "req": 9,
    "def": "the practice of having one husband",
    "distractors": [
      "an admirer of England and English ways",
      "one who abstains from marriage",
      "one drawn to foreign cultures"
    ],
    "roots": "monos (one) + aner, andros (man)"
  },
  {
    "word": "xenophile",
    "pos": "n.",
    "parts": [
      [
        "xeno",
        "stranger"
      ],
      [
        "phile",
        "lover of"
      ]
    ],
    "req": 9,
    "def": "one drawn to foreign cultures",
    "distractors": [
      "one who abstains from marriage",
      "a man who trifles with women",
      "the practice of having one husband"
    ],
    "roots": "xenos (stranger) + philein (to love)"
  },
  {
    "word": "philanderer",
    "pos": "n.",
    "parts": [
      [
        "phil",
        "loving"
      ],
      [
        "ander",
        "man"
      ],
      [
        "er",
        "one who"
      ]
    ],
    "req": 9,
    "def": "a man who trifles with women",
    "distractors": [
      "one who abstains from marriage",
      "one drawn to foreign cultures",
      "the practice of having one husband"
    ],
    "roots": "philein (to love) + aner, andros (man)"
  },
  {
    "word": "Anglophile",
    "pos": "n.",
    "parts": [
      [
        "Anglo",
        "English"
      ],
      [
        "phile",
        "lover of"
      ]
    ],
    "req": 9,
    "def": "an admirer of England and English ways",
    "distractors": [
      "the practice of having one husband",
      "one who abstains from marriage",
      "one drawn to foreign cultures"
    ],
    "roots": "Anglus (English) + philein (to love)"
  },
  {
    "word": "celibate",
    "pos": "n.",
    "parts": [
      [
        "celib",
        "unmarried"
      ],
      [
        "ate",
        ""
      ]
    ],
    "req": 9,
    "def": "one who abstains from marriage",
    "distractors": [
      "the practice of having one husband",
      "one drawn to foreign cultures",
      "a man who trifles with women"
    ],
    "roots": "caelebs (Latin: unmarried)"
  },
  {
    "word": "kleptocracy",
    "pos": "n.",
    "parts": [
      [
        "klepto",
        "to steal"
      ],
      [
        "cracy",
        "rule"
      ]
    ],
    "req": 10,
    "def": "rule by thieves and plunder",
    "distractors": [
      "the study of human populations",
      "the delusion one is divine",
      "government by the old"
    ],
    "roots": "kleptein (to steal) + kratos (rule)"
  },
  {
    "word": "androcracy",
    "pos": "n.",
    "parts": [
      [
        "andro",
        "man, male"
      ],
      [
        "cracy",
        "rule"
      ]
    ],
    "req": 10,
    "def": "social and political rule by men",
    "distractors": [
      "an epidemic across whole countries",
      "government by priests or clergy",
      "one who holds God unknowable"
    ],
    "roots": "aner, andros (man) + kratos (rule)"
  },
  {
    "word": "demography",
    "pos": "n.",
    "parts": [
      [
        "demo",
        "people"
      ],
      [
        "graphy",
        "writing"
      ]
    ],
    "req": 10,
    "def": "the study of human populations",
    "distractors": [
      "social and political rule by men",
      "one who holds God unknowable",
      "the delusion one is divine"
    ],
    "roots": "demos (people) + graphein (to write)"
  },
  {
    "word": "hierocracy",
    "pos": "n.",
    "parts": [
      [
        "hiero",
        "sacred"
      ],
      [
        "cracy",
        "rule"
      ]
    ],
    "req": 10,
    "def": "government by priests or clergy",
    "distractors": [
      "social and political rule by men",
      "the study of human populations",
      "rule by thieves and plunder"
    ],
    "roots": "hieros (sacred) + kratos (rule)"
  },
  {
    "word": "gerontocracy",
    "pos": "n.",
    "parts": [
      [
        "geronto",
        "old man"
      ],
      [
        "cracy",
        "rule"
      ]
    ],
    "req": 10,
    "def": "government by the old",
    "distractors": [
      "the delusion one is divine",
      "a narrow, dogmatic teacher",
      "government by a noble class"
    ],
    "roots": "geron (old man) + kratos (rule)"
  },
  {
    "word": "theomania",
    "pos": "n.",
    "parts": [
      [
        "theo",
        "god"
      ],
      [
        "mania",
        "madness"
      ]
    ],
    "req": 10,
    "def": "the delusion one is divine",
    "distractors": [
      "one who holds God unknowable",
      "a narrow, dogmatic teacher",
      "government by the old"
    ],
    "roots": "theos (god) + mania (madness)"
  },
  {
    "word": "agnostic",
    "pos": "n.",
    "parts": [
      [
        "a",
        "without"
      ],
      [
        "gnostic",
        "knowing"
      ]
    ],
    "req": 10,
    "def": "one who holds God unknowable",
    "distractors": [
      "one who parades petty learning",
      "government by a noble class",
      "the delusion one is divine"
    ],
    "roots": "a- (without) + gnosis (knowledge)"
  },
  {
    "word": "prognosis",
    "pos": "n.",
    "parts": [
      [
        "pro",
        "before"
      ],
      [
        "gnosis",
        "knowledge"
      ]
    ],
    "req": 12,
    "def": "a forecast of a disease's course",
    "distractors": [
      "a disease spreading among a people",
      "one who reads fate in the stars",
      "an abnormal fear of the dead"
    ],
    "roots": "pro- (before) + gnosis (knowledge)"
  },
  {
    "word": "atheist",
    "pos": "n.",
    "parts": [
      [
        "a",
        "without"
      ],
      [
        "the",
        "god"
      ],
      [
        "ist",
        "one who"
      ]
    ],
    "req": 10,
    "def": "one who denies the existence of God",
    "distractors": [
      "examination of a corpse after death",
      "an epidemic across whole countries",
      "native and constant to a region"
    ],
    "roots": "a- (without) + theos (god)"
  },
  {
    "word": "pedagogue",
    "pos": "n.",
    "parts": [
      [
        "ped",
        "child"
      ],
      [
        "agogue",
        "leader"
      ]
    ],
    "req": 10,
    "def": "a narrow, dogmatic teacher",
    "distractors": [
      "one who holds God unknowable",
      "the delusion one is divine",
      "government by the old"
    ],
    "roots": "paidos (child) + agogos (leader) — originally the slave who led children to school"
  },
  {
    "word": "pedant",
    "pos": "n.",
    "parts": [
      [
        "ped",
        "child"
      ],
      [
        "ant",
        "one who"
      ]
    ],
    "req": 10,
    "def": "one who parades petty learning",
    "distractors": [
      "social and political rule by men",
      "one who holds God unknowable",
      "the delusion one is divine"
    ],
    "roots": "from pedagogue — the teacher's learning worn as ostentation"
  },
  {
    "word": "aristocracy",
    "pos": "n.",
    "parts": [
      [
        "aristo",
        "best"
      ],
      [
        "cracy",
        "rule"
      ]
    ],
    "req": 10,
    "def": "government by a noble class",
    "distractors": [
      "the study of human populations",
      "the delusion one is divine",
      "government by the old"
    ],
    "roots": "aristos (best) + kratos (rule)"
  },
  {
    "word": "pandemic",
    "pos": "n.",
    "parts": [
      [
        "pan",
        "all"
      ],
      [
        "dem",
        "people"
      ],
      [
        "ic",
        ""
      ]
    ],
    "req": 10,
    "def": "an epidemic across whole countries",
    "distractors": [
      "one who denies the existence of God",
      "social and political rule by men",
      "one who parades petty learning"
    ],
    "roots": "pan (all) + demos (people)"
  },
  {
    "word": "epidemic",
    "pos": "n.",
    "parts": [
      [
        "epi",
        "upon"
      ],
      [
        "dem",
        "people"
      ],
      [
        "ic",
        ""
      ]
    ],
    "req": 19,
    "def": "a disease spreading among a people",
    "distractors": [
      "a descriptive word tied to a name",
      "a short, pointed, witty saying",
      "an inscription on a tomb"
    ],
    "roots": "epi- (upon) + demos (people)"
  },
  {
    "word": "endemic",
    "pos": "adj.",
    "parts": [
      [
        "en",
        "in"
      ],
      [
        "dem",
        "people"
      ],
      [
        "ic",
        ""
      ]
    ],
    "req": 10,
    "def": "native and constant to a region",
    "distractors": [
      "social and political rule by men",
      "the study of human populations",
      "government by a noble class"
    ],
    "roots": "en- (in) + demos (people)"
  },
  {
    "word": "autopsy",
    "pos": "n.",
    "parts": [
      [
        "aut",
        "self"
      ],
      [
        "opsy",
        "sight"
      ]
    ],
    "req": 10,
    "def": "examination of a corpse after death",
    "distractors": [
      "one who denies the existence of God",
      "an epidemic across whole countries",
      "native and constant to a region"
    ],
    "roots": "autos (self) + opsis (sight) — a seeing for oneself"
  },
  {
    "word": "juridical",
    "pos": "adj.",
    "parts": [
      [
        "jur",
        "law"
      ],
      [
        "i",
        ""
      ],
      [
        "dic",
        "to say"
      ],
      [
        "al",
        ""
      ]
    ],
    "req": 11,
    "def": "relating to law and justice",
    "distractors": [
      "one who throws the voice elsewhere",
      "given to talking at length",
      "wishing others well; kindly"
    ],
    "roots": "jus, juris (law) + dicere (to say)"
  },
  {
    "word": "loquacious",
    "pos": "adj.",
    "parts": [
      [
        "loqu",
        "to speak"
      ],
      [
        "acious",
        "full of"
      ]
    ],
    "req": 11,
    "def": "given to talking at length",
    "distractors": [
      "wishing others well; kindly",
      "relating to law and justice",
      "one who throws the voice elsewhere"
    ],
    "roots": "loqui (to speak)"
  },
  {
    "word": "ventriloquist",
    "pos": "n.",
    "parts": [
      [
        "ventri",
        "belly"
      ],
      [
        "loqu",
        "to speak"
      ],
      [
        "ist",
        "one who"
      ]
    ],
    "req": 11,
    "def": "one who throws the voice elsewhere",
    "distractors": [
      "wishing others well; kindly",
      "relating to law and justice",
      "given to talking at length"
    ],
    "roots": "venter, ventris (belly) + loqui (to speak)"
  },
  {
    "word": "benevolent",
    "pos": "adj.",
    "parts": [
      [
        "bene",
        "well"
      ],
      [
        "vol",
        "to wish"
      ],
      [
        "ent",
        ""
      ]
    ],
    "req": 11,
    "def": "wishing others well; kindly",
    "distractors": [
      "one who throws the voice elsewhere",
      "given to talking at length",
      "relating to law and justice"
    ],
    "roots": "bene (well) + velle, volo (to wish)"
  },
  {
    "word": "inculpate",
    "pos": "v.",
    "parts": [
      [
        "in",
        "against"
      ],
      [
        "culp",
        "fault, blame"
      ],
      [
        "ate",
        ""
      ]
    ],
    "req": 12,
    "def": "to accuse of wrongdoing",
    "distractors": [
      "one who rejects the faith",
      "having no material body",
      "knowing all things"
    ],
    "roots": "in- (against) + culpa (fault)"
  },
  {
    "word": "adjure",
    "pos": "v.",
    "parts": [
      [
        "ad",
        "to"
      ],
      [
        "jure",
        "to swear"
      ]
    ],
    "req": 12,
    "def": "to command solemnly, as under oath",
    "distractors": [
      "a specialist in disorders of the eye",
      "a descriptive word tied to a name",
      "the fortified height of a city"
    ],
    "roots": "ad- (to) + jurare (to swear)"
  },
  {
    "word": "telemetry",
    "pos": "n.",
    "parts": [
      [
        "tele",
        "far"
      ],
      [
        "metry",
        "measure"
      ]
    ],
    "req": 13,
    "def": "remote measurement of data",
    "distractors": [
      "a lover and collector of books",
      "abnormal, excessive thirst",
      "having no material body"
    ],
    "roots": "tele- (far) + metron (measure)"
  },
  {
    "word": "polydipsia",
    "pos": "n.",
    "parts": [
      [
        "poly",
        "many"
      ],
      [
        "dips",
        "thirst"
      ],
      [
        "ia",
        ""
      ]
    ],
    "req": 13,
    "def": "abnormal, excessive thirst",
    "distractors": [
      "a lover and collector of books",
      "remote measurement of data",
      "having no material body"
    ],
    "roots": "polys (many) + dipsa (thirst)"
  },
  {
    "word": "somatology",
    "pos": "n.",
    "parts": [
      [
        "somato",
        "body"
      ],
      [
        "logy",
        "study"
      ]
    ],
    "req": 13,
    "def": "the scientific study of the human body",
    "distractors": [
      "a lover and collector of books",
      "abnormal, excessive thirst",
      "remote measurement of data"
    ],
    "roots": "soma (body) + logos (study)"
  },
  {
    "word": "asomatous",
    "pos": "adj.",
    "parts": [
      [
        "a",
        "without"
      ],
      [
        "somat",
        "body"
      ],
      [
        "ous",
        ""
      ]
    ],
    "req": 13,
    "def": "having no material body",
    "distractors": [
      "abnormal, excessive thirst",
      "remote measurement of data",
      "a lover and collector of books"
    ],
    "roots": "a- (without) + soma (body)"
  },
  {
    "word": "bibliophile",
    "pos": "n.",
    "parts": [
      [
        "biblio",
        "book"
      ],
      [
        "phile",
        "lover of"
      ]
    ],
    "req": 13,
    "def": "a lover and collector of books",
    "distractors": [
      "the scientific study of the human body",
      "abnormal, excessive thirst",
      "remote measurement of data"
    ],
    "roots": "biblion (book) + philein (to love)"
  },
  {
    "word": "syndic",
    "pos": "n.",
    "parts": [
      [
        "syn",
        "together"
      ],
      [
        "dic",
        "justice"
      ]
    ],
    "req": 14,
    "def": "an agent for a city in law",
    "distractors": [
      "one who holds God unknowable",
      "one who rejects the faith",
      "having no material body"
    ],
    "roots": "syn (together) + dikē (justice)"
  },
  {
    "word": "dialysis",
    "pos": "n.",
    "parts": [
      [
        "dia",
        "through"
      ],
      [
        "lysis",
        "loosening"
      ]
    ],
    "req": 14,
    "def": "separation through a membrane",
    "distractors": [
      "one who reads fate in the stars",
      "an abnormal fear of the dead",
      "one who rejects the faith"
    ],
    "roots": "dia- (through) + lyein (to loosen)"
  },
  {
    "word": "megalopolis",
    "pos": "n.",
    "parts": [
      [
        "megalo",
        "great"
      ],
      [
        "polis",
        "city"
      ]
    ],
    "req": 16,
    "def": "a vast, sprawling urban region",
    "distractors": [
      "relating to prophecy or divination",
      "at home anywhere in the world",
      "the chief city of a region"
    ],
    "roots": "megas, megalo- (great) + polis (city)"
  },
  {
    "word": "mantic",
    "pos": "adj.",
    "parts": [
      [
        "mant",
        "divination"
      ],
      [
        "ic",
        ""
      ]
    ],
    "req": 16,
    "def": "relating to prophecy or divination",
    "distractors": [
      "the fortified height of a city",
      "a vast, sprawling urban region",
      "at home anywhere in the world"
    ],
    "roots": "manteia (divination)"
  },
  {
    "word": "amortize",
    "pos": "v.",
    "parts": [
      [
        "a",
        "to (ad-)"
      ],
      [
        "mort",
        "death"
      ],
      [
        "ize",
        "to make"
      ]
    ],
    "req": 16,
    "def": "to pay off a debt over time",
    "distractors": [
      "at home anywhere in the world",
      "the chief city of a region",
      "an abnormal fear of the dead"
    ],
    "roots": "ad- (to) + mors, mort- (death)"
  },
  {
    "word": "acropolis",
    "pos": "n.",
    "parts": [
      [
        "acro",
        "highest"
      ],
      [
        "polis",
        "city"
      ]
    ],
    "req": 16,
    "def": "the fortified height of a city",
    "distractors": [
      "relating to prophecy or divination",
      "at home anywhere in the world",
      "the chief city of a region"
    ],
    "roots": "akros (highest) + polis (city)"
  },
  {
    "word": "cosmopolitan",
    "pos": "adj.",
    "parts": [
      [
        "cosmo",
        "world"
      ],
      [
        "polit",
        "citizen"
      ],
      [
        "an",
        ""
      ]
    ],
    "req": 16,
    "def": "at home anywhere in the world",
    "distractors": [
      "the fortified height of a city",
      "an abnormal fear of the dead",
      "the chief city of a region"
    ],
    "roots": "kosmos (world) + polites (citizen)"
  },
  {
    "word": "metropolis",
    "pos": "n.",
    "parts": [
      [
        "metro",
        "mother"
      ],
      [
        "polis",
        "city"
      ]
    ],
    "req": 16,
    "def": "the chief city of a region",
    "distractors": [
      "an abnormal fear of the dead",
      "to pay off a debt over time",
      "at home anywhere in the world"
    ],
    "roots": "meter, metros (mother) + polis (city)"
  },
  {
    "word": "necrophobia",
    "pos": "n.",
    "parts": [
      [
        "necro",
        "the dead"
      ],
      [
        "phobia",
        "fear"
      ]
    ],
    "req": 16,
    "def": "an abnormal fear of the dead",
    "distractors": [
      "the fortified height of a city",
      "to pay off a debt over time",
      "the chief city of a region"
    ],
    "roots": "necros (corpse) + phobos (fear)"
  },
  {
    "word": "mortmain",
    "pos": "n.",
    "parts": [
      [
        "mort",
        "death"
      ],
      [
        "main",
        "hand (Fr., from manus)"
      ]
    ],
    "req": 17,
    "def": "property held forever by a body",
    "distractors": [
      "disease or disorder of the nerves",
      "the fortified height of a city",
      "to pay off a debt over time"
    ],
    "roots": "mors, mort- (death) + manus (hand)"
  },
  {
    "word": "capitation",
    "pos": "n.",
    "parts": [
      [
        "capit",
        "head"
      ],
      [
        "ation",
        ""
      ]
    ],
    "req": 17,
    "def": "a tax or fee levied on each person",
    "distractors": [
      "a specialist in disorders of the eye",
      "disease or disorder of the nerves",
      "the fortified height of a city"
    ],
    "roots": "caput, capitis (head)"
  },
  {
    "word": "legerity",
    "pos": "n.",
    "parts": [
      [
        "leger",
        "light, nimble"
      ],
      [
        "ity",
        ""
      ]
    ],
    "req": 17,
    "def": "lightness and nimbleness of body",
    "distractors": [
      "the practice of having one husband",
      "one who reads fate in the stars",
      "an abnormal fear of the dead"
    ],
    "roots": "léger (light, nimble)"
  },
  {
    "word": "univocal",
    "pos": "adj.",
    "parts": [
      [
        "uni",
        "one"
      ],
      [
        "voc",
        "voice"
      ],
      [
        "al",
        ""
      ]
    ],
    "req": 18,
    "def": "having a single, unambiguous meaning",
    "distractors": [
      "an admirer of England and English ways",
      "the belief all things have a spirit",
      "social and political rule by men"
    ],
    "roots": "unus (one) + vox (voice)"
  },
  {
    "word": "controvert",
    "pos": "v.",
    "parts": [
      [
        "contro",
        "against"
      ],
      [
        "vert",
        "to turn"
      ]
    ],
    "req": 18,
    "def": "to dispute or argue against",
    "distractors": [
      "one drawn to foreign cultures",
      "one who walks in his sleep",
      "having no material body"
    ],
    "roots": "contra- (against) + vertere (to turn)"
  },
  {
    "word": "epigram",
    "pos": "n.",
    "parts": [
      [
        "epi",
        "upon"
      ],
      [
        "gram",
        "writing"
      ]
    ],
    "req": 19,
    "def": "a short, pointed, witty saying",
    "distractors": [
      "a descriptive word tied to a name",
      "an inscription on a tomb",
      "a disease spreading among a people"
    ],
    "roots": "epi- (upon) + graphein (to write)"
  },
  {
    "word": "epitaph",
    "pos": "n.",
    "parts": [
      [
        "epi",
        "upon"
      ],
      [
        "taph",
        "tomb"
      ]
    ],
    "req": 19,
    "def": "an inscription on a tomb",
    "distractors": [
      "a short, pointed, witty saying",
      "a descriptive word tied to a name",
      "a disease spreading among a people"
    ],
    "roots": "epi- (upon) + taphos (tomb)"
  },
  {
    "word": "epithet",
    "pos": "n.",
    "parts": [
      [
        "epi",
        "upon"
      ],
      [
        "thet",
        "placed"
      ]
    ],
    "req": 19,
    "def": "a descriptive word tied to a name",
    "distractors": [
      "a disease spreading among a people",
      "a short, pointed, witty saying",
      "an inscription on a tomb"
    ],
    "roots": "epi- (upon) + tithenai (to place)"
  }
] satisfies InferenceWord[];
