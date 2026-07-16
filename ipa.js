// IPA (General American) + pronunciation audio engine for The Rootstock.
// Audio: free human recordings (Wiktionary, via dictionaryapi.dev) when online,
// cached per word; offline fallback = on-device speech synthesis.
const IPA = {
egoist:"ˈiːɡoʊɪst",egotist:"ˈiːɡətɪst",egocentric:"ˌiːɡoʊˈsɛntrɪk",altruist:"ˈæltruɪst",introvert:"ˈɪntrəˌvɜrt",extrovert:"ˈɛkstrəˌvɜrt",ambivert:"ˈæmbɪˌvɜrt",misanthrope:"ˈmɪzənˌθroʊp",misogynist:"mɪˈsɑdʒənɪst",ascetic:"əˈsɛtɪk",
internist:"ɪnˈtɜrnɪst",obstetrician:"ˌɑbstəˈtrɪʃən",pediatrician:"ˌpidiəˈtrɪʃən",dermatologist:"ˌdɜrməˈtɑlədʒɪst",ophthalmologist:"ˌɑfθælˈmɑlədʒɪst",orthopedist:"ˌɔrθəˈpidɪst",cardiologist:"ˌkɑrdiˈɑlədʒɪst",neurologist:"nʊˈrɑlədʒɪst",psychiatrist:"saɪˈkaɪətrɪst",gynecologist:"ˌɡaɪnəˈkɑlədʒɪst",
psychologist:"saɪˈkɑlədʒɪst",psychoanalyst:"ˌsaɪkoʊˈænəlɪst",orthodontist:"ˌɔrθəˈdɑntɪst",optometrist:"ɑpˈtɑmətrɪst",optician:"ɑpˈtɪʃən",osteopath:"ˈɑstiəˌpæθ",chiropractor:"ˈkaɪrəˌpræktər",podiatrist:"pəˈdaɪətrɪst",graphologist:"ɡræˈfɑlədʒɪst",gerontologist:"ˌdʒɛrənˈtɑlədʒɪst",
anthropologist:"ˌænθrəˈpɑlədʒɪst",astronomer:"əˈstrɑnəmər",geologist:"dʒiˈɑlədʒɪst",biologist:"baɪˈɑlədʒɪst",botanist:"ˈbɑtənɪst",zoologist:"zoʊˈɑlədʒɪst",entomologist:"ˌɛntəˈmɑlədʒɪst",etymologist:"ˌɛtəˈmɑlədʒɪst",philologist:"fɪˈlɑlədʒɪst",sociologist:"ˌsoʊsiˈɑlədʒɪst",
notorious:"noʊˈtɔriəs",consummate:"kənˈsʌmɪt",incorrigible:"ɪnˈkɔrɪdʒəbəl",inveterate:"ɪnˈvɛtərɪt",congenital:"kənˈdʒɛnɪtəl",chronic:"ˈkrɑnɪk",pathological:"ˌpæθəˈlɑdʒɪkəl",unconscionable:"ʌnˈkɑnʃənəbəl",glib:"ɡlɪb",egregious:"ɪˈɡridʒəs",
disparage:"dɪˈspærɪdʒ",equivocate:"ɪˈkwɪvəˌkeɪt",placate:"ˈpleɪkeɪt",proscribe:"proʊˈskraɪb",obviate:"ˈɑbviˌeɪt",militate:"ˈmɪlɪˌteɪt",malign:"məˈlaɪn",condone:"kənˈdoʊn",adulate:"ˈædʒəˌleɪt",vacillate:"ˈvæsəˌleɪt",
taciturn:"ˈtæsɪˌtɜrn",laconic:"ləˈkɑnɪk",garrulous:"ˈɡærələs",voluble:"ˈvɑljəbəl",verbose:"vərˈboʊs",cogent:"ˈkoʊdʒənt",vociferous:"voʊˈsɪfərəs",sententious:"sɛnˈtɛnʃəs",terse:"tɜrs",banal:"bəˈnæl",
martinet:"ˌmɑrtənˈɛt",sycophant:"ˈsɪkəfənt",dilettante:"ˌdɪləˈtɑnt",virago:"vɪˈrɑɡoʊ",chauvinist:"ˈʃoʊvənɪst",monomaniac:"ˌmɑnəˈmeɪniˌæk",iconoclast:"aɪˈkɑnəˌklæst",hypochondriac:"ˌhaɪpəˈkɑndriˌæk",charlatan:"ˈʃɑrlətən",philistine:"ˈfɪlɪˌstin",
convivial:"kənˈvɪviəl",indefatigable:"ˌɪndɪˈfætɪɡəbəl",ingenuous:"ɪnˈdʒɛnjuəs",magnanimous:"mæɡˈnænəməs",versatile:"ˈvɜrsətəl",stoic:"ˈstoʊɪk",intrepid:"ɪnˈtrɛpɪd",scintillating:"ˈsɪntəˌleɪtɪŋ",urbane:"ɜrˈbeɪn",gregarious:"ɡrɪˈɡɛriəs",
monogamy:"məˈnɑɡəmi",bigamy:"ˈbɪɡəmi",polygamy:"pəˈlɪɡəmi",polyandry:"ˈpɑliˌændri",misogamy:"mɪˈsɑɡəmi",agoraphobia:"ˌæɡərəˈfoʊbiə",claustrophobia:"ˌklɔstrəˈfoʊbiə",xenophobia:"ˌzɛnəˈfoʊbiə",acrophobia:"ˌækrəˈfoʊbiə",kleptomania:"ˌklɛptəˈmeɪniə",
autocracy:"ɔˈtɑkrəsi",oligarchy:"ˈɑləˌɡɑrki",anarchy:"ˈænərki",plutocracy:"pluˈtɑkrəsi",theocracy:"θiˈɑkrəsi",monarchy:"ˈmɑnərki",matriarchy:"ˈmeɪtriˌɑrki",patriarchy:"ˈpeɪtriˌɑrki",hierarchy:"ˈhaɪəˌrɑrki",demagogue:"ˈdɛməˌɡɑɡ",
soliloquy:"səˈlɪləkwi",circumlocution:"ˌsɜrkəmloʊˈkjuʃən",grandiloquent:"ɡrænˈdɪləkwənt",eloquent:"ˈɛləkwənt",colloquial:"kəˈloʊkwiəl",malediction:"ˌmæləˈdɪkʃən",benediction:"ˌbɛnəˈdɪkʃən",dictum:"ˈdɪktəm",edict:"ˈidɪkt",jurisdiction:"ˌdʒʊrɪsˈdɪkʃən",
jurisprudence:"ˌdʒʊrɪsˈprudəns",adjudicate:"əˈdʒudɪˌkeɪt",litigious:"lɪˈtɪdʒəs",perjury:"ˈpɜrdʒəri",verdict:"ˈvɜrdɪkt",culpable:"ˈkʌlpəbəl",exculpate:"ˈɛkskəlˌpeɪt",incriminate:"ɪnˈkrɪməˌneɪt",indict:"ɪnˈdaɪt",theodicy:"θiˈɑdəsi",
apathy:"ˈæpəθi",empathy:"ˈɛmpəθi",antipathy:"ænˈtɪpəθi",telepathy:"təˈlɛpəθi",pathology:"pəˈθɑlədʒi",psychosomatic:"ˌsaɪkoʊsəˈmætɪk",megalomania:"ˌmɛɡəloʊˈmeɪniə",pyromania:"ˌpaɪroʊˈmeɪniə",dipsomania:"ˌdɪpsəˈmeɪniə",bibliomania:"ˌbɪbliəˈmeɪniə",
anachronism:"əˈnækrəˌnɪzəm",chronological:"ˌkrɑnəˈlɑdʒɪkəl",synchronize:"ˈsɪŋkrəˌnaɪz",chronicle:"ˈkrɑnɪkəl",chronometer:"krəˈnɑmɪtər",temporize:"ˈtɛmpəˌraɪz",extemporaneous:"ɛkˌstɛmpəˈreɪniəs",contemporary:"kənˈtɛmpəˌrɛri",temporal:"ˈtɛmpərəl",diachronic:"ˌdaɪəˈkrɑnɪk",
veracious:"vəˈreɪʃəs",veridical:"vəˈrɪdɪkəl",verisimilitude:"ˌvɛrəsɪˈmɪlɪˌtud",fallacious:"fəˈleɪʃəs",infallible:"ɪnˈfæləbəl",mendacious:"mɛnˈdeɪʃəs",duplicity:"duˈplɪsɪti",dissemble:"dɪˈsɛmbəl",prevaricate:"prɪˈværɪˌkeɪt",specious:"ˈspiʃəs",
symbiosis:"ˌsɪmbiˈoʊsɪs",biopsy:"ˈbaɪɑpsi",amphibious:"æmˈfɪbiəs",moribund:"ˈmɔrɪˌbʌnd",mortify:"ˈmɔrtɪˌfaɪ",mortician:"mɔrˈtɪʃən",necropolis:"nəˈkrɑpəlɪs",necromancy:"ˈnɛkrəˌmænsi",necrosis:"nəˈkroʊsɪs",internecine:"ˌɪntərˈnɛsin",
manacle:"ˈmænəkəl",emancipate:"ɪˈmænsəˌpeɪt",mandate:"ˈmændeɪt",legerdemain:"ˌlɛdʒərdəˈmeɪn",impede:"ɪmˈpid",expedite:"ˈɛkspəˌdaɪt",expedient:"ɪkˈspidiənt",corporeal:"kɔrˈpɔriəl",corpulent:"ˈkɔrpjələnt",capitulate:"kəˈpɪtʃəˌleɪt",
animus:"ˈænɪməs",equanimity:"ˌikwəˈnɪmɪti",animosity:"ˌænɪˈmɑsɪti",pusillanimous:"ˌpjusɪˈlænɪməs",unanimity:"ˌjunəˈnɪmɪti",animadversion:"ˌænɪmædˈvɜrʒən",aversion:"əˈvɜrʒən",incontrovertible:"ˌɪnkɑntrəˈvɜrtəbəl",vertiginous:"vərˈtɪdʒənəs",subversive:"səbˈvɜrsɪv",
calligraphy:"kəˈlɪɡrəfi",epigraph:"ˈɛpɪˌɡræf",monograph:"ˈmɑnəˌɡræf",ascribe:"əˈskraɪb",circumscribe:"ˈsɜrkəmˌskraɪb",conscription:"kənˈskrɪpʃən",credence:"ˈkridəns",credulous:"ˈkrɛdʒələs",incredulity:"ˌɪnkrəˈdulɪti",accredit:"əˈkrɛdɪt",
pseudonym:"ˈsudənɪm",anonymous:"əˈnɑnəməs",misnomer:"mɪsˈnoʊmər",euphemism:"ˈjufəˌmɪzəm",eulogy:"ˈjulədʒi",euthanasia:"ˌjuθəˈneɪʒə",euphony:"ˈjufəni",cacophony:"kəˈkɑfəni",orthodox:"ˈɔrθəˌdɑks",paradox:"ˈpærəˌdɑks",
perspicacious:"ˌpɜrspɪˈkeɪʃəs",perspicuous:"pərˈspɪkjuəs",conspicuous:"kənˈspɪkjuəs",circumspect:"ˈsɜrkəmˌspɛkt",myopia:"maɪˈoʊpiə",presbyopia:"ˌprɛzbiˈoʊpiə",fratricide:"ˈfrætrɪˌsaɪd",regicide:"ˈrɛdʒɪˌsaɪd",genocide:"ˈdʒɛnəˌsaɪd",uxoricide:"ʌkˈsɔrɪˌsaɪd",
disingenuous:"ˌdɪsɪnˈdʒɛnjuəs",indigenous:"ɪnˈdɪdʒənəs",congenial:"kənˈdʒiniəl",genealogy:"ˌdʒiniˈælədʒi",puerile:"ˈpjʊrəl",senile:"ˈsinaɪl",senescent:"sɪˈnɛsənt",virile:"ˈvɪrəl",nostalgia:"nɑˈstældʒə",soporific:"ˌsɑpəˈrɪfɪk",
pugnacious:"pʌɡˈneɪʃəs",impugn:"ɪmˈpjun",pugilist:"ˈpjudʒəlɪst",repugnant:"rɪˈpʌɡnənt",bellicose:"ˈbɛlɪˌkoʊs",belligerent:"bəˈlɪdʒərənt",obsequious:"əbˈsikwiəs",obsequies:"ˈɑbsəkwiz","non sequitur":"nɑn ˈsɛkwɪtər",uxorious:"ʌkˈsɔriəs"
};

