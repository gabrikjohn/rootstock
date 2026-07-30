import type { StringMap } from "../types/content";

/**
 * The endings and prefixes that carry no root meaning of their own but decide what a word
 * *is* — an act, a doer, a quality, a condition. ROOT_DEEP covers the Latin and Greek stems;
 * without these the deep panel would explain half of a word and go quiet exactly where a
 * beginner asks "so why is this one a noun and that one an adjective?".
 */
export const AFFIX_DEEP = {
  "ist": "One who does, or believes in, the thing named — from Greek -istes, an agent ending that came through Latin and never left. It marks the practitioner (a botanist), the adherent (an altruist), and occasionally the offender (an egotist). Its sister -ism names the belief; -ist names the believer.",
  "ism": "The doctrine, condition, or characteristic act — Greek -ismos, forming a noun from a verb of doing. It builds beliefs (altruism), conditions (astigmatism), and habits of speech (a colloquialism). Where -ist gives you the person, -ism gives you what the person holds.",
  "er": "The one who does it — the plainest agent ending English owns, inherited from Old English -ere and reinforced by Latin -arius. It attaches to almost anything: a philanderer philanders, an astronomer studies the stars. Where -ist implies training, -er often implies only the doing.",
  "or": "The doer, by way of Latin -or — the ending of agent nouns formed from the supine stem of verbs. A progenitor begets, an interlocutor speaks between. It carries a faint formality that -er has lost.",
  "ian": "Belonging to, or skilled in — Latin -ianus, an adjective ending that hardened into a noun of profession. A physician practises physic, an optician deals in sight; the same ending makes a word for the person and the thing they belong to.",
  "ician": "The practitioner of an art — -ic (the field) plus -ian (belonging to it), so a mortician belongs to the business of death and an optician to that of the eye. It always names a trained trade, never a mere doer.",

  "ion": "The act, or its result — Latin -io, -ionis, which turns a verb into the noun of its doing. Conscription is the act of writing men into service; introspection the act of looking within. English keeps the distinction between the doing and the thing done only loosely, which is why so many -ion words mean both.",
  "ation": "The full form of the act — Latin -atio, the -ion ending applied to verbs of the first conjugation. Capitation counts by heads; malversation is corrupt dealing. The extra syllable is the Latin verb's own vowel showing through.",
  "ance": "The state or quality of the verb's action, from Latin -antia. It names a condition held rather than an act completed.",
  "ence": "The same ending as -ance, from Latin -entia, taken from verbs whose stem vowel was e. Credence is the state of believing, prescience of knowing beforehand. The choice between -ance and -ence records nothing but which Latin conjugation the verb belonged to.",
  "ity": "The quality itself, made into a thing — Latin -itas, -itatis. Parity is the state of being equal, legerity of being light. It turns an adjective into the abstract noun of that adjective's condition.",
  "itude": "A state or degree, from Latin -itudo — a heavier, older cousin of -ity. Similitude is likeness held as a quality; verisimilitude the appearance of truth. It tends to survive in words that kept a formal register.",
  "ness": "The native English answer to -ity, from Old English -nes. Where a word wears -ness rather than -ity, English built it rather than borrowing it.",
  "ment": "The result or means of the action, from Latin -mentum. It names the concrete thing an act leaves behind.",
  "age": "The action, or the sum of it, from Latin -aticum by way of French. Verbiage is words in the mass; the ending often carries a faint dismissiveness, as though counting up something not worth counting.",
  "ure": "The act or its outcome, from Latin -ura, formed on the participle. It names what an action produces and leaves standing.",
  "y": "The commonest noun ending in this stock, arriving by several roads — Greek -ia and -eia, Latin -ia, French -ie. It names a condition (monogamy), a field of study (astronomy), a body of practice (sophistry). Wherever a Greek compound ends in -y, that -y is doing the work of turning the whole phrase into a single thing.",
  "ia": "Greek -ia, the bare form of the ending above, kept where the word came into English through Latin without softening. It names conditions above all — insomnia, myopia, nostalgia — which is why so much medical vocabulary ends in it.",
  "sis": "Greek -sis, naming the process rather than its product. Necrosis is dying as it happens, dialysis a loosening under way. Where -sis appears, the word denotes something in progress.",
  "um": "Latin neuter singular -um, kept whole. It marks a thing rather than an act, and its survival unaltered signals a word English borrowed without digesting.",
  "ies": "The Latin fifth-declension plural, retained in words that entered English as a set rather than a single thing — obsequies are rites in the plural, congeries a heap of items. The word is plural in form and often singular in sense.",

  "ous": "Full of, or marked by — Latin -osus, the workhorse adjective ending of this vocabulary. Pugnacious is full of fight, verbose full of words. Wherever you meet it, the word is describing rather than naming.",
  "ious": "The same -ous, with the Latin stem's own i showing through before it. The extra vowel is inheritance, not meaning: litigious and captious carry no more force than -ous alone.",
  "acious": "-acity's adjective, from Latin -ax, -acis — an ending that means not merely 'having' but 'inclined to, given to'. Loquacious is not just talkative but disposed to talk; pugnacious disposed to fight. It always implies a leaning, not a state.",
  "ic": "Of, or pertaining to — Greek -ikos through Latin -icus, the ending that turns a noun into its adjective. Chronic belongs to time, demotic to the people. It is also why so many nouns of art end in -ics: the adjective, used alone, became the field.",
  "ical": "-ic with -al added, a doubling English did for rhythm rather than sense. Where both forms survive they have usually drifted apart — historic and historical no longer mean the same thing — but the ending itself adds nothing.",
  "al": "Belonging to, from Latin -alis. It makes an adjective of nearly any noun: temporal of time, corporeal of the body. Occasionally it stays a noun instead, naming the act itself.",
  "ial": "The -al ending after a stem that kept its Latin i. As with -ious, the vowel is a fossil of the original declension, not an addition to the meaning.",
  "ive": "Tending to, having the power to — Latin -ivus, built on the participle. Incisive cuts, subversive overturns. It describes a capacity that is exercised, not merely possessed.",
  "ile": "Capable of, or given to — Latin -ilis. Puerile is boyish in the manner of a boy, senile aged in the manner of the aged, virile manly. It names a quality inseparable from a condition.",
  "able": "Fit to be, or capable of — Latin -abilis, taken into English so thoroughly that it now attaches to native words too. Culpable is fit to be blamed. When it follows a Latin stem it is inherited; when it follows an English one, English built it.",
  "ible": "The same ending as -able, from Latin -ibilis, kept where the verb belonged to a conjugation with i. Incorrigible cannot be corrected, infallible cannot fail. The spelling records the Latin, nothing more.",
  "ant": "Doing, or being in the act — the Latin present participle -ans, -antis. Cognizant is in the state of knowing. Half the time English kept it as an adjective, half the time it hardened into a noun for the person doing it.",
  "ent": "The same participle as -ant, from verbs whose stem vowel was e — Latin -ens, -entis. Reticent is holding back, belligerent waging war. Like -ance and -ence, the choice between them preserves a Latin conjugation and nothing else.",
  "ary": "Belonging to, or concerned with — Latin -arius. It marks the thing's relation to what the root names, and often slid from adjective into the noun for the place or person concerned.",
  "ory": "Serving to, or having the effect of — Latin -orius, formed on the same stem as agent nouns in -or. A valedictory speech does the work of saying farewell.",
  "oid": "Having the shape of, from Greek -oeides, 'form'. It claims resemblance rather than identity, and often a slightly suspect resemblance at that.",
  "esque": "In the manner or style of, from Italian -esco through French. It attributes a manner rather than a property.",
  "ish": "Somewhat, or in the manner of — a native English ending from Old English -isc. Against the Latin and Greek endings around it, -ish sounds informal precisely because it never left home.",
  "ful": "Full of — the English word 'full', worn down to a suffix. It is the plain-spoken twin of Latin -ous.",
  "less": "Without — Old English -leas, 'free from'. The exact negative of -ful, and the older of the two.",

  "ize": "To make, or to become — Greek -izein, an ending for turning a noun or adjective into the verb of bringing it about. To temporize is to make time; to synchronize, to bring into one time.",
  "ise": "The same ending as -ize, spelled after the French. The difference is orthographic habit, not meaning or origin.",
  "fy": "To make — Latin -ficare, from facere, 'to do, to make'. To mortify is to make dead, at least in feeling.",
  "ate": "The most treacherous ending in this vocabulary, because it does two jobs. From the Latin past participle -atus it makes adjectives, as in consummate and disparate. From the same participle used as a verb stem it makes verbs, as in placate, obviate and vacillate. Only the sense tells you which — the spelling never will.",

  "cide": "The killing, or the killer — Latin -cida and -cidium, from caedere, 'to cut down'. Regicide is the killing of a king, parricide of a parent; the same ending names both the deed and the one who does it, and English rarely bothers to distinguish.",
  "mancy": "Divination by the thing named — Greek manteia, 'prophecy'. Necromancy divines through the dead, pyromancy through fire. It always claims knowledge got by reading something the ordinary eye cannot.",
  "gnosis": "Knowledge, from Greek gignoskein, 'to know' — the same stem as diagnosis and agnostic. A prognosis is knowing beforehand; the ending names knowledge arrived at, not merely held.",
  "opsy": "A seeing, from Greek opsis — sight itself. An autopsy is a seeing for oneself, a biopsy a seeing of the living. Wherever it appears, someone has looked directly rather than inferred.",
  "clast": "A breaker, from Greek klan, 'to break'. An iconoclast breaks images, whether the wooden kind or the received opinion.",
  "phant": "One who shows, from Greek phainein, 'to bring to light' — the same root as phenomenon. A sycophant and a hierophant both display something: one a debasing flattery, the other the sacred.",
  "potent": "Powerful, from Latin posse, 'to be able' — the participle potens. Omnipotent is able in all things; the ending always names a capacity actually held.",
  "mony": "The condition or the office, from Latin -monium — the ending of patrimony and matrimony alike. It names a formal state, usually one with property or duty attached.",
  "istry": "The practice or body of an art — -ist and -ry together, so sophistry is what sophists do taken as a whole. It carries the practice rather than the practitioner, and often a shade of disapproval.",
  "otic": "The -ic adjective on a Greek stem ending in -ot-, as in demotic, 'of the people'. The t belongs to the stem, not the ending.",
  "orious": "The -ous adjective built on an agent noun in -or, so notorious is 'well marked by being noted'. The ending stacks two Latin suffixes and means no more than the outer one.",
  "ble": "The worn-down form of -able and -ible, kept where the stem ended in a vowel — voluble rolls easily, from volvere, 'to roll'. The meaning is unchanged: fit to be, or apt to.",

  "mal": "Badly, or ill — Latin male. It sours whatever follows: a malediction curses where a benediction blesses, and to malign is to speak ill. Its opposite in nearly every pair is bene-.",
  "bene": "Well — Latin bene, the exact answer to mal-. A benediction speaks well, a benison is the blessing itself, a benevolent person wishes well. Where you find one, the other usually exists.",
  "beni": "The same bene-, 'well', with the vowel softened before a following consonant — the form English inherited through French in benison, a blessing worn down from benediction over centuries of saying it aloud.",
  "para": "Beside, or contrary to — Greek para. It can mean alongside in the friendly sense, or alongside in the sense of departing from: a paradox stands beside received opinion and contradicts it.",
  "sesqui": "One and a half — Latin sesqui-, from semis (half) plus que (and). Sesquipedalian words are a foot and a half long, which is Horace's joke about writers who use them.",
  "en": "In, or into — Greek en and Latin in, converging on one English prefix. It puts the action inside something, or brings the thing into being: to engender is to bring into begetting.",

  "anti": "Against, from Greek anti — opposition, and sometimes merely the opposite position rather than active hostility.",
  "eu": "Well, good — Greek eu. It sweetens whatever follows: a eulogy speaks well of, a euphemism names well, euthanasia promises a good death.",
  "im": "The Latin negative in- assimilated before b, m and p — impede, impugn. The n changed to m for the ease of the mouth, and nothing else.",
  "em": "The Greek prefix en, 'in', assimilated before b, m and p. Like im-, the vowel change is the tongue's convenience, not a shift in meaning."
} satisfies StringMap;
