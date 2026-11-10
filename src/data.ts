// Sample data for the prototype. Replace with the app's real API.
// Photos are from Unsplash, saved in public/img so the prototype works offline.
import {
  SneakerMove, Sneaker, Mountains, Path, MonitorPlay, Footprints, Boot, PersonSimpleHike, WheelchairMotion, PersonSimpleSwim, PersonSimpleBike, PersonSimpleRun,
  Bicycle, Lightning, Wheelchair, Car, Barbell, Pulse, Timer, Fire, Target, Infinity, Steps, FlowerLotus, Spiral, PersonArmsSpread, Scales, YinYang, BoxingGlove,
  PersonSimpleTaiChi, TennisBall, Racquet, PingPong, Boat, Lifebuoy, Anchor, Drop, Waves, Wind, Island, Sailboat, PersonSimpleSki, Tree, PersonSimpleSnowboard,
  Snowflake, Baseball, HandGrabbing, SoccerBall, Basketball, Volleyball, Hockey, Disc, Golf, MusicNotes, Leaf,
} from "@phosphor-icons/react";
import { PadelIcon, PickleballIcon, SquashIcon, ShuttlecockIcon, JumpRopeIcon, combo, trio, type SportIconType } from "./sportIcons";
import type { Metric } from "./metrics";

export const img = {
  dawnRoad: "/img/dawn.jpg",
  ride: "/img/ride.jpg",
  swim: "/img/swim.jpg",
};

/* Welcome collage, three rows that drift in opposite directions */
export const collage = [
  ["/img/w/football.webp", "/img/w/yoga.webp", "/img/w/ride.webp", "/img/w/badminton.webp", "/img/w/run.webp", "/img/w/barbell.webp"],
  ["/img/w/surf.webp", "/img/w/tennis.webp", "/img/w/hike.webp", "/img/w/jumprope.webp", "/img/w/golf.webp", "/img/w/stairs.webp"],
  ["/img/w/ski.webp", "/img/w/dumbbell.webp", "/img/w/trail.webp", "/img/w/plank.webp", "/img/w/race.webp"],
];

export type Group = "Foot" | "Cycling" | "Fitness" | "Racket" | "Water" | "Snow" | "Team" | "Other";
/* The 8 categories from the Ennoo activity spec, each with a one-line description and a header icon */
export const groupInfo: Record<Group, { label: string; about: string; Icon: SportIconType }> = {
  Foot: { label: "Foot sports", about: "Running, walking, hiking and all foot-based activities.", Icon: SneakerMove },
  Cycling: { label: "Cycling", about: "Road, mountain, gravel and all cycling activities.", Icon: Bicycle },
  Fitness: { label: "Fitness & training", about: "Gym, strength, studio and mind-body training.", Icon: Barbell },
  Racket: { label: "Racket sports", about: "Tennis, badminton, padel and every racket game.", Icon: TennisBall },
  Water: { label: "Water sports", about: "Paddling, sailing, surfing and all water activities.", Icon: Waves },
  Snow: { label: "Snow & ice", about: "Skiing, snowboarding, skating and winter sports.", Icon: Snowflake },
  Team: { label: "Team sports", about: "Cricket, kabaddi, football and every team game.", Icon: SoccerBall },
  Other: { label: "Other activities", about: "Climbing, skating, golf, dance and more.", Icon: MusicNotes },
};
export const groupLabel = Object.fromEntries(Object.entries(groupInfo).map(([k, v]) => [k, v.label])) as Record<Group, string>;
export const groupOrder = Object.keys(groupInfo) as Group[];
// metrics: only the onboarding goal metrics relevant to the activity, in the spec's order; noun: what one session is called
export type Activity = { id: string; name: string; group: Group; Icon: SportIconType; metrics: Metric[]; noun: string };

