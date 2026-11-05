import { MedicationProfile } from "./types"
export type { MedicationProfile }

const ANTIHYPERTENSIVE_KEYWORDS = [
  "lisinopril",
  "enalapril",
  "ramipril",
  "captopril",
  "benazepril",
  "losartan",
  "valsartan",
  "telmisartan",
  "olmesartan",
  "irbesartan",
  "amlodipine",
  "nifedipine",
  "felodipine",
  "diltiazem",
  "verapamil",
  "metoprolol",
  "atenolol",
  "bisoprolol",
  "carvedilol",
  "propranolol",
  "labetalol",
  "hydrochlorothiazide",
  "chlorthalidone",
  "indapamide",
  "furosemide",
  "torsemide",
  "spironolactone",
  "eplerenone",
  "bp pill",
  "blood pressure medication",
  "antihypertensive",
]

const ANTIDIABETIC_KEYWORDS = [
  "metformin",
  "glucophage",
  "insulin",
  "glipizide",
  "glimepiride",
  "glyburide",
  "gliclazide",
  "pioglitazone",
  "sitagliptin",
  "januvia",
  "linagliptin",
  "vildagliptin",
  "empagliflozin",
  "jardiance",
  "dapagliflozin",
  "farxiga",
  "canagliflozin",
  "semaglutide",
  "ozempic",
  "wegovy",
  "rybelsus",
  "liraglutide",
  "victoza",
  "dulaglutide",
  "trulicity",
  "mounjaro",
  "tirzepatide",
  "diabetes pill",
  "sugar medicine",
]

const LIPID_LOWERING_KEYWORDS = [
  "atorvastatin",
  "lipitor",
  "rosuvastatin",
  "crestor",
  "simvastatin",
  "zocor",
  "pravastatin",
  "lovastatin",
  "fluvastatin",
  "pitavastatin",
  "ezetimibe",
  "zetia",
  "fenofibrate",
  "gemfibrozil",
  "cholesterol pill",
  "statin",
]

const NSAID_KEYWORDS = [
  "ibuprofen",
  "advil",
  "motrin",
  "naproxen",
  "aleve",
  "celecoxib",
  "celebrex",
  "diclofenac",
  "voltaren",
  "meloxicam",
  "mobic",
  "indomethacin",
  "ketorolac",
  "aspirin high dose",
  "nsaid",
]

const HEPATOTOXIC_KEYWORDS = [
  "acetaminophen",
  "paracetamol",
  "tylenol",
  "methotrexate",
  "amiodarone",
  "isoniazid",
  "valproate",
  "carbamazepine",
  "anabolic steroid",
]

const ANTICOAGULANT_KEYWORDS = [
  "aspirin",
  "ecosprin",
  "clopidogrel",
  "plavix",
  "ticagrelor",
  "brilinta",
  "warfarin",
  "coumadin",
  "apixaban",
  "eliquis",
  "rivaroxaban",
  "xarelto",
  "dabigatran",
  "pradaxa",
]

function matchesKeywords(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw))
}

export function parseMedicationProfile(rawMedications?: string): MedicationProfile {
  const clean = (rawMedications || "").toLowerCase().trim()
  if (!clean) {
    return {
      raw: "",
      isTakingAntihypertensive: false,
      isTakingAntidiabetic: false,
      isTakingLipidLowering: false,
      isTakingNsaid: false,
      isTakingHepatotoxic: false,
      isTakingAnticoagulant: false,
      detectedClasses: [],
    }
  }

  const isTakingAntihypertensive = matchesKeywords(clean, ANTIHYPERTENSIVE_KEYWORDS)
  const isTakingAntidiabetic = matchesKeywords(clean, ANTIDIABETIC_KEYWORDS)
  const isTakingLipidLowering = matchesKeywords(clean, LIPID_LOWERING_KEYWORDS)
  const isTakingNsaid = matchesKeywords(clean, NSAID_KEYWORDS)
  const isTakingHepatotoxic = matchesKeywords(clean, HEPATOTOXIC_KEYWORDS)
  const isTakingAnticoagulant = matchesKeywords(clean, ANTICOAGULANT_KEYWORDS)

  const detectedClasses: string[] = []
  if (isTakingAntihypertensive) detectedClasses.push("Antihypertensive medication")
  if (isTakingAntidiabetic) detectedClasses.push("Antidiabetic medication / Insulin")
  if (isTakingLipidLowering) detectedClasses.push("Lipid-lowering statin therapy")
  if (isTakingNsaid) detectedClasses.push("Chronic NSAID use (nephrotoxicity risk)")
  if (isTakingHepatotoxic) detectedClasses.push("Potential hepatotoxic medication exposure")
  if (isTakingAnticoagulant) detectedClasses.push("Cardiovascular antiplatelet / anticoagulant")

  return {
    raw: clean,
    isTakingAntihypertensive,
    isTakingAntidiabetic,
    isTakingLipidLowering,
    isTakingNsaid,
    isTakingHepatotoxic,
    isTakingAnticoagulant,
    detectedClasses,
  }
}