Object.assign(IPA, {
oculist:"ˈɑkjəlɪst",orthography:"ɔrˈθɑɡrəfi",cardiography:"ˌkɑrdiˈɑɡrəfi",psychometry:"saɪˈkɑmətri",chiropody:"kɪˈrɑpədi",chirography:"kaɪˈrɑɡrəfi",zoography:"zoʊˈɑɡrəfi",nomology:"noʊˈmɑlədʒi",biometry:"baɪˈɑmətri",philogyny:"fɪˈlɑdʒəni",
philanthropist:"fɪˈlænθrəpɪst",philosophy:"fɪˈlɑsəfi",logophile:"ˈlɔɡəˌfaɪl",philharmonic:"ˌfɪlhɑrˈmɑnɪk",philately:"fɪˈlætəli",astrologer:"əˈstrɑlədʒər",pathography:"pəˈθɑɡrəfi",neuropathy:"nʊˈrɑpəθi",malversation:"ˌmælvərˈseɪʃən",sophistry:"ˈsɑfɪstri",
sophomoric:"ˌsɑfəˈmɔrɪk",perfidy:"ˈpɜrfɪdi",infidel:"ˈɪnfɪdəl",malevolent:"məˈlɛvələnt",dissimulate:"dɪˈsɪmjəˌleɪt",titillate:"ˈtɪtəˌleɪt",tyro:"ˈtaɪroʊ",eccentric:"ɪkˈsɛntrɪk",verbatim:"vərˈbeɪtɪm",insomnia:"ɪnˈsɑmniə",
somnambulist:"sɑmˈnæmbjəlɪst",omniscient:"ɑmˈnɪʃənt",omnipotent:"ɑmˈnɪpətənt",omnivorous:"ɑmˈnɪvərəs",carnivorous:"kɑrˈnɪvərəs",egomania:"ˌiɡoʊˈmeɪniə",graphomania:"ˌɡræfoʊˈmeɪniə",animism:"ˈænɪˌmɪzəm",vivacious:"vɪˈveɪʃəs",dexterous:"ˈdɛkstərəs",
ambidextrous:"ˌæmbɪˈdɛkstrəs",adroit:"əˈdrɔɪt",gauche:"ɡoʊʃ",sinister:"ˈsɪnɪstər",vivisection:"ˌvɪvɪˈsɛkʃən",misandry:"ˈmɪsændri",monandry:"məˈnændri",xenophile:"ˈzɛnəˌfaɪl",philanderer:"fɪˈlændərər",Anglophile:"ˈæŋɡləˌfaɪl",
celibate:"ˈsɛlɪbət",kleptocracy:"klɛpˈtɑkrəsi",androcracy:"ænˈdrɑkrəsi",demography:"dɪˈmɑɡrəfi",hierocracy:"ˌhaɪəˈrɑkrəsi",gerontocracy:"ˌdʒɛrənˈtɑkrəsi",theomania:"ˌθiəˈmeɪniə",agnostic:"æɡˈnɑstɪk",prognosis:"prɑɡˈnoʊsɪs",atheist:"ˈeɪθiɪst",
pedagogue:"ˈpɛdəˌɡɑɡ",pedant:"ˈpɛdənt",aristocracy:"ˌærɪˈstɑkrəsi",pandemic:"pænˈdɛmɪk",epidemic:"ˌɛpɪˈdɛmɪk",endemic:"ɛnˈdɛmɪk",autopsy:"ˈɔtɑpsi",juridical:"dʒʊˈrɪdɪkəl",loquacious:"loʊˈkweɪʃəs",ventriloquist:"vɛnˈtrɪləkwɪst",
benevolent:"bəˈnɛvələnt",inculpate:"ɪnˈkʌlpeɪt",adjure:"əˈdʒʊr",telemetry:"təˈlɛmətri",polydipsia:"ˌpɑliˈdɪpsiə",somatology:"ˌsoʊməˈtɑlədʒi",asomatous:"eɪˈsoʊmətəs",bibliophile:"ˈbɪbliəˌfaɪl",syndic:"ˈsɪndɪk",dialysis:"daɪˈæləsɪs",
megalopolis:"ˌmɛɡəˈlɑpəlɪs",mantic:"ˈmæntɪk",amortize:"ˈæmərˌtaɪz",acropolis:"əˈkrɑpəlɪs",cosmopolitan:"ˌkɑzməˈpɑlɪtən",metropolis:"məˈtrɑpəlɪs",necrophobia:"ˌnɛkrəˈfoʊbiə",mortmain:"ˈmɔrtmeɪn",capitation:"ˌkæpɪˈteɪʃən",legerity:"ləˈdʒɛrɪti",
univocal:"juˈnɪvəkəl",controvert:"ˈkɑntrəˌvɜrt",epigram:"ˈɛpɪˌɡræm",epitaph:"ˈɛpɪˌtæf",epithet:"ˈɛpɪˌθɛt",
altercation:"ˌɔltərˈkeɪʃən",adulterate:"əˈdʌltəˌreɪt",ambit:"ˈæmbɪt",anthropocentric:"ˌænθrəpoʊˈsɛntrɪk",analysand:"əˈnæləˌsænd",misology:"mɪˈsɑlədʒi",osteology:"ˌɑstiˈɑlədʒi",logorrhea:"ˌlɔɡəˈriə",cognizant:"ˈkɑɡnɪzənt",cognoscenti:"ˌkɑnjəˈʃɛnti",
corrigendum:"ˌkɔrɪˈdʒɛndəm",iatrogenic:"aɪˌætrəˈdʒɛnɪk",nescience:"ˈnɛʃəns",pathogenic:"ˌpæθəˈdʒɛnɪk",prescience:"ˈprɛʃəns",disparate:"ˈdɪspərɪt",parity:"ˈpærɪti",malinger:"məˈlɪŋɡər",scrivener:"ˈskrɪvənər",reticent:"ˈrɛtɪsənt",
verbiage:"ˈvɜrbiɪdʒ",avocation:"ˌævəˈkeɪʃən",convoluted:"ˈkɑnvəˌlutɪd",exogamy:"ɛkˈsɑɡəmi",endogamy:"ɛnˈdɑɡəmi",androgynous:"ænˈdrɑdʒənəs",apotheosis:"əˌpɑθiˈoʊsɪs",hierophant:"ˈhaɪərəˌfænt",demotic:"dɪˈmɑtɪk",patrimony:"ˈpætrɪˌmoʊni",
matrilineal:"ˌmætrɪˈlɪniəl",elocution:"ˌɛləˈkjuʃən",valedictory:"ˌvælɪˈdɪktəri",benison:"ˈbɛnɪsən",conjure:"ˈkɑndʒər","mea culpa":"ˌmeɪə ˈkʊlpə",aver:"əˈvɜr",indite:"ɪnˈdaɪt",antinomy:"ænˈtɪnəmi",acromegaly:"ˌækroʊˈmɛɡəli",
biblioklept:"ˈbɪblioʊˌklɛpt",empyrean:"ˌɛmpaɪˈriən",syndicate:"ˈsɪndɪkɪt",similitude:"sɪˈmɪlɪˌtud",simulacrum:"ˌsɪmjəˈleɪkrəm",dissociate:"dɪˈsoʊʃiˌeɪt",interlocutor:"ˌɪntərˈlɑkjətər",interdict:"ˈɪntərˌdɪkt",necrology:"nəˈkrɑlədʒi",pyromancy:"ˈpaɪroʊˌmænsi",
amanuensis:"əˌmænjuˈɛnsɪs",captious:"ˈkæpʃəs",capacious:"kəˈpeɪʃəs",pedestrian:"pəˈdɛstriən",sesquipedalian:"ˌsɛskwɪpɪˈdeɪliən",tergiversate:"ˈtɜrdʒɪvərˌseɪt",suborn:"səˈbɔrn",contretemps:"ˈkɑntrəˌtɑn",longanimity:"ˌlɔŋɡəˈnɪmɪti",aggregate:"ˈæɡrɪɡɪt",
miscreant:"ˈmɪskriənt",credo:"ˈkridoʊ",eponymous:"ɪˈpɑnəməs",patronymic:"ˌpætrəˈnɪmɪk",polyphony:"pəˈlɪfəni",introspection:"ˌɪntrəˈspɛkʃən",pernicious:"pərˈnɪʃəs",incisive:"ɪnˈsaɪsɪv",parricide:"ˈpærɪˌsaɪd",interregnum:"ˌɪntərˈrɛɡnəm",
engender:"ɪnˈdʒɛndər",progenitor:"proʊˈdʒɛnɪtər",primogeniture:"ˌpraɪmoʊˈdʒɛnɪtʃər",hypnagogic:"ˌhɪpnəˈɡɑdʒɪk",nonpareil:"ˌnɑnpəˈrɛl",recreant:"ˈrɛkriənt",recrimination:"rɪˌkrɪmɪˈneɪʃən",obloquy:"ˈɑbləkwi",sequacious:"sɪˈkweɪʃəs",congeries:"kənˈdʒɪriz",nondescript:"ˌnɑndɪˈskrɪpt"
});

