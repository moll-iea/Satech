// ─────────────────────────────────────────────
//  SA TECH INC. — All Site Content / Data
// ─────────────────────────────────────────────

export const NAV_LINKS = [
  { label: "Products",        href: "#products" },
  { label: "Services",        href: "#services" },
  { label: "News",            href: "#news" },
  { label: "Articles",        href: "#articles" },
  { label: "Exhibitions",     href: "#exhibitions" },
  { label: "About Us",        href: "#about" },
];

export const HERO_STATS = [
  { num: "30+",  label: "Years Experience" },
  { num: "100+", label: "Clients Served" },
  { num: "15+",  label: "Countries" },
];

export const MARQUEE_ITEMS = [
  "SMT Solutions", "Semiconductor", "Automation",
  "Automotive", "Inspection Systems", "Lab Equipment",
  "Technical Support", "Factory Automation",
];

export const VALUES = [
  { icon: "💡", name: "Creative Attitude",       desc: "To adapt and provide solutions to the changing needs of the market" },
  { icon: "⚡", name: "Proficiency",     desc: "To create an economical and pro-active team in search for solutions" },
  { icon: "🛡️", name: "Integrity",      desc: "To guide the business and its actions by being transparent andfaithful to the principle of honoring commitments" },
  { icon: "🤝", name: "Reliability",    desc: "To establish relationships founded on mutual confidence among shareholders, employees, customers, and society" },
  { icon: "🌱", name: "Responsibility", desc: "To act accordingly to the commitments of the organization tosociety and its partners" },
  { icon: "🏆", name: "Excellence",     desc: "To maintain a corporate atmosphere where people are happy and motivated to participate in activities that produce results" },
];

export const SERVICES = [
  {
    num: "01", icon: "🔧", cat: "Technical",
    title: "Preventive Maintenance",
    desc: "Exclusive PM contracts, parts, training, and consumables — local and overseas — by factory-trained engineers.",
  },
  {
    num: "02", icon: "🤖", cat: "Engineering",
    title: "Machine Design & Automation",
    desc: "Custom machine solutions from design and fabrication through to full implementation and integration.",
  },
  {
    num: "03", icon: "🏭", cat: "Industry",
    title: "Factory Automation",
    desc: "Machine network sharing, integration, software customization, terminal creation, and mapping.",
  },
  {
    num: "04", icon: "🔩", cat: "Fabrication",
    title: "Machine Parts Fabrication",
    desc: "State-of-the-art equipment and highly skilled fabricators delivering precision parts at competitive cost.",
  },
  {
    num: "05", icon: "📋", cat: "Board Repair",
    title: "PCB Module Board Repair",
    desc: "Electronic board repair, design modifications, and reverse engineering at competitive cost.",
  },
  {
    num: "06", icon: "📊", cat: "Business",
    title: "Legal & HR Services",
    desc: "Full-suite advisory: accounting, legal & actuarial, HR management, transportation, and facilities services.",
  },
];

export const PRODUCT_TABS = [
  "Inspection",
  "Dispensing",
  "Environmental / Oven",
  "Marking",
  "Packaging",
  "Spare Parts",
  "Consumables",
  "Fabrication",
];

