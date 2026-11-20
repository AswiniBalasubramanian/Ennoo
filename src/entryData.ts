// Activity-entry reference data: tags (ENNOO V1 Activity Tags, reviewed), people, gear and day marks.

/* ---------- Tags: one shared library, curated suggestions per activity ---------- */
export const TAG_LIBRARY = [
  "Balance", "Big Waves", "Breathing", "Brisk", "Cardio", "Challenge", "Commute", "Competition", "Core",
  "Doubles", "Downhill", "Easy", "Endurance", "Flexibility", "Focus", "For a Cause", "Full Body", "Grass",
  "Gravel", "Indoor", "Intervals", "Lake", "Long", "Lower Body", "Match", "Mobility", "Mud Ground",
  "Open Water", "Outdoor", "Park", "Performance", "Pool", "Pull", "Push", "Race", "Recovery",
  "Relaxation", "River", "Road", "Rocky", "Sand", "Sea", "Singles", "Small Waves", "Sparring",
  "Speed Work", "Steady", "Steep", "Street", "Strength", "Technique", "Tempo", "Time Trial", "Track",
  "Trail", "Uphill", "Upper Body", "Workout",
];

const t = (s: string) => s.split(", ");
const RACKET = t("Singles, Doubles, Workout, Match, Technique, Recovery");
const TEAM = t("Workout, Match, Technique, Recovery");
const WATER_PADDLE = t("Lake, River, Sea, Easy, Long, Intervals, Endurance, Workout, Race, Challenge, Time Trial, Recovery");