// The final V1 list: 70 activities across 8 categories (Ennoo "Activities & Goal Metrics").
export const activities: Activity[] = [
  // Foot
  { id: "run", name: "Run", group: "Foot", Icon: SneakerMove, metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "runs" },
  { id: "hillrun", name: "Hill run", group: "Foot", Icon: combo(Sneaker, Mountains), metrics: ["distance", "duration", "sessions", "reps", "performance"], noun: "hill runs" },
  { id: "trail", name: "Trail run", group: "Foot", Icon: combo(SneakerMove, Tree), metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "runs" },
  { id: "vrun", name: "Virtual run", group: "Foot", Icon: combo(Sneaker, MonitorPlay), metrics: ["distance", "duration", "sessions", "reps", "performance"], noun: "runs" },
  { id: "walk", name: "Walk", group: "Foot", Icon: Footprints, metrics: ["distance", "duration", "sessions", "reps", "steps", "laps", "performance"], noun: "walks" },
  { id: "hike", name: "Hike", group: "Foot", Icon: combo(Boot, Mountains), metrics: ["distance", "duration", "sessions", "reps", "steps", "performance"], noun: "hikes" },
  { id: "trek", name: "Trekking", group: "Foot", Icon: PersonSimpleHike, metrics: ["distance", "duration", "sessions", "reps", "steps", "performance"], noun: "treks" },
  { id: "wheelchair", name: "Wheelchair", group: "Foot", Icon: WheelchairMotion, metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "pushes" },
  { id: "tri", name: "Triathlon", group: "Foot", Icon: trio(PersonSimpleSwim, PersonSimpleBike, PersonSimpleRun), metrics: ["distance", "duration", "sessions"], noun: "races" },
  // Cycling
  { id: "cycle", name: "Ride", group: "Cycling", Icon: Bicycle, metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "rides" },
  { id: "mtb", name: "Mountain bike ride", group: "Cycling", Icon: combo(Bicycle, Mountains), metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "rides" },
  { id: "gravel", name: "Gravel ride", group: "Cycling", Icon: combo(Bicycle, Path), metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "rides" },
  { id: "vride", name: "Virtual ride", group: "Cycling", Icon: combo(Bicycle, MonitorPlay), metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "rides" },
  { id: "ebike", name: "E-bike ride", group: "Cycling", Icon: combo(Bicycle, Lightning), metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "rides" },
  { id: "emtb", name: "E-mountain bike ride", group: "Cycling", Icon: combo(Bicycle, Lightning, Mountains), metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "rides" },
  { id: "handcycle", name: "Handcycle", group: "Cycling", Icon: Wheelchair, metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "rides" },
  { id: "velomobile", name: "Velomobile", group: "Cycling", Icon: Car, metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "rides" },
  // Fitness
  { id: "weights", name: "Weight training", group: "Fitness", Icon: Barbell, metrics: ["duration", "sessions"], noun: "workouts" },
  { id: "workout", name: "Workout", group: "Fitness", Icon: Pulse, metrics: ["duration", "sessions"], noun: "workouts" },
  { id: "hiit", name: "HIIT", group: "Fitness", Icon: Timer, metrics: ["duration", "sessions"], noun: "workouts" },
  { id: "crossfit", name: "CrossFit", group: "Fitness", Icon: Fire, metrics: ["duration", "sessions"], noun: "workouts" },
  { id: "functional", name: "Functional training", group: "Fitness", Icon: Target, metrics: ["duration", "sessions"], noun: "workouts" },
  { id: "elliptical", name: "Elliptical", group: "Fitness", Icon: Infinity, metrics: ["distance", "duration", "sessions"], noun: "workouts" },
  { id: "stairs", name: "Stair climbing", group: "Fitness", Icon: Steps, metrics: ["duration", "sessions", "steps", "reps"], noun: "climbs" },
  { id: "stepper", name: "Stair stepper", group: "Fitness", Icon: combo(Steps, Lightning), metrics: ["duration", "sessions", "steps"], noun: "workouts" },
  { id: "yoga", name: "Yoga", group: "Fitness", Icon: FlowerLotus, metrics: ["duration", "sessions"], noun: "sessions" },
  { id: "mobility", name: "Mobility / Stretching", group: "Fitness", Icon: Spiral, metrics: ["duration", "sessions"], noun: "sessions" },
  { id: "calisthenics", name: "Calisthenics", group: "Fitness", Icon: PersonArmsSpread, metrics: ["duration", "sessions"], noun: "workouts" },
  { id: "weightmgmt", name: "Weight management", group: "Fitness", Icon: Scales, metrics: ["weight"], noun: "weigh-ins" },
  { id: "pilates", name: "Pilates", group: "Fitness", Icon: YinYang, metrics: ["duration", "sessions"], noun: "sessions" },
  { id: "boxing", name: "Boxing", group: "Fitness", Icon: BoxingGlove, metrics: ["duration", "sessions"], noun: "sessions" },
  { id: "martial", name: "Martial arts", group: "Fitness", Icon: PersonSimpleTaiChi, metrics: ["duration", "sessions"], noun: "sessions" },
  // Racket
  { id: "tennis", name: "Tennis", group: "Racket", Icon: TennisBall, metrics: ["duration", "sessions"], noun: "matches" },
  { id: "padel", name: "Padel", group: "Racket", Icon: PadelIcon, metrics: ["duration", "sessions"], noun: "matches" },
  { id: "pickleball", name: "Pickleball", group: "Racket", Icon: PickleballIcon, metrics: ["duration", "sessions"], noun: "matches" },
  { id: "squash", name: "Squash", group: "Racket", Icon: SquashIcon, metrics: ["duration", "sessions"], noun: "matches" },
  { id: "racquetball", name: "Racquetball", group: "Racket", Icon: Racquet, metrics: ["duration", "sessions"], noun: "matches" },
  { id: "badminton", name: "Badminton", group: "Racket", Icon: ShuttlecockIcon, metrics: ["duration", "sessions"], noun: "matches" },
  { id: "tabletennis", name: "Table tennis", group: "Racket", Icon: PingPong, metrics: ["duration", "sessions"], noun: "matches" },
  // Water
  { id: "swim", name: "Swim", group: "Water", Icon: PersonSimpleSwim, metrics: ["distance", "duration", "sessions", "laps", "reps", "performance"], noun: "swims" },
  { id: "row", name: "Rowing", group: "Water", Icon: Boat, metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "rows" },
  { id: "vrow", name: "Virtual row", group: "Water", Icon: combo(Boat, MonitorPlay), metrics: ["distance", "duration", "sessions", "reps", "laps", "performance"], noun: "rows" },
  { id: "kayak", name: "Kayaking", group: "Water", Icon: Lifebuoy, metrics: ["distance", "duration", "sessions", "reps", "laps"], noun: "paddles" },
  { id: "canoe", name: "Canoeing", group: "Water", Icon: Anchor, metrics: ["distance", "duration", "sessions", "reps", "laps"], noun: "paddles" },
  { id: "paddle", name: "Stand-up paddling", group: "Water", Icon: Drop, metrics: ["distance", "duration", "sessions", "reps", "laps"], noun: "paddles" },
  { id: "surf", name: "Surfing", group: "Water", Icon: Waves, metrics: ["duration", "sessions"], noun: "surfs" },
  { id: "windsurf", name: "Windsurfing", group: "Water", Icon: Wind, metrics: ["distance", "duration", "sessions"], noun: "sessions" },
  { id: "kitesurf", name: "Kitesurfing", group: "Water", Icon: Island, metrics: ["distance", "duration", "sessions"], noun: "sessions" },
  { id: "sail", name: "Sailing", group: "Water", Icon: Sailboat, metrics: ["distance", "duration", "sessions"], noun: "sails" },
  // Snow
  { id: "ski", name: "Alpine ski", group: "Snow", Icon: PersonSimpleSki, metrics: ["distance", "duration", "sessions"], noun: "ski days" },
  { id: "nordic", name: "Nordic ski", group: "Snow", Icon: combo(PersonSimpleSki, Tree), metrics: ["distance", "duration", "sessions", "reps", "laps"], noun: "ski days" },
  { id: "backcountry", name: "Backcountry ski", group: "Snow", Icon: combo(PersonSimpleSki, Mountains), metrics: ["distance", "duration", "sessions"], noun: "tours" },
  { id: "snowboard", name: "Snowboard", group: "Snow", Icon: PersonSimpleSnowboard, metrics: ["distance", "duration", "sessions"], noun: "days" },
  { id: "snowshoe", name: "Snowshoe", group: "Snow", Icon: combo(Boot, Snowflake), metrics: ["distance", "duration", "sessions", "reps"], noun: "outings" },
  { id: "iceskate", name: "Ice skating", group: "Snow", Icon: combo(Sneaker, Snowflake), metrics: ["distance", "duration", "sessions", "reps", "laps"], noun: "sessions" },
  // Team
  { id: "cricket", name: "Cricket", group: "Team", Icon: Baseball, metrics: ["duration", "sessions"], noun: "matches" },
  { id: "kabaddi", name: "Kabaddi", group: "Team", Icon: HandGrabbing, metrics: ["duration", "sessions"], noun: "matches" },
  { id: "khokho", name: "Kho kho", group: "Team", Icon: PersonSimpleRun, metrics: ["duration", "sessions"], noun: "matches" },
  { id: "football", name: "Football", group: "Team", Icon: SoccerBall, metrics: ["duration", "sessions"], noun: "matches" },
  { id: "basketball", name: "Basketball", group: "Team", Icon: Basketball, metrics: ["duration", "sessions"], noun: "matches" },
  { id: "volleyball", name: "Volleyball", group: "Team", Icon: Volleyball, metrics: ["duration", "sessions"], noun: "matches" },
  { id: "hockey", name: "Hockey", group: "Team", Icon: Hockey, metrics: ["duration", "sessions"], noun: "matches" },
  // Other
  { id: "climb", name: "Rock climbing", group: "Other", Icon: Mountains, metrics: ["duration", "sessions", "reps"], noun: "climbs" },
  { id: "skate", name: "Inline skating", group: "Other", Icon: combo(Sneaker, Disc), metrics: ["distance", "duration", "sessions", "reps", "laps"], noun: "skates" },
  { id: "rollerski", name: "Roller ski", group: "Other", Icon: combo(PersonSimpleSki, Path), metrics: ["distance", "duration", "sessions", "reps", "laps"], noun: "sessions" },
  { id: "skateboard", name: "Skateboarding", group: "Other", Icon: Disc, metrics: ["distance", "duration", "sessions"], noun: "sessions" },
  { id: "golf", name: "Golf", group: "Other", Icon: Golf, metrics: ["duration", "sessions"], noun: "rounds" },
  { id: "dance", name: "Dance", group: "Other", Icon: MusicNotes, metrics: ["duration", "sessions"], noun: "sessions" },
  { id: "meditation", name: "Meditation", group: "Other", Icon: Leaf, metrics: ["duration", "sessions"], noun: "sessions" },
  { id: "skipping", name: "Skipping / Jump rope", group: "Other", Icon: JumpRopeIcon, metrics: ["duration", "sessions", "count"], noun: "sessions" },
];
export const byId = (id: string) => activities.find((a) => a.id === id)!;

