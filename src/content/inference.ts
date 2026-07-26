import type { InferenceWord } from "../types/content";

export const INFER_POOL = [
  {
    "word": "oculist",
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