/* suggested tags per activity id, in the order the spec lists them */
export const TAGS: Record<string, string[]> = {
  run: t("Road, Track, Mud Ground, Grass, Easy, Long, Tempo, Intervals, Speed Work, Endurance, Recovery, Workout, Race, Time Trial, For a Cause"),
  trail: t("Rocky, Uphill, Downhill, Easy, Long, Intervals, Endurance, Recovery, Workout, Race, Time Trial, For a Cause"),
  hillrun: t("Road, Trail, Uphill, Downhill, Easy, Long, Intervals, Endurance, Recovery, Workout, Race, Challenge, Time Trial"),
  vrun: t("Easy, Long, Tempo, Intervals, Speed Work, Endurance, Recovery, Workout, Race, Challenge, Time Trial"),
  walk: t("Road, Track, Mud Ground, Grass, Easy, Long, Brisk, Recovery, Workout, Commute, Time Trial, For a Cause"),
  hike: t("Rocky, Uphill, Downhill, Easy, Long, Endurance, Workout, Challenge, Time Trial, For a Cause"),
  trek: t("Rocky, Uphill, Downhill, Easy, Long, Endurance, Workout, Challenge, For a Cause"),
  wheelchair: t("Road, Track, Grass, Easy, Long, Intervals, Speed Work, Endurance, Recovery, Workout, Race, Time Trial, For a Cause"),
  tri: t("Easy, Long, Intervals, Endurance, Recovery, Workout, Race, Challenge, Time Trial, For a Cause"),

  cycle: t("Road, Track, Gravel, Easy, Long, Tempo, Intervals, Endurance, Recovery, Workout, Race, Time Trial, Commute, For a Cause"),
  mtb: t("Rocky, Uphill, Downhill, Easy, Long, Intervals, Endurance, Recovery, Workout, Race, Time Trial, Challenge"),
  gravel: t("Road, Sand, Uphill, Downhill, Easy, Long, Intervals, Endurance, Workout, Race, Time Trial"),
  vride: t("Easy, Long, Tempo, Intervals, Endurance, Recovery, Workout, Race, Time Trial, Challenge"),
  ebike: t("Road, Gravel, Easy, Long, Commute, Challenge, For a Cause"),
  emtb: t("Rocky, Uphill, Downhill, Easy, Long, Challenge, Workout"),
  handcycle: t("Road, Track, Easy, Long, Intervals, Endurance, Recovery, Workout, Race, Time Trial, For a Cause"),
  velomobile: t("Road, Track, Easy, Long, Tempo, Intervals, Endurance, Workout, Race, Time Trial, Commute"),

  weights: t("Upper Body, Lower Body, Full Body, Push, Pull, Core, Strength, Recovery"),
  workout: t("Upper Body, Lower Body, Full Body, Core, Strength, Cardio, Intervals, Endurance, Recovery"),
  hiit: t("Full Body, Upper Body, Lower Body, Core, Strength, Cardio, Speed Work, Endurance, Recovery"),
  crossfit: t("Full Body, Strength, Cardio, Endurance, Technique, Competition, Time Trial, Recovery"),
  functional: t("Full Body, Upper Body, Lower Body, Core, Strength, Balance, Mobility, Recovery"),
  elliptical: t("Easy, Long, Tempo, Intervals, Endurance, Recovery, Workout, Time Trial"),
  stairs: t("Easy, Steady, Intervals, Speed Work, Endurance, Recovery, Workout, Challenge, Time Trial"),
  stepper: t("Easy, Steady, Intervals, Endurance, Recovery, Workout, Challenge, Time Trial"),
  yoga: t("Mobility, Balance, Flexibility, Recovery, Technique"),
  mobility: t("Upper Body, Lower Body, Full Body, Mobility, Flexibility, Recovery"),
  calisthenics: t("Upper Body, Lower Body, Full Body, Push, Pull, Core, Strength, Technique, Recovery"),
  weightmgmt: t("Workout, Cardio, Strength, Recovery, Easy, Challenge"),
  pilates: t("Full Body, Core, Mobility, Balance, Flexibility, Recovery"),
  boxing: t("Technique, Speed Work, Strength, Cardio, Workout, Sparring, Competition, Recovery"),
  martial: t("Technique, Strength, Mobility, Workout, Sparring, Competition, Recovery"),

  tennis: RACKET, padel: t("Doubles, Workout, Match, Technique, Recovery"), pickleball: RACKET, squash: RACKET,
  racquetball: RACKET, badminton: RACKET, tabletennis: RACKET,

  swim: t("Pool, Open Water, Easy, Long, Intervals, Endurance, Technique, Recovery, Workout, Race, Time Trial, For a Cause"),
  row: t("Indoor, Open Water, Easy, Long, Intervals, Endurance, Recovery, Workout, Race, Time Trial"),
  vrow: t("Easy, Long, Intervals, Endurance, Recovery, Workout, Race, Time Trial"),
  kayak: WATER_PADDLE, canoe: WATER_PADDLE,
  paddle: t("Lake, River, Sea, Easy, Long, Balance, Workout, Race, Challenge, Recovery"),
  surf: t("Small Waves, Big Waves, Technique, Workout, Competition, Challenge, Recovery"),
  windsurf: t("Lake, Sea, Easy, Technique, Workout, Race, Challenge, Recovery"),
  kitesurf: t("Sea, Lake, Easy, Technique, Workout, Race, Challenge, Recovery"),
  sail: t("Lake, River, Sea, Workout, Race, Challenge, Recovery"),

  ski: t("Easy, Steep, Technique, Workout, Race, Time Trial, Recovery"),
  backcountry: t("Easy, Long, Uphill, Downhill, Steep, Challenge, Recovery"),
  snowboard: t("Easy, Steep, Technique, Workout, Race, Challenge, Recovery"),
  nordic: t("Easy, Long, Intervals, Tempo, Endurance, Recovery, Workout, Race, Time Trial"),
  iceskate: t("Indoor, Outdoor, Easy, Long, Speed Work, Technique, Workout, Race, Time Trial, Recovery"),
  snowshoe: t("Easy, Long, Uphill, Downhill, Endurance, Workout, Race, Challenge, Time Trial, Recovery"),

  cricket: TEAM, kabaddi: TEAM, khokho: TEAM, football: TEAM, basketball: TEAM, volleyball: TEAM, hockey: TEAM,

  climb: t("Indoor, Outdoor, Easy, Strength, Technique, Workout, Challenge, Competition, Recovery"),
  skate: t("Road, Track, Indoor, Easy, Long, Speed Work, Workout, Race, Time Trial, Recovery"),
  rollerski: t("Road, Track, Easy, Long, Tempo, Intervals, Endurance, Workout, Race, Time Trial, Recovery"),
  skateboard: t("Street, Park, Easy, Technique, Workout, Challenge, Competition, Recovery"),
  golf: t("Workout, Competition, Technique, Challenge, Recovery"),
  dance: t("Workout, Performance, Technique, Cardio, Competition, Recovery"),
  meditation: t("Breathing, Relaxation, Focus, Recovery"),
  skipping: t("Easy, Intervals, Speed Work, Endurance, Workout, Challenge, Time Trial, Recovery"),
};
export const tagsFor = (id: string) => TAGS[id] ?? ["Workout", "Recovery"];
/* how many saved activities carry each tag (for search filters); a prototype sample */
export const TAG_COUNTS: Record<string, number> = { Easy: 42, Long: 18, Tempo: 9, Intervals: 14, Recovery: 21, Race: 6, Road: 33, Track: 11, Workout: 12, "Time Trial": 4, Commute: 7, "For a Cause": 2, Uphill: 5 };