export const athlete = { first: "Kavya", last: "Raman", city: "Chennai", since: "March 2025" };

// Primary goal. Today is Wed 21 Oct 2026, 71 days to 31 Dec.
export const goal = {
  activity: "run",
  title: "Run 1,000 km",
  current: 742,
  target: 1000,
  unit: "km",
  due: "31 Dec 2026",
  daysLeft: 71,
  // cumulative km at the end of each month, Jan..Oct
  history: [48, 121, 196, 262, 341, 405, 478, 561, 655, 742],
};

export const otherGoals = [
  { activity: "stairs", title: "Climb 110 floors", current: 68, target: 110, unit: "floors", due: "30 Nov" },
  { activity: "yoga", title: "40 yoga sessions", current: 31, target: 40, unit: "sessions", due: "31 Dec" },
];

export type Entry = {
  id: string; activity: string; title: string; when: string; day: string;
  distance?: string; duration: string; pace?: string; place: string; note: string; feel: number; photo?: string; pb?: string;
};

export const entries: Entry[] = [
  { id: "a1", activity: "run", title: "Adyar river tempo", when: "Today, 6:12 AM", day: "Today", distance: "8.42 km", duration: "44:07", pace: "5:14 /km", place: "Adyar river loop", note: "Legs felt heavy for the first two km, then everything clicked by the bridge.", feel: 7, photo: img.dawnRoad, pb: "Fastest 5K this year" },
  { id: "a2", activity: "yoga", title: "Evening flow", when: "Yesterday, 7:30 PM", day: "Yesterday", duration: "45:00", place: "Home", note: "", feel: 3 },
  { id: "a3", activity: "cycle", title: "ECR coffee ride", when: "Sun, 5:40 AM", day: "Sunday", distance: "52.6 km", duration: "1:48:22", pace: "29.1 km/h", place: "East Coast Road", note: "Headwind all the way to Kovalam. Worth it for the filter coffee.", feel: 6, photo: img.ride },
  { id: "a4", activity: "swim", title: "Sea swim", when: "Sat, 6:30 AM", day: "Saturday", distance: "1.80 km", duration: "38:51", pace: "2:09 /100 m", place: "Elliot's Beach", note: "Calm water. Sighted off the lighthouse and swam straight for once.", feel: 5, photo: img.swim },
  { id: "a5", activity: "stairs", title: "Office stairs", when: "Fri, 1:10 PM", day: "Friday", duration: "18:30", place: "Tidel Park", note: "12 floors, twice. Lunch break well spent.", feel: 6 },
];

