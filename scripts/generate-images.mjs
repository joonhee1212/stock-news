/**
 * One-time script to generate AI company images via OpenAI image generation.
 * Run: node scripts/generate-images.mjs
 * Run for specific tickers: node scripts/generate-images.mjs AAPL GOOGL MSFT
 *
 * Saves static images to public/images/companies/<ticker>.png
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const envPath = path.join(root, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.+?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const outDir = path.join(root, "public", "images", "companies");
fs.mkdirSync(outDir, { recursive: true });

const STYLE_SUFFIX = `The background is a pure, clean, very light gray (#f4f5f9). Studio-lit with soft diffused lighting. Think Apple product photography or Stripe.com hero imagery — minimal, premium, the subject pops against clean negative space. Photorealistic materials, minimal everything else. The edges of the image should be the same light gray so it composites seamlessly on a light webpage. No text, no labels, no watermarks.`;

const COMPANIES = [
  // ── Already generated ──
  {
    ticker: "TSLA",
    size: "1536x1024",
    prompt: `A sleek, generic futuristic electric sports car rendered in a clean studio setting. Fictional concept design (NOT any real car). Deep metallic charcoal with subtle blue-purple reflective highlights. 3/4 profile from slightly above. Barely-visible reflective surface with soft reflection beneath. ${STYLE_SUFFIX}`,
  },
  {
    ticker: "SPACEX",
    size: "1024x1536",
    prompt: `A sleek, generic fictional rocket in a clean studio setting, vertical, pointing up. White and silver body with subtle orange accent stripes near the base (NOT any real rocket). Engines just igniting — soft warm orange-amber glow from the engine bells, wisps of vapor/steam. ${STYLE_SUFFIX}`,
  },

  // ── Big Tech ──
  {
    ticker: "GOOGL",
    size: "1024x1024",
    prompt: `An abstract 3D sculpture representing search and knowledge — a smooth, flowing form made of four intertwining ribbons in Google's signature colors: blue, red, yellow, and green. The ribbons weave and spiral around each other like a flowing data stream or double helix, catching light beautifully. The ribbons are glossy with subtle translucency. A few small floating geometric nodes orbit around the sculpture, suggesting connectivity and information. ${STYLE_SUFFIX}`,
  },
  {
    ticker: "AMZN",
    size: "1024x1024",
    prompt: `An abstract 3D composition representing cloud infrastructure and logistics — a cluster of sleek, rounded metallic cubes and rectangular forms in deep Amazon orange (#FF9900) and dark charcoal, stacked and floating in a dynamic arrangement suggesting warehousing and cloud computing. Some cubes are partially transparent showing glowing internal circuitry. A subtle curved arrow/smile shape is formed by the arrangement of the floating elements. Warm orange accent lighting. ${STYLE_SUFFIX}`,
  },
  {
    ticker: "AAPL",
    size: "1024x1024",
    prompt: `An abstract 3D sculpture of a perfectly smooth, minimalist sphere made of brushed silver aluminum with subtle rose gold edges. The sphere has a clean geometric cutaway section revealing layers of precision-machined internal components in silver and white — like looking inside a perfectly engineered device. The internal components are abstract geometric shapes, not literal electronics. Ultra-clean, ultra-minimal. Cool silver and white tones with very subtle warm highlights. ${STYLE_SUFFIX}`,
  },
  {
    ticker: "MSFT",
    size: "1024x1024",
    prompt: `An abstract 3D composition representing cloud computing and productivity — four smooth, floating translucent glass squares/tiles arranged in a loose grid formation, each in a different shade of Microsoft's blues (#0078D4 primary, with lighter azure and deeper navy variations). The tiles cast colorful light refractions on the surface below. Some tiles have subtle internal grid/matrix patterns glowing within them. Cool blue tones throughout. ${STYLE_SUFFIX}`,
  },
  {
    ticker: "META",
    size: "1024x1024",
    prompt: `An abstract 3D rendering of a flowing infinity-loop or Möbius strip form in Meta's signature gradient blue (#0668E1 to lighter cyan). The form is made of a smooth, glossy material that shifts from deep blue to vibrant cyan along its surface. It floats at a slight angle, casting a soft blue-tinted shadow. The shape suggests connectivity and infinite interaction. A few subtle particle dots float nearby, suggesting a social network. ${STYLE_SUFFIX}`,
  },

  // ── Semiconductors ──
  {
    ticker: "NVDA",
    size: "1024x1024",
    prompt: `An abstract 3D rendering of a stylized GPU chip in NVIDIA's signature bright green (#76B900). A sleek, angular circuit board form with glowing green traces and connection points radiating outward. The chip has a reflective dark surface with vivid green light emanating from circuit pathways, suggesting massive parallel processing power. Green glow and green accent lighting throughout. The overall feel is powerful, cutting-edge technology with an unmistakably green color identity. ${STYLE_SUFFIX}`,
  },
  {
    ticker: "AMD",
    size: "1024x1024",
    prompt: `An abstract 3D rendering of a stylized processor chip in AMD's signature red and black palette. A bold, angular chip form with glowing red (#ED1C24) circuit traces on a matte black surface. The traces form geometric patterns suggesting high-performance computing. Red accent lighting casts a warm red glow. The feel is aggressive and performance-oriented, distinctly red-toned — clearly different from a green NVIDIA aesthetic. ${STYLE_SUFFIX}`,
  },
  {
    ticker: "MU",
    size: "1024x1024",
    prompt: `An abstract 3D rendering representing memory and DRAM technology in cool blue and silver tones. A row of sleek, thin rectangular memory module forms standing vertically like server DIMM sticks, rendered in brushed silver and steel blue (#0077C8). Subtle data-stream light trails flow between the modules in cool blue. The aesthetic is clean, industrial, precise — suggesting raw memory storage rather than flashy graphics cards. Cool blue and silver color identity throughout. ${STYLE_SUFFIX}`,
  },
  {
    ticker: "TSM",
    size: "1024x1024",
    prompt: `An abstract 3D rendering representing semiconductor fabrication and manufacturing. A circular silicon wafer form rendered in reflective dark purple/deep blue, with a precise geometric grid pattern etched across its surface — suggesting nanometer-scale chip fabrication. The wafer sits at a slight angle showing its ultra-thin profile. Subtle gold and white pinpoint lights at grid intersections suggest active fabrication points. The color palette is deep, precise purple-blue — industrial and foundry-like, distinctly different from consumer GPU/chip imagery. ${STYLE_SUFFIX}`,
  },

  // ── AI & Cyber ──
  {
    ticker: "PLTR",
    size: "1024x1024",
    prompt: `An abstract 3D rendering representing data analytics and intelligence. A glowing geometric polyhedron (like an icosahedron) rendered in dark charcoal with edges illuminated in Palantir's deep blue-black palette with subtle white/silver data-point lights at each vertex. Thin connecting lines radiate outward from the polyhedron to smaller floating data nodes, forming a constellation-like network. The feel is analytical, intelligence-focused, somewhat mysterious. Dark blue-black with precise white accent points. ${STYLE_SUFFIX}`,
  },
  {
    ticker: "PANW",
    size: "1024x1024",
    prompt: `An abstract 3D rendering representing cybersecurity and network protection. A translucent shield-like dome form in Palo Alto Networks' warm red-orange (#FA582D) and deep charcoal. The dome has a hexagonal mesh/grid pattern suggesting a firewall, with a few nodes on the surface glowing brighter to indicate active threat detection. Warm red-orange accent lighting. The feel is protective, vigilant — clearly a security/defense visual, not an attack visual. ${STYLE_SUFFIX}`,
  },
  {
    ticker: "CRWD",
    size: "1024x1024",
    prompt: `An abstract 3D rendering representing endpoint security and threat hunting. A sleek falcon/bird-of-prey-inspired abstract angular form in CrowdStrike's signature red (#FF0000) and dark slate. The form is sharp and aerodynamic, suggesting speed and precision. Subtle red digital scan lines emanate from the form like a radar sweep. The color palette is bold crimson red on dark charcoal — aggressive, alert, security-focused. Distinctly different from Palo Alto's warmer orange-red. ${STYLE_SUFFIX}`,
  },

  // ── Space & Deep Tech (remaining) ──
  {
    ticker: "RKLB",
    size: "1024x1024",
    prompt: `A small, elegant fictional rocket in a clean studio setting — much smaller and sleeker than a large orbital rocket, suggesting a nimble small-launch-vehicle. White and carbon-fiber black body with subtle blue accent details. The rocket sits at a slight angle. A faint blue-white engine glow at the base. The feel is precision engineering, small-scale space access. Cool blue and carbon-black palette. ${STYLE_SUFFIX}`,
  },

  // ── Infrastructure & Finance ──
  {
    ticker: "VRT",
    size: "1024x1024",
    prompt: `An abstract 3D rendering representing data center infrastructure and power management. A sleek server rack/cabinet form rendered in Vertiv's dark teal (#00838F) and silver. The cabinet has subtle cooling vent patterns and small status indicator lights in green. A few abstract cable/pipe forms connect to it. The feel is industrial infrastructure, critical power systems, thermal management. Teal-green and silver color identity. ${STYLE_SUFFIX}`,
  },
  {
    ticker: "IREN",
    size: "1024x1024",
    prompt: `An abstract 3D rendering representing renewable energy and digital infrastructure. A stylized solar panel or energy cell array rendered as floating geometric panels in deep green (#2D8C3C) and gold, arranged in a dynamic angular formation catching light. Subtle energy arc/lightning connections between panels suggest power generation. The feel is clean energy, sustainability, digital mining infrastructure. Green and gold palette. ${STYLE_SUFFIX}`,
  },
  {
    ticker: "JPM",
    size: "1024x1024",
    prompt: `An abstract 3D rendering representing global finance and banking. A set of sleek, tall rectangular column forms in JPMorgan's signature dark navy blue (#003A70) and silver, arranged like a miniature city skyline or abstract bar chart trending upward. The columns have subtle reflective surfaces with faint gold accent edges suggesting premium financial services. The feel is institutional, stable, powerful. Deep navy and silver with subtle gold accents. ${STYLE_SUFFIX}`,
  },
];

// Allow filtering by ticker via CLI args
const requestedTickers = process.argv.slice(2).map(t => t.toUpperCase());
const toGenerate = requestedTickers.length > 0
  ? COMPANIES.filter(c => requestedTickers.includes(c.ticker))
  : COMPANIES;

async function generateImage(company) {
  const outPath = path.join(outDir, `${company.ticker.toLowerCase()}.png`);

  if (fs.existsSync(outPath)) {
    console.log(`⏭  ${company.ticker} — already exists, skipping`);
    return;
  }

  console.log(`🎨 Generating ${company.ticker} (${company.size})...`);

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: company.prompt,
      n: 1,
      size: company.size,
      quality: "high",
      output_format: "png",
    });

    const b64 = response.data[0].b64_json;
    fs.writeFileSync(outPath, Buffer.from(b64, "base64"));
    console.log(`✅ ${company.ticker} → ${outPath}`);
  } catch (err) {
    console.error(`❌ ${company.ticker} failed: ${err.message}`);
  }
}

async function main() {
  console.log(`Generating ${toGenerate.length} image(s)...\n`);
  for (const company of toGenerate) {
    await generateImage(company);
  }
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
