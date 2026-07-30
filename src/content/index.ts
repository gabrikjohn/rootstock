import { gate01 } from "./gates/gate-01";
import { gate02 } from "./gates/gate-02";
import { gate03 } from "./gates/gate-03";
import { gate04 } from "./gates/gate-04";
import { gate05 } from "./gates/gate-05";
import { gate06 } from "./gates/gate-06";
import { gate07 } from "./gates/gate-07";
import { gate08 } from "./gates/gate-08";
import { gate09 } from "./gates/gate-09";
import { gate10 } from "./gates/gate-10";
import { gate11 } from "./gates/gate-11";
import { gate12 } from "./gates/gate-12";
import { gate13 } from "./gates/gate-13";
import { gate14 } from "./gates/gate-14";
import { gate15 } from "./gates/gate-15";
import { gate16 } from "./gates/gate-16";
import { gate17 } from "./gates/gate-17";
import { gate18 } from "./gates/gate-18";
import { gate19 } from "./gates/gate-19";
import { gate20 } from "./gates/gate-20";
import { gate21 } from "./gates/gate-21";
import { gate22 } from "./gates/gate-22";
import { gate23 } from "./gates/gate-23";
import { gate24 } from "./gates/gate-24";
import { splitRootEntry, withRootKeys } from "../domain/roots";
import type { Gate, RuntimeGate } from "../types/content";
export { AFFIX_DEEP } from "./affix-deep";
export { COGNATES } from "./cognates";
export { CONFUSABLES } from "./confusables";
export { DEPTH } from "./depth";
export { DRILL_POOL } from "./drill";
export { ETYM } from "./etymology";
export { INFER_POOL } from "./inference";
export { IPA } from "./ipa";
export { ROOT_DEEP } from "./root-deep";
export { SIMILARS, SIMILAR_GLOSSES } from "./similars";

const authoredGates = [gate01, gate02, gate03, gate04, gate05, gate06, gate07, gate08, gate09, gate10, gate11, gate12, gate13, gate14, gate15, gate16, gate17, gate18, gate19, gate20, gate21, gate22, gate23, gate24] satisfies Gate[];

export const LEVELS: RuntimeGate[] = authoredGates.map((gate) => ({
  ...gate,
  quizRoots: gate.roots.flatMap(splitRootEntry).map(withRootKeys)
}));