/* ---------- pronunciation audio ---------- */
const SAY_ICON='<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M11 4.5 5.8 8.6H2.6v6.8h3.2L11 19.5z" fill="currentColor"></path><path d="M14.8 8.7a4.7 4.7 0 0 1 0 6.6M17.8 5.9a8.8 8.8 0 0 1 0 12.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"></path></svg>';
function ipaOf(w){ return IPA[w] ? '/'+IPA[w]+'/' : ''; }
function pronLine(w, pron){
  const ipa = ipaOf(w);
  const text = [ipa, pron].filter(Boolean).join('\u2002\u00b7\u2002');
  return '<div class="pron"><button class="say" type="button" data-say="'+w.replace(/"/g,'&quot;')+'" aria-label="Hear \u201c'+w+'\u201d">'+SAY_ICON+'</button><span class="pron-t">'+text+'</span></div>';
}

// Ranked preference of known-good en-US voices. Apple ships premium/enhanced
// variants of Ava, Zoe, Samantha (and Siri voices) that read words far more
// naturally than the compact default; iOS/macOS expose them once downloaded.
// Order: best-quality named voices first, then any en-US default as fallback.
const VOICE_RANK = [
  /Ava.*Premium/i, /Ava.*Enhanced/i, /Ava/i,
  /Zoe.*Premium/i, /Zoe.*Enhanced/i, /Zoe/i,
  /Samantha.*Enhanced/i, /Samantha/i,
  /Siri.*en[-_]?US/i, /Allison.*Enhanced/i, /Allison/i,
  /Nicky/i, /Google US English/i
];

let voicesReady = [];
let chosenVoice = null;
function pickVoice(){
  if(!voicesReady.length) return null;
  const enUS = voicesReady.filter(v=>v.lang && /^en[-_]US/i.test(v.lang));
  const pool = enUS.length ? enUS : voicesReady.filter(v=>v.lang && v.lang.slice(0,2).toLowerCase()==='en');
  for(const rx of VOICE_RANK){
    const hit = pool.find(v=>rx.test(v.name));
    if(hit) return hit;
  }
  // fall back to the platform's default en-US voice, then any en-US, then any English
  return pool.find(v=>v.default) || enUS[0] || pool[0] || null;
}
function loadVoices(){
  try{ voicesReady = speechSynthesis.getVoices() || []; }catch(e){ voicesReady = []; }
  chosenVoice = pickVoice();
}
if('speechSynthesis' in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }

function speakWord(w, done){
  if(!('speechSynthesis' in window)){ done && done(); return; }
  if(!chosenVoice) chosenVoice = pickVoice();
  const u = new SpeechSynthesisUtterance(w);
  u.lang = 'en-US'; u.rate = 0.82; u.pitch = 1;
  if(chosenVoice) u.voice = chosenVoice;
  u.onend = u.onerror = ()=>{ done && done(); };
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/* ---------- bundled human recordings ---------- */
// pronunciations: { "<word>": "data:audio/mpeg;base64,…" } — one clip per
// Rootstock word, loaded from pronunciations.js as window.PRONUNCIATIONS so it
// inlines cleanly into the standalone build (and works offline via the service
// worker in the live app). Preferred over on-device synthesis; TTS remains the
// fallback for any word without a clip (or if playback fails).
let PRON = (typeof window !== 'undefined' && window.PRONUNCIATIONS) || null;
const clipCache = {};
if(!PRON){
  fetch('pronunciations.json')
    .then(r => r.ok ? r.json() : null)
    .then(j => { PRON = j || {}; })
    .catch(() => { PRON = {}; });
}

function playClip(w, done){
  const src = PRON && (PRON[w] || PRON[String(w).toLowerCase()]);
  if(!src) return false;
  let a = clipCache[w];
  if(!a){ a = clipCache[w] = new Audio(src); a.preload = 'auto'; }
  let fell = false;
  const fallback = () => { if(fell) return; fell = true; speakWord(w, done); };
  a.onended = () => { done && done(); };
  a.onerror = fallback;
  try{ speechSynthesis.cancel(); }catch(e){}
  try{ a.pause(); a.currentTime = 0; }catch(e){}
  const p = a.play();
  if(p && p.catch) p.catch(fallback);
  return true;
}

function sayWord(w, btn){
  if(btn) btn.classList.add('saying');
  const done = ()=>{ if(btn) btn.classList.remove('saying'); };
  if(!playClip(w, done)) speakWord(w, done);
}

document.addEventListener('click', e=>{
  const b = e.target.closest && e.target.closest('[data-say]');
  if(b){ e.stopPropagation(); sayWord(b.dataset.say, b); }
});