// Sun..Sat, 18..24 Oct. Today is Wednesday 21.
export const week = [
  { d: "Sun", n: 18, done: true },
  { d: "Mon", n: 19, done: false },
  { d: "Tue", n: 20, done: true },
  { d: "Wed", n: 21, done: true, today: true },
  { d: "Thu", n: 22, done: false, planned: true },
  { d: "Fri", n: 23, done: false },
  { d: "Sat", n: 24, done: false, planned: true },
];

export const locations = [
  { name: "Adyar river loop", count: 14, kind: "runs", last: "Today" },
  { name: "Elliot's Beach", count: 9, kind: "swims", last: "Sat" },
  { name: "Guindy National Park", count: 5, kind: "walks", last: "2 Oct" },
];

export const bests = [
  { label: "5K", value: "24:18", when: "Today", fresh: true },
  { label: "10K", value: "51:02", when: "14 Aug" },
  { label: "Half marathon", value: "1:56:40", when: "7 Jan" },
  { label: "Longest ride", value: "112 km", when: "2 Mar" },
];

export const mottos = [
  "Consistency beats intensity every single time.",
  "Every step today builds the me of tomorrow.",
  "Pain is temporary, pride is forever.",
  "Small daily wins build giant victories.",
  "Outwork your yesterday.",
];

