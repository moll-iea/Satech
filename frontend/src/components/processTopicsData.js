const RAW_PROCESS_TOPICS = [
  {
    id: "tester-parts",
    icon: "tester",
    title: "Tester Parts & Service Localization",
    desc:
      "Local sourcing and servicing of IC tester spare parts to cut lead time and currency exposure, keeping production-critical testers running without waiting on overseas suppliers.",
  },
  {
    id: "laser-interferometer",
    icon: "laser",
    title: "Laser Interferometer for Wirebonder & Diebonder",
    desc:
      "Non-contact laser measurement introduced to calibrate and verify motion accuracy on wirebonding and die attach equipment, tightening repeatability and cutting calibration downtime.",
  },
  {
    id: "surface-profiler",
    icon: "profiler",
    title: "Surface Profilers",
    desc:
      "High-resolution metrology for flatness, roughness, and step height on substrates and packages, supporting tighter process control through die attach and encapsulation.",
  },
  {
    id: "bond-test-repurpose",
    icon: "bondtest",
    title: "Repurposed Bond Testing Applications",
    desc:
      "Existing bond testers reconfigured to cover die shear, ball shear, wire pull, solder ball, and stud pull methods — expanding test coverage without new capital equipment.",
  },
  {
    id: "bond-tester-computerization",
    icon: "computer",
    title: "Bond Tester Computerization",
    desc:
      "Legacy bond testers upgraded with computerized control and data logging, enabling automated sequencing, statistical process control, and digital traceability of results.",
  },
  {
    id: "snap-cure",
    icon: "epoxy",
    title: "Snap Cure Diebond Materials",
    desc:
      "Fast-curing die attach epoxies introduced to shorten cure cycle time, lifting throughput while holding bond reliability to the same standard.",
  },
  {
    id: "high-volume-bond",
    icon: "inline",
    title: "High-Volume Bond Testing",
    desc:
      "Inline & standalone, high-throughput bond testing brought in to match rising production volumes and remove sampling as a line bottleneck.",
  },
  {
    id: "xray-computerization",
    icon: "xray",
    title: "X-ray Machine Computerization",
    desc:
      "Existing X-ray inspection systems upgraded with computerized imaging and analysis software — extending equipment life while sharpening void and defect detection.",
  },
  {
    id: "3d-xray",
    icon: "xray3d",
    title: "3D X-ray Inspection",
    desc:
      "3D X-ray introduced for non-destructive, cross-sectional analysis of solder joints, wire bonds, and internal package structures — revealing defects standard 2D imaging misses.",
  },
  {
    id: "pcb-router",
    icon: "router",
    title: "Cost-Effective Cleanroom PCB Router",
    desc:
      "Compact, budget-conscious PCB routing brought into the cleanroom for prototyping and small-batch runs, reducing reliance on outsourced board fabrication.",
  },
  {
    id: "cmm-computerization",
    icon: "cmm",
    title: "CMM Computerization",
    desc:
      "Coordinate measuring equipment upgraded with computerized vision and probing for precise, repeatable dimensional inspection of mechanical parts.",
  },
  {
    id: "aoi-automation",
    icon: "aoi",
    title: "Automation of 3rd Optical Inspection",
    desc:
      "An AOI stage automated into the process, catching placement and assembly defects earlier and cutting reliance on manual visual checks.",
  },
  {
    id: "wafer-300mm",
    icon: "wafer",
    title: "Introduction of 300mm Wafer Inspection",
    desc:
      "As fabs scale up to larger 300mm wafer formats, inspection processes must keep pace with automated, high-throughput wafer inspection systems capable of handling the larger substrate size without sacrificing defect resolution.",
  },
  {
    id: "breadboard-station",
    icon: "breadboard",
    title: "Manual Breadboard Station for Troubleshooting",
    desc:
      "For quick, low-cost circuit troubleshooting and prototyping, a manual breadboard station paired with a partner power supply gives technicians a flexible bench setup for testing and switching between configurations on the fly.",
  },
  {
    id: "3d-spi",
    icon: "spi3d",
    title: "Introduction of 3D Solder Paste Inspection",
    desc:
      "To catch solder paste volume, height, and alignment defects before reflow, 3D solder paste inspection (SPI) systems provide full volumetric measurement of every pad on the board.",
  },
  {
    id: "xray-tape-reel",
    icon: "xray",
    title: "Repurpose of X-ray Machine for Tape and Reel Inspection",
    desc:
      "Rather than investing in a dedicated system, an existing X-ray machine can be repurposed for tape and reel inspection, verifying component orientation and integrity directly through the packaging.",
  },
  {
    id: "lead-free-selective-soldering",
    icon: "solder",
    title: "Introduction to Lead-Free Selective Soldering",
    desc:
      "With the shift to lead-free assembly, selective soldering automation targets precise solder joints on mixed-technology boards without exposing nearby components to thermal stress.",
  },
  {
    id: "automated-inline-xray",
    icon: "inlinexray",
    title: "Introduction of Automated Inline X-ray",
    desc:
      "For continuous, non-destructive inspection on the line, automated inline X-ray systems detect voids, shorts, and hidden solder defects as boards move through production without slowing throughput.",
  },
  {
    id: "automated-inline-xray-aoi",
    icon: "inline",
    title: "Introduction of Automated Inline X-ray and AOI",
    desc:
      "Combining automated inline X-ray with automated optical inspection (AOI) gives a single line both subsurface and surface-level defect detection in one integrated inspection step.",
  },
  {
    id: "leadframe-chemical-cleaning",
    icon: "cleaning",
    title: "Automation for Chemical Cleaning of Leadframe",
    desc:
      "To remove oxidation and contaminants before die attach or plating, automated chemical cleaning systems process leadframes through controlled wash and dry cycles for consistent surface quality.",
  },
  {
    id: "high-volume-lid-attach",
    icon: "lidattach",
    title: "High Volume Lid Attach and Bonding",
    desc:
      "For sealing packages at production scale, high-volume lid attach and bonding equipment applies precise adhesive dispensing and placement to keep throughput high while maintaining seal integrity.",
  },
  {
    id: "cost-effective-wafer-inspection",
    icon: "wafer",
    title: "Cost-Effective Wafer Inspection",
    desc:
      "For a reliable defect detection without the cost of a full-scale system, cost-effective wafer inspection equipment offers a leaner alternative that still meets core inspection requirements.",
  },
  {
    id: "spi-to-aoi-repurpose",
    icon: "aoi",
    title: "Repurpose Use of 3D SPI to 3D AOI",
    desc:
      "An existing 3D solder paste inspection system was repurposed to function as 3D automated optical inspection, extending its use from pre-reflow paste checks to post-reflow component and solder joint verification.",
  },
  {
    id: "trim-form-to-press",
    icon: "press",
    title: "Repurpose Use of Trim and Form to Press Machine",
    desc:
      "A trim and form machine was repurposed as a press machine, reusing its mechanical force and tooling setup for stamping or forming operations outside its original function.",
  },
  {
    id: "xray-bin-inspection",
    icon: "xray",
    title: "Repurpose of X-ray Machine for Bin Inspection",
    desc:
      "An existing X-ray machine can also be repurposed for bin inspection, screening packaged units for internal defects as part of final quality sorting.",
  },
  {
    id: "uv-cure-diebond",
    icon: "epoxy",
    title: "Introduction of UV Cure Diebond Materials",
    desc:
      "For faster, more stable die attach processes, UV cure diebond materials (epoxy-based) cure rapidly under UV exposure instead of relying solely on thermal curing, shortening cycle time.",
  },
  {
    id: "xray-counter-inspection",
    icon: "xray",
    title: "Introduction of X-ray Counter Inspection",
    desc:
      "For counting and verifying component quantities within sealed packaging, X-ray counter inspection uses X-ray imaging to confirm exact unit counts without opening the package.",
  },
  {
    id: "advanced-packaging-market-trends",
    icon: "xray3d",
    title: "Advanced Packaging: Market Trends and Outlook",
    url: "https://insights.trendforce.com/p/advanced-packaging-market-trends",
    desc:
      "AI-driven demand is accelerating advanced packaging, with CoWoS and other high-density packaging technologies expanding to support growing chiplet integration and high-bandwidth computing.",
  },
  {
    id: "panel-level-packaging",
    icon: "wafer",
    title: "The Rise of Panel-Level Packaging",
    url: "https://semiengineering.com/the-rise-of-panel-level-packaging/",
    desc:
      "AI and HPC are accelerating panel-level packaging, enabling larger packages, higher material efficiency, and lower costs - while advances in alignment, die placement, warpage control, and organic or glass-core interposers remain critical for high-volume production.",
  },
  {
    id: "xray-vs-aoi-hidden-defects",
    icon: "xray",
    title: "X-Ray vs. AOI: Hidden Defect Detection",
    url: "https://www.smtfactory.com/amp/X-ray-vs-AOI-Which-Defects-Are-Invisible-To-Optical-Inspection-id49040375.html",
    desc:
      "X-ray inspection goes beyond surface-level inspection, uncovering hidden solder defects and internal issues that AOI can miss - helping manufacturers improve quality, reliability, and production confidence.",
  },
  {
    id: "2d-vs-3d-aoi",
    icon: "aoi",
    title: "2D vs. 3D AOI: Choosing the Right Inspection Method",
    url: "https://www.smtfactory.com/2d-vs-3d-aoi-explained-which-inspection-method-suits-your",
    desc:
      "2D AOI delivers fast, cost-effective inspection for standard PCBs, while 3D AOI provides deeper defect detection and precise height and volume measurements - making it ideal for complex, high-reliability applications.",
  },
  {
    id: "swir-semiconductor-inspection",
    icon: "xray3d",
    title: "Using SWIR Imaging in Semiconductor Inspection",
    url: "https://www.azom.com/article.aspx?ArticleID=25457",
    desc:
      "SWIR imaging enables non-destructive inspection beneath silicon and inside semiconductor packages, revealing hidden defects such as cracks, voids, misalignment, and contamination - improving failure analysis and inspection of advanced devices.",
  },
];

export const PROCESS_TOPICS = [...RAW_PROCESS_TOPICS].reverse();