export const PRODUCTS = {
  Inspection: [
    { icon: "🔍", name: "Solder Paste Inspection", detail: "PCB, Leadframe & LED post-print inspection. 0.1μm height resolution, shadow-free dual laser." },
    { icon: "👁️", name: "Automated Optical Inspection", detail: "Diebond, Wirebond, Clipbond & SMT inspection. 2.75μm high resolution, 2D and 3D capability." },
    { icon: "💿", name: "Wafer Inspection", detail: "Post-sawn inspection with 2D, 3D, SWIR technology. <1.5μm defect size capability." },
    { icon: "☢️", name: "X-Ray Inspection", detail: "PCB, IC electronics. Available in 90kV–160kV. 2D/3D/CT with auto measurement." },
    { icon: "🚗", name: "Automotive Casting X-Ray", detail: "High-density metal and non-metal inspection. C-Arm fixture for 5-axis motion, up to 450kV." },
    { icon: "🚌", name: "Vehicle Scanning X-Ray", detail: "Public security, border checking, customs. Max radiation dose rate: ≤2.5μSv/H." },
    { icon: "📐", name: "Coordinate Measuring Machine", detail: "Loading capacity 8–200kgs. Measurement accuracy 1.5–3 +L/350μm. Range: X:2000–3000mm." },
    { icon: "🛡️", name: "Public Safety Security X-Ray", detail: "Baggage X-ray inspection. 160kV X-ray tube, max 200KG weight distribution, hi-speed detection." },
  ],

  Dispensing: [
    { icon: "🍺", name: "Alcohol + Temp Detector", detail: "±0.3°C temp accuracy. Large capacity alcohol dispenser with audible alarm." },
    { icon: "🔬", name: "Industrial Adhesives", detail: "Temporary/permanent adhesives. Room temp, moisture cured and UV cured for electronics, automotive." },
  ],

  "Environmental / Oven": [
    { icon: "🌡️", name: "Reflow Oven", detail: "6/8/12 heating zones, forced hot air, N2 & water chiller cooling. ±2°C temp deviation." },
    { icon: "🌡️", name: "Walkthrough Temp Detector", detail: "IR temperature reader with alarm system and metal detector option. Records temp data." },
  ],

  Marking: [
    { icon: "⚡", name: "Laser Machine Solutions", detail: "Cutting, marking, deflash, and cleaning. Green, Fiber, Co2, UV laser — up to 4 heads." },
    { icon: "🖨️", name: "Screen Printer", detail: "Leadframe, PCB, substrate & LED. ≥2 Cpk @ ±18–30μm printing accuracy." },
  ],

  Packaging: [
    { icon: "📦", name: "Strapping Machine", detail: "Trays, small and large boxes, pallets. Min packing 50x30mm. Auto/Semi-Auto, PLC controlled." },
    { icon: "🌀", name: "Stretch Wrapping", detail: "Small and large boxes, pallets. 3 auto wrapping programs. Load capacity up to 2000kg." },
    { icon: "📫", name: "Carton Sealer", detail: "Carton size 150–500mm L/W/H. Auto/Semi-Auto. Available in top, bottom, and side sealing." },
    { icon: "🧊", name: "Vacuum Sealer", detail: "Any item requiring vacuum sealing. Standard 1–3 cycles/min. 304 SS body." },
    { icon: "💊", name: "Blister Forming", detail: "Food, consumer electronics, mobile phones. Supports PVC, ABS, PP, PC, PS, PET, PETG and more." },
    { icon: "🔲", name: "Vacuum Forming", detail: "Laboratory, R&D, prototyping. Forming size 560x610x200mm. 90–120 sheets/hr." },
  ],

  "Spare Parts": [
    { icon: "⚙️", name: "Standard Parts & Fabrication", detail: "Equipment parts, consumables, precision and semi-precision fabrication, stainless steel fabrication." },
    { icon: "🔵", name: "Ferrite Core", detail: "Transformers, inductors, power cords, signal lines, antennas, and RFID applications." },
  ],

  Consumables: [
    { icon: "🧪", name: "Lapping / Polishing / Sandblasting Materials", detail: "Fluids, powders, abrasive pads, compounds, and sandblasting abrasives." },
    { icon: "💎", name: "Diamond Tools", detail: "PCB, lead frames, LED, ceramic, solar, glass, stone mining. Available in different types and sizes." },
    { icon: "🗂️", name: "Dressing Board", detail: "Wafer, lead frames, LEDs saw prep. Pre-cut boards with 15–21 cutting lines. Low cost of ownership." },
    { icon: "📼", name: "Wafer Tape", detail: "UV/Non-UV, anti-static. Dicing tape, back grind tape, PVC and PET base. Easy to peel, expandable." },
  ],

  Fabrication: [
    { icon: "🔗", name: "Die Bonder", detail: "Flip Chip, FOWLP, eWLB, INFO, CoWoS, SiP. ±5μm@3σ accuracy." },
    { icon: "🦾", name: "Multi Axes Robot Arm", detail: "Automotive & aerospace assembly, welding, sorting. 0.03mm accuracy, arm length up to 2500mm." },
    { icon: "🚜", name: "Automated Guided Vehicle", detail: "QR code, SLAM, magnetic tape navigation. Can carry heavy objects up to 2000kg." },
    { icon: "🚦", name: "Tripod Turnstile", detail: "Programmable gate control, one or two directions. Integrates with card readers and indicators." },
    { icon: "🤖", name: "AI Facial/ID Recognition", detail: "Temperature reader with facial capture. ±0.3°C accuracy for airports, offices, and terminals." },
  ],
};

export const LOCATIONS = [
  "Fremont, USA", "Chicago, USA", "Tijuana, Mexico", "Mexicali, Mexico",
  "Extrama, Brazil", "Malta, Europe", "Morocco, Africa", "Korea",
  "Shanghai, China", "Shenzhen, China", "Malaysia", "Singapore",
  "Taiwan", "Philippines (4 Sites)",
];

export const CONTACT_INFO = [
  { icon: "📍", label: "Address",  value: "Northgate, Muntinlupa City, Philippines" },

];

export const NEWS_ARTICLES = [
  {
    title: "SA TECH Showcases Advanced SMT Inspection Solutions",
    category: "Exhibition",
    date: "2026-02-12",
    summary: "Highlighted SPI/AOI capabilities for high-precision electronics manufacturing.",
    link: "#",
  },
  {
    title: "New Partnership Expands Automation Support in Southeast Asia",
    category: "Partnership",
    date: "2026-01-28",
    summary: "Regional collaboration to accelerate deployment and service response.",
    link: "#",
  },
  {
    title: "Preventive Maintenance Program Reduces Downtime by 30%",
    category: "Case Study",
    date: "2025-12-10",
    summary: "Customer success story across multi-line semiconductor operations.",
    link: "#",
  },
  {
    title: "SA TECH Engineers Complete Overseas Factory Certification",
    category: "Company",
    date: "2025-11-05",
    summary: "Factory-trained specialists now certified for additional platforms.",
    link: "#",
  },
];