// 13 weeks x 7 days: 0 rest, 1 light, 2 solid, 3 key session
export const consistency: number[] = [
  0,2,0,1,0,3,0, 1,0,2,0,2,3,0, 0,2,1,0,2,3,0, 2,0,2,1,0,3,1,
  0,1,2,0,2,3,0, 2,0,0,2,1,3,0, 0,2,2,0,1,3,1, 1,0,2,2,0,3,0,
  2,0,1,2,0,3,0, 0,2,0,2,2,3,1, 1,2,0,2,0,3,0, 2,0,2,1,0,3,0,
  2,0,2,2,
];

/* Extra search terms: the spec keeps Ironman races searchable under Triathlon rather than as their own activities */
const aliases: Record<string, string> = { tri: "ironman 70.3 half ironman full ironman", skipping: "jump rope skip", mobility: "stretching", cycle: "bike cycling", weightmgmt: "body weight loss" };
export const matches = (a: Activity, q: string) => {
  const s = q.trim().toLowerCase();
  return !s || a.name.toLowerCase().includes(s) || (aliases[a.id] ?? "").includes(s);
};

/* Saved places a Reps or Laps goal can point at. Goals keep the place's id, not its typed name,
   so daily entries can be matched to the exact route, hill or track. */
export type PlaceType = "Track" | "Hill" | "Road" | "Loop";
// img: a photo of the place; away: km from where you are (the prototype's simulated GPS fix, Adyar, Chennai); area: neighbourhood shown in search
export type Place = { id: string; name: string; dist: number; unit: "m" | "km" | "mi"; type: PlaceType; img?: string; away?: number; area?: string };
export const savedPlaces: Place[] = [
  { id: "pl-ssp-track", name: "Salem Steel Plant Track", dist: 400, unit: "m", type: "Track", img: "/img/places/track.jpg", away: 3.4, area: "Kotturpuram" },
  { id: "pl-chithra-hill", name: "Chithra Kovil Hill", dist: 1.2, unit: "km", type: "Hill", img: "/img/places/hill2.jpg", away: 6.8, area: "Velachery" },
  { id: "pl-adyar-loop", name: "Adyar river loop", dist: 5, unit: "km", type: "Loop", img: "/img/places/loop.jpg", away: 0.6, area: "Adyar" },
  { id: "pl-elliots-road", name: "Elliot's Beach road", dist: 2.4, unit: "km", type: "Road", img: "/img/places/road.jpg", away: 2.1, area: "Besant Nagar" },
];
/* What a GPS search finds around you, beyond your saved places */
export const nearbyPlaces: Place[] = [
  { id: "pl-nehru-stadium", name: "Nehru Stadium track", dist: 400, unit: "m", type: "Track", img: "/img/places/stadium.jpg", away: 9.2, area: "Periamet" },
  { id: "pl-guindy-park", name: "Guindy park path", dist: 3.2, unit: "km", type: "Loop", img: "/img/places/park.jpg", away: 4.5, area: "Guindy" },
  { id: "pl-mount-steps", name: "St. Thomas Mount steps", dist: 0.8, unit: "km", type: "Hill", img: "/img/places/hill.jpg", away: 8.1, area: "St. Thomas Mount" },
  { id: "pl-marina-road", name: "Marina promenade", dist: 6, unit: "km", type: "Road", img: "/img/places/road.jpg", away: 7.3, area: "Marina" },
  { id: "pl-iit-track", name: "IIT Madras track", dist: 400, unit: "m", type: "Track", img: "/img/places/track.jpg", away: 1.9, area: "Guindy" },
];
