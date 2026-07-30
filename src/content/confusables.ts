import type { ConfusablePair } from "../types/content";

export const CONFUSABLES = [
  {
    "s": "A ___ by temperament, he left the reception before the toasts.",
    "a": "introvert",
    "b": "misanthrope",
    "ans": "introvert",
    "why": "introvert = turned inward by disposition; misanthrope = hates humankind"
  },
  {
    "s": "The ___ gave the estate away and would not have her name on it.",
    "a": "altruist",
    "b": "ascetic",
    "ans": "altruist",
    "why": "altruist = lives for others; ascetic = renounces comfort for himself"
  },
  {
    "s": "Rule had passed to a handful of families — a settled ___.",
    "a": "oligarchy",
    "b": "autocracy",
    "ans": "oligarchy",
    "why": "oligarchy = rule by a few; autocracy = rule by one"
  },
  {
    "s": "His ___ complaint flared each winter and never wholly left him.",
    "a": "chronic",
    "b": "congenital",
    "ans": "chronic",
    "why": "chronic = lasting over time; congenital = present from birth"
  },
  {
    "s": "The speech was polished, quotable, and entirely ___.",
    "a": "banal",
    "b": "terse",
    "ans": "banal",
    "why": "banal = worn out by overuse; terse = short to the point of curtness"
  },
  {
    "s": "One ___ remark and the whole table fell silent.",
    "a": "egregious",
    "b": "notorious",
    "ans": "egregious",
    "why": "egregious = conspicuously bad in itself; notorious = widely known to be bad"
  },
  {
    "s": "Public ___ , not hostility, is what killed the proposal.",
    "a": "apathy",
    "b": "antipathy",
    "ans": "apathy",
    "why": "apathy = no feeling either way; antipathy = active dislike"
  },
  {
    "s": "He is ___ at any gathering and restless without one.",
    "a": "gregarious",
    "b": "convivial",
    "ans": "gregarious",
    "why": "gregarious = seeks company; convivial = good company once there"
  },
  {
    "s": "The court will ___ the matter and hand down its finding.",
    "a": "adjudicate",
    "b": "indict",
    "ans": "adjudicate",
    "why": "adjudicate = hear and decide; indict = formally accuse"
  },
  {
    "s": "Every attempt to soothe him only ___ the quarrel further.",
    "a": "militated",
    "b": "placated",
    "ans": "militated",
    "why": "militate = work against; placate = calm down"
  },
  {
    "s": "A ___ reading of the memo put her own desk at its center.",
    "a": "egocentric",
    "b": "egoistic",
    "ans": "egocentric",
    "why": "egocentric = sees everything in relation to self; egoistic = acts from self-interest"
  },
  {
    "s": "The ___ of the old regime were held at dawn, without mourners.",
    "a": "obsequies",
    "b": "obsequious",
    "ans": "obsequies",
    "why": "obsequies = funeral rites; obsequious = fawning"
  },
  {
    "s": "He would ___ under questioning rather than answer straight.",
    "a": "equivocate",
    "b": "obviate",
    "ans": "equivocate",
    "why": "equivocate = evade with ambiguous words; obviate = make unnecessary"
  },
  {
    "s": "Her argument was ___ — it went straight to the point and held.",
    "a": "cogent",
    "b": "sententious",
    "ans": "cogent",
    "why": "cogent = compelling by force of reason; sententious = moralizing in tone"
  },
  {
    "s": "A ___ observer, she had read the whole room before sitting down.",
    "a": "perspicacious",
    "b": "perspicuous",
    "ans": "perspicacious",
    "why": "perspicacious = keen-sighted in mind; perspicuous = clearly expressed"
  },
  {
    "s": "Bragging through the whole dinner, he was every inch the ___.",
    "a": "egotist",
    "b": "egoist",
    "ans": "egotist",
    "why": "egoist = self-interested; egotist = self-boasting"
  },
  {
    "s": "A ___ witness, she had never once been caught shading the truth.",
    "a": "veracious",
    "b": "veridical",
    "ans": "veracious",
    "why": "veracious = a truthful person/habit; veridical = contents matching fact"
  },
  {
    "s": "Her quiet, ___ plea did what no oratory could.",
    "a": "eloquent",
    "b": "grandiloquent",
    "ans": "eloquent",
    "why": "eloquent = movingly persuasive; grandiloquent = pompously overblown"
  },
  {
    "s": "The ___ was paged at midnight for the delivery.",
    "a": "obstetrician",
    "b": "gynecologist",
    "ans": "obstetrician",
    "why": "obstetrician = pregnancy and childbirth; gynecologist = women's health generally"
  },
  {
    "s": "His two-word verdict was ___ perfection: 'They lost.'",
    "a": "laconic",
    "b": "taciturn",
    "ans": "laconic",
    "why": "laconic = brief when speaking; taciturn = disinclined to speak at all"
  },
  {
    "s": "The ___ auctioneer never once paused for breath.",
    "a": "voluble",
    "b": "garrulous",
    "ans": "voluble",
    "why": "voluble = rapid fluent flow; garrulous = tedious chatter about trifles"
  },
  {
    "s": "The review told no lies; it merely ___ the book as slight and derivative.",
    "a": "disparaged",
    "b": "maligned",
    "ans": "disparaged",
    "why": "disparage = belittle; malign = slander with evil (often false) report"
  },
  {
    "s": "The recovered footage ___ the clerk entirely.",
    "a": "exculpated",
    "b": "condoned",
    "ans": "exculpated",
    "why": "exculpate = clear of blame; condone = tacitly forgive an actual offense"
  },
  {
    "s": "The charter does not ban lobbying; it merely ___ it within narrow limits.",
    "a": "circumscribes",
    "b": "proscribes",
    "ans": "circumscribes",
    "why": "circumscribe = confine within limits; proscribe = forbid outright"
  },
  {
    "s": "___ investors wired the funds to a stranger the same afternoon.",
    "a": "Credulous",
    "b": "Ingenuous",
    "ans": "Credulous",
    "why": "credulous = too ready to believe; ingenuous = frank and artless"
  },
  {
    "s": "The ___ workaround saved the launch — two lines of code where a rewrite was feared.",
    "a": "ingenious",
    "b": "ingenuous",
    "ans": "ingenious",
    "why": "ingenious = cleverly inventive; ingenuous = frankly naive and artless"
  },
  {
    "s": "Behind a calm face he ___, giving no sign of the ruin.",
    "a": "dissembled",
    "b": "prevaricated",
    "ans": "dissembled",
    "why": "dissemble = mask feelings/motives; prevaricate = speak evasively"
  },
  {
    "s": "He ___ for weeks, unable to settle on either offer.",
    "a": "vacillated",
    "b": "temporized",
    "ans": "vacillated",
    "why": "vacillate = waver from indecision; temporize = stall deliberately for time"
  },
  {
    "s": "The analogy looked sound at first hearing — ___ in the classic way.",
    "a": "specious",
    "b": "fallacious",
    "ans": "specious",
    "why": "specious = plausible-seeming; fallacious = flawed in its logic"
  },
  {
    "s": "The statute requires proof of discriminatory ___, not mere effect.",
    "a": "animus",
    "b": "animosity",
    "ans": "animus",
    "why": "animus = intent (esp. legal); animosity = active hostility felt"
  }
] satisfies ConfusablePair[];
