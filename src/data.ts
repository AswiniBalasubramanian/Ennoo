// Sample data for the prototype. Replace with the app's real API.
// Photos are from Unsplash, saved in public/img so the prototype works offline.
import {
  SneakerMove, Path, MonitorPlay, Footprints, Boot, Backpack, WheelchairMotion, Medal, Bicycle, Mountains, Compass, Monitor, Lightning, BatteryCharging, Wheelchair, Car, Barbell, HandFist, Pulse, Timer, ChartLine, Target, Infinity, Steps, Equalizer, FlowerLotus, YinYang, Spiral, ArrowsOutLineHorizontal, Bandaids, TennisBall, Racquet, PingPong, SwimmingPool, Boat, Television, Lifebuoy, Anchor, Drop, Waves, Wind, Island, Sailboat, Snowflake, Tree, CloudSnow, Sneaker, SoccerBall, Basketball, Volleyball, Baseball, Hockey, Disc, Golf, MusicNotes,
} from "@phosphor-icons/react";
import { PadelIcon, PickleballIcon, SquashIcon, ShuttlecockIcon, type SportIconType } from "./sportIcons";

export const img = {
  dawnRoad: "/img/dawn.jpg",
  ride: "/img/ride.jpg",
  swim: "/img/swim.jpg",
};

/* Welcome collage, three rows that drift in opposite directions */
export const collage = [
  ["/img/golf.jpg", "/img/football.jpg", "/img/tennis.jpg", "/img/run-sq.jpg"],
  ["/img/hike.jpg", "/img/ski.jpg", "/img/yoga.jpg", "/img/swim-sq.jpg"],
  ["/img/ride-sq.jpg", "/img/lift.jpg", "/img/stairs.jpg", "/img/tennis.jpg"],
];

export type Group = "Endurance" | "Cycling" | "Strength" | "Racket" | "Water" | "Snow" | "Team" | "Other";
export const groupLabel: Record<Group, string> = {
  Endurance: "Endurance & outdoor", Cycling: "Cycling", Strength: "Strength & fitness", Racket: "Racket sports",
  Water: "Water sports", Snow: "Snow & ice", Team: "Team sports", Other: "Other sports",
};
export const groupOrder = Object.keys(groupLabel) as Group[];
export type Activity = { id: string; name: string; group: Group; Icon: typeof SneakerMove | SportIconType; unit: string };

