/** The 40 supplied demo concepts. IDs, names and URLs are exact supplied values; every demo currently opens in English. */
export type Category = 'beauty' | 'food' | 'learning' | 'creative' | 'home' | 'retail' | 'stays' | 'services' | 'leisure' | 'community';

export interface Demo {
  id: string;
  slug: string;
  name: string;
  category: Category;
  url: string;
}

export const demos: readonly Demo[] = [
  { id: "LKWB-001", slug: "mirror-day", name: "Mirror Day", category: "beauty", url: "https://web-blitz.rajantha-rc.workers.dev/mirror-day/" },
  { id: "LKWB-002", slug: "kottu-fm", name: "Kottu FM", category: "food", url: "https://web-blitz.rajantha-rc.workers.dev/kottu-fm/" },
  { id: "LKWB-003", slug: "spark-bench", name: "Spark Bench", category: "learning", url: "https://web-blitz.rajantha-rc.workers.dev/spark-bench/" },
  { id: "LKWB-004", slug: "stillstory", name: "Stillstory", category: "creative", url: "https://web-blitz.rajantha-rc.workers.dev/stillstory/" },
  { id: "LKWB-005", slug: "room-and-rule", name: "Room & Rule", category: "home", url: "https://web-blitz.rajantha-rc.workers.dev/room-and-rule/" },
  { id: "LKWB-006", slug: "threadline", name: "Threadline", category: "retail", url: "https://web-blitz.rajantha-rc.workers.dev/threadline/" },
  { id: "LKWB-007", slug: "petal-parcel", name: "Petal Parcel", category: "retail", url: "https://web-blitz.rajantha-rc.workers.dev/petal-parcel/" },
  { id: "LKWB-008", slug: "rainroom", name: "Rainroom", category: "stays", url: "https://web-blitz.rajantha-rc.workers.dev/rainroom/" },
  { id: "LKWB-009", slug: "leaf-atlas", name: "Leaf Atlas", category: "food", url: "https://web-blitz.rajantha-rc.workers.dev/leaf-atlas/" },
  { id: "LKWB-010", slug: "ink-and-fold", name: "Ink & Fold", category: "creative", url: "https://web-blitz.rajantha-rc.workers.dev/ink-and-fold/" },
  { id: "LKWB-011", slug: "bay-signal", name: "Bay Signal", category: "services", url: "https://web-blitz.rajantha-rc.workers.dev/bay-signal/" },
  { id: "LKWB-012", slug: "sunshift", name: "Sunshift", category: "services", url: "https://web-blitz.rajantha-rc.workers.dev/sunshift/" },
  { id: "LKWB-013", slug: "second-spin", name: "Second Spin", category: "retail", url: "https://web-blitz.rajantha-rc.workers.dev/second-spin/" },
  { id: "LKWB-014", slug: "patch-bay", name: "Patch Bay", category: "creative", url: "https://web-blitz.rajantha-rc.workers.dev/patch-bay/" },
  { id: "LKWB-015", slug: "rally-grid", name: "Rally Grid", category: "leisure", url: "https://web-blitz.rajantha-rc.workers.dev/rally-grid/" },
  { id: "LKWB-016", slug: "cue-house", name: "Cue House", category: "creative", url: "https://web-blitz.rajantha-rc.workers.dev/cue-house/" },
  { id: "LKWB-017", slug: "wallfolk", name: "Wallfolk", category: "creative", url: "https://web-blitz.rajantha-rc.workers.dev/wallfolk/" },
  { id: "LKWB-018", slug: "pulse-post", name: "Pulse Post", category: "creative", url: "https://web-blitz.rajantha-rc.workers.dev/pulse-post/" },
  { id: "LKWB-019", slug: "load-logic", name: "Load Logic", category: "services", url: "https://web-blitz.rajantha-rc.workers.dev/load-logic/" },
  { id: "LKWB-020", slug: "facet-note", name: "Facet Note", category: "retail", url: "https://web-blitz.rajantha-rc.workers.dev/facet-note/" },
  { id: "LKWB-021", slug: "tenon-house", name: "Tenon House", category: "home", url: "https://web-blitz.rajantha-rc.workers.dev/tenon-house/" },
  { id: "LKWB-022", slug: "clay-loop", name: "Clay Loop", category: "retail", url: "https://web-blitz.rajantha-rc.workers.dev/clay-loop/" },
  { id: "LKWB-023", slug: "margin-walk", name: "Margin Walk", category: "retail", url: "https://web-blitz.rajantha-rc.workers.dev/margin-walk/" },
  { id: "LKWB-024", slug: "orbit-objects", name: "Orbit Objects", category: "retail", url: "https://web-blitz.rajantha-rc.workers.dev/orbit-objects/" },
  { id: "LKWB-025", slug: "table-parliament", name: "Table Parliament", category: "food", url: "https://web-blitz.rajantha-rc.workers.dev/table-parliament/" },
  { id: "LKWB-026", slug: "cutback-studio", name: "Cutback Studio", category: "creative", url: "https://web-blitz.rajantha-rc.workers.dev/cutback-studio/" },
  { id: "LKWB-027", slug: "cycle-crate", name: "Cycle Crate", category: "services", url: "https://web-blitz.rajantha-rc.workers.dev/cycle-crate/" },
  { id: "LKWB-028", slug: "latch-lab", name: "Latch Lab", category: "leisure", url: "https://web-blitz.rajantha-rc.workers.dev/latch-lab/" },
  { id: "LKWB-029", slug: "spice-assembly", name: "Spice Assembly", category: "food", url: "https://web-blitz.rajantha-rc.workers.dev/spice-assembly/" },
  { id: "LKWB-030", slug: "swap-courtyard", name: "Swap Courtyard", category: "community", url: "https://web-blitz.rajantha-rc.workers.dev/swap-courtyard/" },
  { id: "LKWB-031", slug: "afterlight-works", name: "Afterlight Works", category: "home", url: "https://web-blitz.rajantha-rc.workers.dev/afterlight-works/" },
  { id: "LKWB-032", slug: "sightline-signs", name: "Sightline Signs", category: "creative", url: "https://web-blitz.rajantha-rc.workers.dev/sightline-signs/" },
  { id: "LKWB-033", slug: "crumb-cut", name: "Crumb Cut", category: "food", url: "https://web-blitz.rajantha-rc.workers.dev/crumb-cut/" },
  { id: "LKWB-034", slug: "ripple-yard", name: "Ripple Yard", category: "home", url: "https://web-blitz.rajantha-rc.workers.dev/ripple-yard/" },
  { id: "LKWB-035", slug: "desk-mosaic", name: "Desk Mosaic", category: "community", url: "https://web-blitz.rajantha-rc.workers.dev/desk-mosaic/" },
  { id: "LKWB-036", slug: "lane-relay", name: "Lane Relay", category: "services", url: "https://web-blitz.rajantha-rc.workers.dev/lane-relay/" },
  { id: "LKWB-037", slug: "phrase-harbour", name: "Phrase Harbour", category: "learning", url: "https://web-blitz.rajantha-rc.workers.dev/phrase-harbour/" },
  { id: "LKWB-038", slug: "counterform", name: "Counterform", category: "creative", url: "https://web-blitz.rajantha-rc.workers.dev/counterform/" },
  { id: "LKWB-039", slug: "matchday-bureau", name: "Matchday Bureau", category: "leisure", url: "https://web-blitz.rajantha-rc.workers.dev/matchday-bureau/" },
  { id: "LKWB-040", slug: "bead-borough", name: "Bead Borough", category: "creative", url: "https://web-blitz.rajantha-rc.workers.dev/bead-borough/" },
];

export const categories: readonly Category[] = [...new Set(demos.map((demo) => demo.category))];

export const heroSlugs = ['kottu-fm', 'mirror-day', 'rainroom'] as const;

export const highlightSlugs = [
  'mirror-day', 'kottu-fm', 'rainroom', 'spice-assembly', 'leaf-atlas', 'petal-parcel',
  'pulse-post', 'stillstory', 'afterlight-works', 'threadline', 'orbit-objects', 'bead-borough',
] as const;

/** Live demos whose first screen captures blank or as an error page (see public/previews/capture-log.json). */
export const unusablePreviews: ReadonlySet<string> = new Set(['ink-and-fold', 'bay-signal', 'clay-loop', 'table-parliament', 'cutback-studio', 'swap-courtyard']);

export function demoBySlug(slug: string): Demo {
  const demo = demos.find((item) => item.slug === slug);
  if (!demo) throw new Error(`Unknown demo: ${slug}`);
  return demo;
}

export function previewSrc(slug: string, width: 320 | 640 | 1280): string {
  return `/previews/${slug}-${width}.webp`;
}

export function previewSrcset(slug: string): string {
  return ([320, 640, 1280] as const).map((width) => `${previewSrc(slug, width)} ${width}w`).join(', ');
}
