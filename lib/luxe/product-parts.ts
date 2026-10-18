import type { Product } from "../types";

export interface ProductPart { label: string; detail: string }

type Rule = { match: RegExp; parts: [string, string][] };

// First matching rule wins. Matches against name + category + tags, so it also works for CJ / Shopify products.
const RULES: Rule[] = [
  { match: /coffee|espresso|brew|kettle|teapot/, parts: [["Water reservoir", "Stores and feeds the water"], ["Heating element", "Brings water to temperature"], ["Filter basket", "Holds the grounds"], ["Carafe", "Collects the brew"], ["Base & controls", "Stability and settings"]] },
  { match: /headphone|airpod|earbud|earphone|headset/, parts: [["Ear cushions", "Comfort and acoustic seal"], ["Driver unit", "Produces the sound"], ["Microphone array", "Voice and noise control"], ["Headband & frame", "Structure and fit"], ["Battery & board", "Power and wireless chip"]] },
  { match: /watch/, parts: [["Crystal", "Scratch-resistant glass"], ["Dial", "Hands and markers"], ["Movement", "The mechanism inside"], ["Case", "Protective housing"], ["Strap", "Fit and comfort"]] },
  { match: /keyboard/, parts: [["Keycaps", "What your fingers touch"], ["Switches", "Actuation feel and sound"], ["Plate", "Stabilises the switches"], ["PCB", "Circuit and firmware"], ["Case", "Housing and weight"]] },
  { match: /mirror|display|monitor|tv\b/, parts: [["Mirror glass", "Reflective front surface"], ["Display panel", "The screen itself"], ["Camera & sensors", "Tracks your movement"], ["Processor board", "Runs the software"], ["Frame & mount", "Structure and fixing"]] },
  { match: /charger|charging|adapter|cable|power ?bank/, parts: [["Top surface", "Contact area"], ["Charging coil", "Transfers the energy"], ["Circuit board", "Regulates power"], ["Shielding", "Heat and safety"], ["Base housing", "Grip and cable port"]] },
  { match: /hub|speaker|assistant|smart/, parts: [["Outer shell", "Housing and finish"], ["Speaker & display", "Audio and feedback"], ["Radios & antenna", "Wi-Fi and connectivity"], ["Mainboard", "Processing"], ["Base", "Stability and grip"]] },
  { match: /sunglass|glasses|eyewear/, parts: [["Lenses", "Optics and UV protection"], ["Frame front", "Shape and style"], ["Hinges", "The opening mechanism"], ["Nose pads", "Comfort and fit"], ["Temples", "Arms and grip"]] },
  { match: /shoe|sneaker|runner|running|boot|trainer/, parts: [["Upper", "Breathable top"], ["Insole", "Cushioned footbed"], ["Midsole", "Impact absorption"], ["Outsole", "Grip and wear"], ["Laces & support", "Lockdown fit"]] },
  { match: /jacket|coat|hoodie|shirt|sweater|blazer|dress/, parts: [["Outer shell", "The main fabric"], ["Lining", "Inner comfort layer"], ["Insulation", "Warmth and shape"], ["Seams & stitching", "Strength and finish"], ["Zips & hardware", "Closures and trims"]] },
  { match: /scarf|shawl|cashmere|wool/, parts: [["Outer weave", "The visible fabric"], ["Fibre blend", "Softness and warmth"], ["Edge finish", "Hemmed borders"], ["Fringe", "Decorative ends"], ["Label", "Care and origin"]] },
  { match: /bag|backpack|tote|wallet|purse|luggage/, parts: [["Outer material", "The main surface"], ["Lining", "Inner finish"], ["Structure", "Shape and support"], ["Straps & handles", "Carry system"], ["Hardware", "Zips, clasps and rings"]] },
  { match: /vase|ceramic|pottery|bowl|mug/, parts: [["Glaze", "Colour and gloss"], ["Body wall", "Fired ceramic"], ["Form", "Silhouette and shape"], ["Foot ring", "Stable base"], ["Interior", "Waterproof lining"]] },
  { match: /yoga|mat\b|fitness|gym/, parts: [["Grip surface", "Top texture"], ["Cushion layer", "Joint support"], ["Core", "Density and structure"], ["Non-slip base", "Holds on the floor"], ["Edges", "Bonded borders"]] },
];

const CATEGORY_FALLBACK: [RegExp, [string, string][]][] = [
  [/electronic/, [["Casing", "Outer housing"], ["Interface", "Controls and display"], ["Circuit board", "Brains of the product"], ["Power system", "Battery or supply"], ["Internal frame", "Holds it together"]]],
  [/fashion|cloth|apparel/, [["Outer fabric", "What you see"], ["Lining", "Inner comfort"], ["Padding", "Shape and warmth"], ["Stitching", "Strength"], ["Trims", "Buttons and fastenings"]]],
  [/home|living|kitchen/, [["Outer body", "Housing and finish"], ["Working parts", "What it does"], ["Core mechanism", "How it works"], ["Internal frame", "Structure"], ["Base", "Stability"]]],
  [/sport/, [["Outer layer", "Weather and wear"], ["Cushioning", "Comfort"], ["Support", "Structure"], ["Grip", "Traction"], ["Core", "Main body"]]],
  [/accessor/, [["Surface", "Finish"], ["Detail", "Markings and trims"], ["Core", "Main structure"], ["Fastening", "Clasp or closure"], ["Base", "Foundation"]]],
  [/beauty|care/, [["Packaging", "Outer container"], ["Applicator", "How it is used"], ["Formula", "The product inside"], ["Seal", "Freshness"], ["Base", "Stability"]]],
];

const GENERIC: [string, string][] = [["Outer layer", "What you see and touch"], ["Detail layer", "Finishing touches"], ["Core", "The main structure"], ["Support", "Internal frame"], ["Base", "Foundation"]];

/** Five named parts for the exploded view, specific to the product being viewed. */
export function getProductParts(p: Pick<Product, "name" | "category" | "categoryName" | "tags">): ProductPart[] {
  const hay = `${p.name} ${p.category} ${p.categoryName} ${(p.tags || []).join(" ")}`.toLowerCase();
  const rule = RULES.find((r) => r.match.test(hay));
  const parts = rule?.parts ?? CATEGORY_FALLBACK.find(([re]) => re.test(hay))?.[1] ?? GENERIC;
  return parts.map(([label, detail]) => ({ label, detail }));
}