// Every sport people log, grouped the way athletes think about them.
export const activities: Activity[] = [
  { id: "run", name: "Run", group: "Endurance", Icon: SneakerMove, unit: "km" },
  { id: "trail", name: "Trail run", group: "Endurance", Icon: Path, unit: "km" },
  { id: "vrun", name: "Virtual run", group: "Endurance", Icon: MonitorPlay, unit: "km" },
  { id: "walk", name: "Walk", group: "Endurance", Icon: Footprints, unit: "km" },
  { id: "hike", name: "Hike", group: "Endurance", Icon: Boot, unit: "km" },
  { id: "trek", name: "Trekking", group: "Endurance", Icon: Backpack, unit: "km" },
  { id: "wheelchair", name: "Wheelchair", group: "Endurance", Icon: WheelchairMotion, unit: "km" },
  { id: "tri", name: "Triathlon", group: "Endurance", Icon: Medal, unit: "races" },
  { id: "cycle", name: "Ride", group: "Cycling", Icon: Bicycle, unit: "km" },
  { id: "mtb", name: "Mountain bike ride", group: "Cycling", Icon: Mountains, unit: "km" },
  { id: "gravel", name: "Gravel ride", group: "Cycling", Icon: Compass, unit: "km" },
  { id: "vride", name: "Virtual ride", group: "Cycling", Icon: Monitor, unit: "km" },
  { id: "ebike", name: "E-bike ride", group: "Cycling", Icon: Lightning, unit: "km" },
  { id: "emtb", name: "E-mountain bike ride", group: "Cycling", Icon: BatteryCharging, unit: "km" },
  { id: "handcycle", name: "Handcycle", group: "Cycling", Icon: Wheelchair, unit: "km" },
  { id: "velomobile", name: "Velomobile", group: "Cycling", Icon: Car, unit: "km" },
  { id: "weights", name: "Weight training", group: "Strength", Icon: Barbell, unit: "workouts" },
  { id: "strength", name: "Strength training", group: "Strength", Icon: HandFist, unit: "workouts" },
  { id: "workout", name: "Workout", group: "Strength", Icon: Pulse, unit: "workouts" },
  { id: "hiit", name: "HIIT", group: "Strength", Icon: Timer, unit: "workouts" },
  { id: "crossfit", name: "CrossFit", group: "Strength", Icon: ChartLine, unit: "workouts" },
  { id: "functional", name: "Functional training", group: "Strength", Icon: Target, unit: "workouts" },
  { id: "elliptical", name: "Elliptical", group: "Strength", Icon: Infinity, unit: "workouts" },
  { id: "stairs", name: "Stair climbing", group: "Strength", Icon: Steps, unit: "floors" },
  { id: "stepper", name: "Stair stepper", group: "Strength", Icon: Equalizer, unit: "workouts" },
  { id: "yoga", name: "Yoga", group: "Strength", Icon: FlowerLotus, unit: "sessions" },
  { id: "pilates", name: "Pilates", group: "Strength", Icon: YinYang, unit: "sessions" },
  { id: "mobility", name: "Mobility", group: "Strength", Icon: Spiral, unit: "sessions" },
  { id: "stretch", name: "Stretching", group: "Strength", Icon: ArrowsOutLineHorizontal, unit: "sessions" },
  { id: "physio", name: "Physiotherapy", group: "Strength", Icon: Bandaids, unit: "sessions" },
  { id: "tennis", name: "Tennis", group: "Racket", Icon: TennisBall, unit: "sessions" },
  { id: "padel", name: "Padel", group: "Racket", Icon: PadelIcon, unit: "sessions" },
  { id: "pickleball", name: "Pickleball", group: "Racket", Icon: PickleballIcon, unit: "sessions" },
  { id: "squash", name: "Squash", group: "Racket", Icon: SquashIcon, unit: "sessions" },
  { id: "racquetball", name: "Racquetball", group: "Racket", Icon: Racquet, unit: "sessions" },
  { id: "badminton", name: "Badminton", group: "Racket", Icon: ShuttlecockIcon, unit: "sessions" },
  { id: "tabletennis", name: "Table tennis", group: "Racket", Icon: PingPong, unit: "sessions" },
  { id: "swim", name: "Swim", group: "Water", Icon: SwimmingPool, unit: "km" },
  { id: "row", name: "Rowing", group: "Water", Icon: Boat, unit: "km" },
  { id: "vrow", name: "Virtual row", group: "Water", Icon: Television, unit: "km" },
  { id: "kayak", name: "Kayaking", group: "Water", Icon: Lifebuoy, unit: "km" },
  { id: "canoe", name: "Canoeing", group: "Water", Icon: Anchor, unit: "km" },
  { id: "paddle", name: "Stand-up paddling", group: "Water", Icon: Drop, unit: "km" },
  { id: "surf", name: "Surfing", group: "Water", Icon: Waves, unit: "sessions" },
  { id: "windsurf", name: "Windsurfing", group: "Water", Icon: Wind, unit: "sessions" },
  { id: "kitesurf", name: "Kitesurfing", group: "Water", Icon: Island, unit: "sessions" },
  { id: "sail", name: "Sailing", group: "Water", Icon: Sailboat, unit: "km" },
  { id: "ski", name: "Alpine ski", group: "Snow", Icon: Snowflake, unit: "km" },
  { id: "nordic", name: "Nordic ski", group: "Snow", Icon: Tree, unit: "km" },
  { id: "backcountry", name: "Backcountry ski", group: "Snow", Icon: Mountains, unit: "km" },
  { id: "snowboard", name: "Snowboard", group: "Snow", Icon: CloudSnow, unit: "sessions" },
  { id: "snowshoe", name: "Snowshoe", group: "Snow", Icon: Boot, unit: "km" },
  { id: "iceskate", name: "Ice skating", group: "Snow", Icon: Sneaker, unit: "sessions" },
  { id: "football", name: "Football (soccer)", group: "Team", Icon: SoccerBall, unit: "sessions" },
  { id: "basketball", name: "Basketball", group: "Team", Icon: Basketball, unit: "sessions" },
  { id: "volleyball", name: "Volleyball", group: "Team", Icon: Volleyball, unit: "sessions" },
  { id: "cricket", name: "Cricket", group: "Team", Icon: Baseball, unit: "sessions" },
  { id: "hockey", name: "Hockey", group: "Team", Icon: Hockey, unit: "sessions" },
  { id: "climb", name: "Rock climbing", group: "Other", Icon: Mountains, unit: "routes" },
  { id: "skate", name: "Inline skating", group: "Other", Icon: Sneaker, unit: "km" },
  { id: "rollerski", name: "Roller ski", group: "Other", Icon: Path, unit: "km" },
  { id: "skateboard", name: "Skateboarding", group: "Other", Icon: Disc, unit: "sessions" },
  { id: "golf", name: "Golf", group: "Other", Icon: Golf, unit: "sessions" },
  { id: "dance", name: "Dance", group: "Other", Icon: MusicNotes, unit: "sessions" },
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