/* ---------- Gear: shoes for runs, bikes for rides; replace reminders by distance ---------- */
export type GearKind = "shoe" | "bike" | "watch" | "bag" | "helmet" | "equipment" | "other";
export type Gear = { id: string; kind: GearKind; name: string; km: number; limit: number; img: string; uses?: string[]; brand?: string; model?: string; nickname?: string; notes?: string };
export const GEAR: Gear[] = [
  { id: "g-pegasus", kind: "shoe", name: "Nike Pegasus 41", km: 368.4, limit: 700, img: "/img/auth-shoe.png" },
  { id: "g-nitro", kind: "shoe", name: "PUMA Nitro White", km: 642.1, limit: 700, img: "/img/auth-shoe.png" },
  { id: "g-speedcross", kind: "shoe", name: "Salomon Speedcross 6", km: 121.8, limit: 800, img: "/img/auth-shoe.png" },
  { id: "g-domane", kind: "bike", name: "Trek Domane AL 2", km: 2140, limit: 5000, img: "/img/ride-sq.jpg" },
  { id: "g-hybrid", kind: "bike", name: "Btwin Riverside 120", km: 486, limit: 3000, img: "/img/ride.jpg" },
];

/* ---------- People: saved once, usable for any activity ---------- */
export type Person = { id: string; name: string; tint: string; last?: string; count: number; photo?: string };
export const PEOPLE: Person[] = [
  { id: "p-mani", name: "Mani", tint: "#F97066", last: "Used 2 days ago", count: 24 },
  { id: "p-karthik", name: "Karthik", tint: "#2E90FA", last: "Used 5 days ago", count: 18 },
  { id: "p-saravanan", name: "Saravanan", tint: "#12B76A", last: "Used last week", count: 6 },
  { id: "p-arun", name: "Arun", tint: "#F79009", count: 4 },
  { id: "p-bharath", name: "Bharath", tint: "#7A5AF8", count: 3 },
  { id: "p-deepak", name: "Deepak", tint: "#EE46BC", count: 2 },
  { id: "p-vignesh", name: "Vignesh", tint: "#15B79E", count: 2 },
  { id: "p-priya", name: "Priya", tint: "#DD2590", count: 1 },
];
export const PEOPLE_LIMIT = 50;

/* ---------- Mark this day: quick marks, the rest searchable ---------- */
export const MARK_TOP = ["Favorite", "Personal best", "Injury", "Bad day"];
export const MARK_ALL = [
  "Favorite", "Personal best", "Injury", "Bad day", "Felt strong", "Tired", "Sore", "Sick", "Low sleep",
  "Hot weather", "Rainy", "Windy", "First time", "Comeback", "Milestone", "New route", "Fasted",
];
