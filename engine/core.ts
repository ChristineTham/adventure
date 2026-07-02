import { useGameStore } from '../store/gameStore';
import gameDataRaw from '../data/game-data.json';
import { GameData, GameLocation, ObjectData, TravelRule, TravelCondition } from '../types/game';

const gameData: GameData = gameDataRaw as unknown as GameData;

// Size constants dynamically initialized
let NLOCATIONS = 0;
let NOBJECTS = 0;
let NHINTS = 0;
let NDWARVES = 6;

// Location and Object Names lists
export let locNames: string[] = [];
export let objNames: string[] = [];
export let motionNames: string[] = [];
export let actionNames: string[] = [];
export let msgNames: string[] = [];

// Enums and Special values
const LCG_A = 1093;
const LCG_C = 221587;
const LCG_M = 1048576;
const CARRIED = -1;
const STATE_NOTFOUND = -1;
const STATE_FOUND = 0;

const INTRANSITIVE = -1;
const PIRATE = 6;
const WORD_EMPTY = 0;
const WORD_NOT_FOUND = -1;
const WARNTIME = 30;
const FLASHTIME = 50;
const NOVICELIMIT = 1000;
const GAMELIMIT = 330;
const IS_FREE = 0;
const INVLIMIT = 7;
const PANICTIME = 15;
const BATTERYLIFE = 2500;
const PIT_KILL_PROB = 35;

function isTreasure(object: number): boolean {
  return !!gameData.objects[objNames[object]]?.treasure;
}
function hasInventory(object: number): boolean {
  const inv = gameData.objects[objNames[object]]?.inventory;
  return inv !== null && inv !== undefined;
}

// C phase returns
const GO_TERMINATE = 0;
const GO_MOVE = 1;
const GO_TOP = 2;
const GO_CLEAROBJ = 3;
const GO_CHECKHINT = 4;
const GO_WORD2 = 5;
const GO_UNKNOWN = 6;
const GO_DWARFWAKE = 7;

// Action Speak Types
enum SpeakType { touch, look, hear, study, change }
// Termination Mode
enum Termination { endgame, quitgame, scoregame }

// Global C Enums mapped dynamically at startup
export const C = {
  // Objects
  AXE: 0, BIRD: 0, KEYS: 0, LAMP: 0, BEAR: 0, TROLL: 0, TROLL2: 0,
  SIGN: 0, BOTTLE: 0, WATER: 0, OIL: 0, PLANT: 0, PLANT2: 0,
  DOOR: 0, CAGE: 0, ROD: 0, ROD2: 0, MAGAZINE: 0, NUGGET: 0,
  EMERALD: 0, PYRAMID: 0, URN: 0, AMBER: 0, SAPPH: 0, RUBY: 0,
  JADE: 0, CHEST: 0, MESSAG: 0, STEPS: 0, BATTERY: 0, SNAKE: 0,
  MIRROR: 0, PILLOW: 0, OGRE: 0, CHAIN: 0, FISSURE: 0, EGGS: 0,
  DWARF: 0, VEND: 0, PEARL: 0, CLAM: 0, OYSTER: 0, COINS: 0,
  VOLCANO: 0, DRAGON: 0, BLOOD: 0, RESER: 0,
  CAVITY: 0, CHASM: 0, FOOD: 0, VASE: 0, KNIFE: 0, RUG: 0, GRATE: 0, TRIDENT: 0,
  
  // Locations
  LOC_NOWHERE: 0, LOC_START: 0, LOC_VALLEY: 0, LOC_SLIT: 0,
  LOC_COBBLE: 0, LOC_DEBRIS: 0, LOC_AWKWARD: 0, LOC_BIRDCHAMBER: 0,
  LOC_PITTOP: 0, LOC_BUILDING: 0, LOC_MAZEEND12: 0, LOC_DEADEND13: 0,
  LOC_HILL: 0, LOC_Y2: 0, LOC_PLOVER: 0, LOC_ALCOVE: 0, LOC_WITTSEND: 0,
  LOC_NE: 0, LOC_SW: 0, LOC_CULDESAC: 0, LOC_LEDGE: 0, LOC_CLIFF: 0,
  LOC_SECRET5: 0, LOC_LONGWEST: 0, LOC_GRATE: 0, LOC_RESBOTTOM: 0,
  
  // Motions
  NUL: 0, BACK: 0, LOOK: 0, CAVE: 0, XYZZY: 0, PLUGH: 0, PLOVER: 0, CRAWL: 0,
  EAST: 0, WEST: 0, SOUTH: 0, NORTH: 0, NE: 0, NW: 0, SW: 0, SE: 0, UP: 0, DOWN: 0,
  FORWARD: 0, LEFT: 0, RIGHT: 0, OUTSIDE: 0, INSIDE: 0,
  DEPRESSION: 0, ENTRANCE: 0, STREAM: 0, ENTER: 0,
  
  // Actions
  CARRY: 0, DROP: 0, SAY: 0, UNLOCK: 0, NOTHING: 0, LOCK: 0, LIGHT: 0, EXTINGUISH: 0,
  WAVE: 0, TAME: 0, GO: 0, ATTACK: 0, POUR: 0, EAT: 0, DRINK: 0, RUB: 0, THROW: 0,
  QUIT: 0, FIND: 0, INVENTORY: 0, FEED: 0, FILL: 0, BLAST: 0, SCORE: 0,
  FEE: 0, FIE: 0, FOE: 0, FOO: 0, FUM: 0, BRIEF: 0, READ: 0, BREAK: 0,
  WAKE: 0, SAVE: 0, RESUME: 0, FLY: 0, LISTEN: 0, PART: 0, SEED: 0, WASTE: 0,
  
  // Messages
  NO_MESSAGE: 0, OK_MAN: 0, DONT_KNOW: 0, DO_WHAT: 0, WHAT_DO: 0,
  TWO_WORDS: 0, PLEASE_ANSWER: 0, PITCH_DARK: 0, WANT_HINT: 0, HINT_COST: 0,
  WELCOME_YOU: 0, CAVE_NEARBY: 0, W_IS_WEST: 0, GO_UNNEEDED: 0, DWARVES_AWAKEN: 0,
  NUMERIC_REQUIRED: 0, DWARF_RAN: 0, DWARF_BLOCK: 0, DWARF_SINGLE: 0, DWARF_PACK: 0,
  KNIFE_THROWN: 0, THROWN_KNIVES: 0, MULTIPLE_HITS: 0, ONE_HIT: 0, NONE_HIT: 0,
  GETS_YOU: 0, MISSES_YOU: 0, DEATH_CLOSING: 0, TAME_BEAR: 0,
  SAYS_PLUGH: 0, FOLLOW_STREAM: 0, NEED_DETAIL: 0, NO_MORE_DETAIL: 0,
  BAD_DIRECTION: 0, UNSURE_FACING: 0, NO_INOUT_HERE: 0, NOTHING_HAPPENS: 0,
  WHICH_WAY: 0, CANT_APPLY: 0, NOT_CONNECTED: 0, TWIST_TURN: 0, FORGOT_PATH: 0,
  MUST_DROP: 0, CAVE_CLOSING: 0, CAVE_CLOSED: 0, REPLACE_BATTERIES: 0,
  MISSING_BATTERIES: 0, LAMP_DIM: 0, GET_BATTERIES: 0, LAMP_OUT: 0,
  PIRATE_SPOTTED: 0, PIRATE_POUNCES: 0, PIRATE_RUSTLES: 0,
  FEET_WET: 0, WHERE_QUERY: 0, DONT_UNDERSTAND: 0,
  NO_SEE: 0, DONT_HAVE: 0, CARRYING_THAT: 0, FREE_BIRD: 0, CAGE_BIRD: 0,
  BIRD_MUTTER: 0, BIRD_DEAD: 0, BEAR_ROARS: 0, TROLL_BLOCKS: 0,
  TROLL_GONE: 0, ROAD_BLOCKED: 0, DRAGON_SCALES: 0, DRAGON_BLOOD: 0,
  URN_SPILT: 0, CLAM_OYSTER: 0, DISCARD_WATER: 0, DISCARD_OIL: 0,
  SNAKE_WARNING: 0, VASE_SPILT: 0, VASE_BROKEN: 0, BRIDGE_STRETCHES: 0,
  CANT_WAVE: 0, WONT_FIT: 0, NO_BOTTLE: 0, NOTHING_DRINK: 0,
  RESERVOIR_EMPTY: 0, RESERVOIR_FULL: 0, SEED_SET: 0, WASTE_TURNS: 0,
  TOTAL_SCORE: 0, OFF_SCALE: 0, NEXT_HIGHER: 0, NO_HIGHER: 0,
  GARNERED_POINTS: 0, WITHOUT_SUSPENDS: 0, TOOK_LONG: 0,
  ALL_OWNED: 0, RESUME_HELP: 0, PIT_FALL: 0, KNIVES_VANISH: 0, EXIT_CLOSED: 0,
  REMOVE_MESSAGE: 0, DEEP_ROOTS: 0, YOU_JOKING: 0, BEAR_CHAINED: 0,
  STILL_LOCKED: 0, RUG_HOVERS: 0, URN_NOBUDGE: 0, DOUGHNUT_HOLES: 0,
  FEW_DROPS: 0, HAND_PASSTHROUGH: 0, NO_CONTAINER: 0, CARRY_LIMIT: 0,
  CANNOT_CARRY: 0, BIRD_EVADES: 0, ALREADY_UNLOCKED: 0, GEM_FITS: 0,
  PEARL_FALLS: 0, CLAM_OPENER: 0, DROP_CLAM: 0, HUH_MAN: 0, OYSTER_OPENER: 0,
  DROP_OYSTER: 0, CANT_POUR: 0, GROUND_WET: 0, SHAKING_LEAVES: 0,
  REALLY_QUIT: 0, CLUE_QUERY: 0, WAYOUT_CLUE: 0, PECULIAR_NOTHING: 0,
  OKEY_DOKEY: 0, TROLL_SATISFIED: 0, TROLL_RETURNS: 0, OGRE_DODGE: 0,
  DWARF_DODGES: 0, DWARF_SMOKE: 0, KILLED_DWARF: 0, PROD_DWARF: 0,
  CAGE_FLY: 0, FREE_FLY: 0, NECKLACE_FLY: 0, UNHAPPY_BIRD: 0, BEAR_HANDS: 0,
  BEAR_CONFUSED: 0, ALREADY_DEAD: 0, BARE_HANDS_QUERY: 0, NASTY_DRAGON: 0,
  OGRE_PANIC1: 0, OGRE_PANIC2: 0, NO_TARGET: 0, SHELL_IMPERVIOUS: 0,
  ROCKY_TROLL: 0, START_OVER: 0, WELL_POINTLESS: 0, REQUIRES_DYNAMITE: 0,
  SPLATTER_MESSAGE: 0, DEFEAT_MESSAGE: 0, VICTORY_MESSAGE: 0, TOO_FAR: 0,
  BRIEF_CONFIRM: 0, BIRD_BURNT: 0, BIRD_ATTACKS: 0, URN_NOPOUR: 0,
  NO_LIQUID: 0, ALREADY_CARRYING: 0, NEEDED_NEARBY: 0, YOU_HAVEIT: 0,
  FLAP_ARMS: 0, RUG_NOTHING1: 0, RUG_NOTHING2: 0, RUG_GOES: 0, RUG_RETURNS: 0,
  NOW_HOLDING: 0, NO_CARRY: 0, ALL_SILENT: 0, AM_GAME: 0, THANKS_DELICIOUS: 0,
  LOST_APPETITE: 0, BEYOND_POWER: 0, BIRD_PINING: 0, NOTHING_EDIBLE: 0,
  BIRD_DEVOURED: 0, TROLL_VICES: 0, REALLY_MAD: 0, OGRE_FULL: 0,
  FULL_URN: 0, WATER_URN: 0, OIL_URN: 0, NOT_BRIGHT: 0, URN_GENIES: 0,
  BOTTLE_FULL: 0, BIRD_CRAP: 0, RUG_SETTLES: 0, RUG_WIGGLES: 0, RUG_RISES: 0,
  FILL_INVALID: 0, SHATTER_VASE: 0, NOTHING_LOCKED: 0, NO_KEYS: 0, OYSTER_OPENS: 0,
  RUSTY_DOOR: 0, NO_LOCK: 0, CANNOT_UNLOCK: 0,
  CHAIN_UNLOCKED: 0, CHAIN_LOCKED: 0, BEAR_BLOCKS: 0, ALREADY_LOCKED: 0, NO_LOCKSITE: 0,
  RIDICULOUS_ATTEMPT: 0, ARENT_CARRYING: 0,
  SAVERESUME_DISABLED: 0, RESUME_ABANDON: 0, THIS_ACCEPTABLE: 0, SUSPEND_WARNING: 0,
  BAD_SAVE: 0, VERSION_SKEW: 0, SAVE_TAMPERING: 0,
};

// Initialize enums dynamically at startup
function initIndexMappings() {
  locNames = Object.keys(gameData.locations);
  objNames = Object.keys(gameData.objects);
  motionNames = Object.keys(gameData.motions);
  actionNames = Object.keys(gameData.actions);
  msgNames = Object.keys(gameData.arbitrary_messages);

  NLOCATIONS = locNames.length - 1;
  NOBJECTS = objNames.length - 1;
  NHINTS = gameData.hints.length;

  for (const key of Object.keys(C)) {
    const k = key as keyof typeof C;
    let idx = -1;
    if (k.startsWith('LOC_')) {
      idx = locNames.indexOf(k);
    } else if (actionNames.includes(k)) {
      idx = actionNames.indexOf(k);
    } else if (motionNames.includes(k) || k === 'NUL') {
      idx = motionNames.indexOf(k === 'NUL' ? 'NUL' : k);
    } else if (objNames.includes(k)) {
      idx = objNames.indexOf(k);
    } else {
      idx = msgNames.indexOf(k);
    }
    if (idx !== -1) {
      C[k] = idx;
    }
  }
}

// ── LCG PRNG ─────────────────────────────────────────────────────────────────

export function set_seed(seedval: number): void {
  let lcg_x = seedval % LCG_M;
  if (lcg_x < 0) {
    lcg_x = LCG_M + lcg_x;
  }
  useGameStore.setState({ lcg_x });

  // Generate ZZWord magic word
  let zz = '';
  for (let i = 0; i < 5; i++) {
    const r = randrange(26);
    zz += String.fromCharCode(65 + r);
  }
  zz = zz.substring(0, 1) + "'" + zz.substring(2);
  useGameStore.setState({ zzword: zz });
}

function get_next_lcg_value(): number {
  const store = useGameStore.getState();
  const old_x = store.lcg_x;
  const new_x = (LCG_A * old_x + LCG_C) % LCG_M;
  useGameStore.setState({ lcg_x: new_x });
  return old_x;
}

export function randrange(range: number): number {
  return Math.floor((range * get_next_lcg_value()) / LCG_M);
}

// ── Linked List helpers ──────────────────────────────────────────────────────

function carry(object: number, where: number): void {
  const store = useGameStore.getState();
  const objects = useGameStore.getState().objects.map(o => ({ ...o }));
  const locs = store.locs.map(l => ({ ...l }));
  const link = [...store.link];
  let holdng = store.holdng;

  if (object <= NOBJECTS) {
    if (objects[object].place === CARRIED) {
      return;
    }
    objects[object].place = CARRIED;
    if (object !== C.BIRD) {
      holdng++;
    }
  }

  if (locs[where].atloc === object) {
    locs[where].atloc = link[object];
  } else {
    let temp = locs[where].atloc;
    while (temp !== 0 && link[temp] !== object) {
      temp = link[temp];
    }
    if (temp !== 0) {
      link[temp] = link[object];
    }
  }

  useGameStore.setState({
    objects,
    locs,
    link,
    holdng,
  });
}

function drop(object: number, where: number): void {
  const store = useGameStore.getState();
  const objects = useGameStore.getState().objects.map(o => ({ ...o }));
  const locs = store.locs.map(l => ({ ...l }));
  const link = [...store.link];
  let holdng = store.holdng;

  if (object > NOBJECTS) {
    objects[object - NOBJECTS].fixed = where;
  } else {
    if (objects[object].place === CARRIED) {
      if (object !== C.BIRD) {
        holdng--;
      }
    }
    objects[object].place = where;
  }

  if (where === LOC_NOWHERE || where === CARRIED) {
    useGameStore.setState({
      objects,
      holdng,
    });
    return;
  }

  link[object] = locs[where].atloc;
  locs[where].atloc = object;

  useGameStore.setState({
    objects,
    locs,
    link,
    holdng,
  });
}

function move(object: number, where: number): void {
  const store = useGameStore.getState();
  let from = 0;
  if (object > NOBJECTS) {
    from = store.objects[object - NOBJECTS].fixed;
  } else {
    from = store.objects[object].place;
  }

  if (from !== LOC_NOWHERE && from !== CARRIED) {
    carry(object, from);
  }
  drop(object, where);
}

function juggle(object: number): void {
  const store = useGameStore.getState();
  const i = store.objects[object].place;
  const j = store.objects[object].fixed;
  move(object, i);
  move(object + NOBJECTS, j);
}

function put(object: number, where: number, pval: number): void {
  move(object, where);
  const store = useGameStore.getState();
  const objects = useGameStore.getState().objects.map(o => ({ ...o }));
  objects[object].prop = -1 - pval; // PROP_STASHIFY
  useGameStore.setState({ objects });
}

function destroy(object: number): void {
  move(object, LOC_NOWHERE);
}

// ── C Macros equivalents ─────────────────────────────────────────────────────

const LOC_NOWHERE = 0;
const DALTLC = 18; // LOC_NUGGET

const toting = (obj: number) => {
  const store = useGameStore.getState();
  return store.objects[obj]?.place === CARRIED;
};

const at = (obj: number) => {
  const store = useGameStore.getState();
  return store.objects[obj]?.place === store.loc || store.objects[obj]?.fixed === store.loc;
};

const here = (obj: number) => toting(obj) || at(obj);

// Mirrors the C OBJECT_STATE_EQUALS: a state matches whether the object is
// in its normal or stashified (endgame) encoding.
const objectStateEquals = (obj: number, pval: number): boolean => {
  const prop = useGameStore.getState().objects[obj]?.prop;
  return prop === pval || prop === -1 - pval;
};

const WATER_BOTTLE = 0;
const EMPTY_BOTTLE = 1;
const OIL_BOTTLE = 2;

const liquid = () => {
  const store = useGameStore.getState();
  const prop = store.objects[C.BOTTLE].prop;
  return prop === WATER_BOTTLE ? C.WATER : prop === OIL_BOTTLE ? C.OIL : 0;
};

const liqloc = (loc: number) => {
  return tstbit(loc, 2) ? (tstbit(loc, 1) ? C.OIL : C.WATER) : 0;
};

const isDarkHere = () => {
  const store = useGameStore.getState();
  return !tstbit(store.loc, 0) && (store.objects[C.LAMP].prop === 0 || !here(C.LAMP));
};

function tstbit(loc: number, bit: number): boolean {
  const locId = locNames[loc];
  const locData = gameData.locations[locId];
  if (!locData) return false;

  if (bit === 0) return !!locData.conditions['LIT'];
  if (bit === 1) return !!locData.conditions['OILY'];
  if (bit === 2) return !!locData.conditions['FLUID'];
  if (bit === 3) return !!locData.conditions['NOARRR'];
  if (bit === 4) return !!locData.conditions['NOBACK'];
  if (bit === 5) return !!locData.conditions['ABOVE'];
  if (bit === 6) return !!locData.conditions['DEEP'];
  if (bit === 7) return !!locData.conditions['FOREST'];
  if (bit === 8) return isForced(loc);
  if (bit === 9) return !!locData.conditions['ALLDIFFERENT'];
  if (bit === 10) return !!locData.conditions['ALLALIKE'];

  if (bit >= 11) {
    const hintIdx = bit - 11 - 1;
    if (hintIdx >= 0 && hintIdx < gameData.hints.length) {
      const hintName = gameData.hints[hintIdx].name;
      return !!locData.hints?.some((h: any) => (typeof h === 'string' ? h === hintName : h?.name === hintName));
    }
  }

  return false;
}

function isForced(loc: number): boolean {
  const locId = locNames[loc];
  const locData = gameData.locations[locId];
  if (!locData || !locData.travel || locData.travel.length === 0) return false;
  return locData.travel[0].verbs.length === 0;
}

function getPlacAndFixd(k: number) {
  const objId = objNames[k];
  const objData = gameData.objects[objId];
  if (!objData) return { plac: 0, fixd: 0 };
  const locs = objData.locations || [];
  let plac = 0;
  let fixd = 0;
  if (locs.length >= 2) {
    plac = locNames.indexOf(locs[0]);
    fixd = locNames.indexOf(locs[1]);
  } else if (locs.length === 1) {
    plac = locNames.indexOf(locs[0]);
    fixd = objData.immovable ? -1 : 0;
  } else {
    plac = 0;
    fixd = objData.immovable ? -1 : 0;
  }
  return { plac, fixd };
}

// ── Dynamic text formatting output ───────────────────────────────────────────

function speak(msg: string | string[] | null | undefined, ...args: any[]): void {
  if (!msg) return;
  const messageStr = Array.isArray(msg) ? msg[0] : msg;
  if (!messageStr || messageStr.length === 0) return;

  const store = useGameStore.getState();
  let rendered = messageStr.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  // Reference quirk: outside the cave/building, "floor" (only when followed
  // by a space or period, i.e. not "floor!") is rendered as "ground".
  // INSIDE(loc) = !(ABOVE || FOREST) || loc == LOC_BUILDING.
  const outside = tstbit(store.loc, 5) || tstbit(store.loc, 7); // ABOVE or FOREST
  if (outside && store.loc !== C.LOC_BUILDING) {
    rendered = rendered.replace(/floor(?=[ .])/g, 'ground');
  }

  let argIndex = 0;
  let lastNumericVal = 0;

  rendered = rendered.replace(/%[dsS]/g, (match) => {
    if (match === '%d') {
      const val = args[argIndex++];
      if (typeof val === 'number') {
        lastNumericVal = val;
        return String(val);
      }
      return '';
    }
    if (match === '%s') {
      const val = args[argIndex++];
      return String(val);
    }
    if (match === '%S') {
      return lastNumericVal !== 1 ? 's' : '';
    }
    return match;
  });

  store.addMessage(rendered);
}

function sspeak(msg: number, ...args: any[]): void {
  const msgId = msgNames[msg];
  speak(gameData.arbitrary_messages[msgId], ...args);
}

function rspeak(msg: number, ...args: any[]): void {
  sspeak(msg, ...args);
}

function pspeak(msg: number, mode: SpeakType, blank: boolean, skip: number, ...args: any[]): void {
  const objId = objNames[msg];
  const objData = gameData.objects[objId];
  if (!objData) return;

  if (mode === SpeakType.touch) {
    if (objData.inventory) {
      speak(objData.inventory, ...args);
    }
  } else if (mode === SpeakType.look) {
    if (objData.descriptions && objData.descriptions[skip] !== undefined && objData.descriptions[skip] !== null) {
      speak(objData.descriptions[skip], ...args);
    }
  } else if (mode === SpeakType.hear) {
    if (objData.sounds && objData.sounds[skip] !== undefined && objData.sounds[skip] !== null) {
      speak(objData.sounds[skip], ...args);
    }
  } else if (mode === SpeakType.study) {
    if (objData.texts && objData.texts[skip] !== undefined && objData.texts[skip] !== null) {
      speak(objData.texts[skip], ...args);
    }
  } else if (mode === SpeakType.change) {
    if (objData.changes && objData.changes[skip] !== undefined && objData.changes[skip] !== null) {
      speak(objData.changes[skip], ...args);
    }
  }
}

function atdwrf(loc: number): number {
  const store = useGameStore.getState();
  if (store.dflag < 2) return 0;
  let deadCount = 0;
  for (let i = 1; i <= NDWARVES - 1; i++) {
    if (store.dwarves[i].loc === loc) {
      return i;
    }
    if (store.dwarves[i].loc === 0) {
      deadCount++;
    }
  }
  return deadCount === NDWARVES - 1 ? -1 : 0;
}

function stateChange(obj: number, state: number): void {
  const store = useGameStore.getState();
  const objects = useGameStore.getState().objects.map(o => ({ ...o }));
  objects[obj].prop = state;
  useGameStore.setState({ objects });
  pspeak(obj, SpeakType.change, true, state);
}

// ── Turn Lifecycle Checks ────────────────────────────────────────────────────

// Full condition bitmask for a location, matching the C `conditions[loc]`
// table (COND_* low bits 0-10 plus hint bits COND_H* at 12+).
function conditionsFor(loc: number): number {
  let v = 0;
  for (let b = 0; b <= 10; b++) {
    if (tstbit(loc, b)) v |= (1 << b);
  }
  for (let h = 0; h < gameData.hints.length; h++) {
    if (tstbit(loc, h + 1 + 11)) v |= (1 << (h + 1 + 11));
  }
  return v;
}

function checkHints(): void {
  const store = useGameStore.getState();
  // Gate: only consider hints when this location is hint-eligible.
  if (conditionsFor(store.loc) < store.conds) return;

  const hints = store.hints.map(h => ({ ...h }));
  const NHINTS = gameData.hints.length;

  const offerHint = (hint: number) => {
    hints[hint].lc = 0;
    useGameStore.setState({
      hints,
      pendingQuery: { type: 'hint', hintIndex: hint },
    });
    speak(gameData.hints[hint].question);
  };

  const atloc0 = (l: number) => store.locs[l].atloc === 0;

  for (let hint = 0; hint < NHINTS; hint++) {
    if (hints[hint].used) continue;

    if (!tstbit(store.loc, hint + 1 + 11)) {
      hints[hint].lc = -1;
    }
    hints[hint].lc++;

    if (hints[hint].lc >= gameData.hints[hint].turns) {
      // Threshold reached. Each case either offers the hint (eligible) or
      // returns immediately (matching the reference, which stops checking
      // any further hints this turn).
      switch (hint) {
        case 0: // cave
          if (store.objects[C.GRATE].prop === 0 && !here(C.KEYS)) { offerHint(hint); return; }
          hints[hint].lc = 0; useGameStore.setState({ hints }); return;
        case 1: // bird
          if (store.objects[C.BIRD].place === store.loc && toting(C.ROD) && store.oldobj === C.BIRD) { offerHint(hint); return; }
          useGameStore.setState({ hints }); return;
        case 2: // snake
          if (here(C.SNAKE) && !here(C.BIRD)) { offerHint(hint); return; }
          hints[hint].lc = 0; useGameStore.setState({ hints }); return;
        case 3: // maze
          if (atloc0(store.loc) && atloc0(store.oldloc) && atloc0(store.oldlc2) && store.holdng > 1) { offerHint(hint); return; }
          hints[hint].lc = 0; useGameStore.setState({ hints }); return;
        case 4: // dark
          if (store.objects[C.EMERALD].prop !== STATE_NOTFOUND && store.objects[C.PYRAMID].prop === STATE_NOTFOUND) { offerHint(hint); return; }
          hints[hint].lc = 0; useGameStore.setState({ hints }); return;
        case 5: // witt
          offerHint(hint); return;
        case 6: // cliff / urn
          if (store.dflag === 0) { offerHint(hint); return; }
          hints[hint].lc = 0; useGameStore.setState({ hints }); return;
        case 7: // woods
          if (atloc0(store.loc) && atloc0(store.oldloc) && atloc0(store.oldlc2)) { offerHint(hint); return; }
          useGameStore.setState({ hints }); return;
        case 8: { // ogre
          const i = atdwrf(store.loc);
          if (i < 0) { hints[hint].lc = 0; useGameStore.setState({ hints }); return; }
          if (here(C.OGRE) && i === 0) { offerHint(hint); return; }
          useGameStore.setState({ hints }); return;
        }
        case 9: // jade
          if (store.tally === 1 && (store.objects[C.JADE].prop < STATE_NOTFOUND || store.objects[C.JADE].prop === STATE_NOTFOUND)) { offerHint(hint); return; }
          hints[hint].lc = 0; useGameStore.setState({ hints }); return;
      }
    }
  }

  useGameStore.setState({ hints });
}

function spottedByPirate(i: number, dwarves: { seen: boolean; loc: number; oldloc: number }[]): boolean {
  if (i !== PIRATE) return false;
  const store = useGameStore.getState();

  if (store.loc === store.chloc || store.objects[C.CHEST].prop !== STATE_NOTFOUND) {
    return true;
  }

  let snarfed = 0;
  let movechest = false;
  let robplayer = false;

  for (let treasure = 1; treasure <= NOBJECTS; treasure++) {
    if (!gameData.objects[objNames[treasure]]?.treasure) continue;

    // Pirate won't take pyramid from plover room or dark room
    if (treasure === C.PYRAMID && (store.loc === C.LOC_PLOVER || store.loc === C.LOC_ALCOVE)) {
      continue;
    }
    if (toting(treasure) || here(treasure)) {
      snarfed++;
    }
    if (toting(treasure)) {
      movechest = true;
      robplayer = true;
    }
  }

  // Force chest placement before player finds last treasure
  if (store.tally === 1 && snarfed === 0 && store.objects[C.CHEST].place === LOC_NOWHERE && here(C.LAMP) && store.objects[C.LAMP].prop === 1) { // LAMP_BRIGHT
    rspeak(C.PIRATE_SPOTTED);
    movechest = true;
  }

  if (movechest) {
    move(C.CHEST, store.chloc);
    move(C.MESSAG, store.chloc2);
    
    dwarves[PIRATE].loc = store.chloc;
    dwarves[PIRATE].oldloc = store.chloc;
    dwarves[PIRATE].seen = false;
  } else {
    if (store.turns === 100 || store.turns === 101) {
      console.log(`[PIRATE SPOTTED CHECK] oldloc=${locNames[dwarves[PIRATE].oldloc]} loc=${locNames[dwarves[PIRATE].loc]} isDiff=${dwarves[PIRATE].oldloc !== dwarves[PIRATE].loc}`);
    }
    if (dwarves[PIRATE].oldloc !== dwarves[PIRATE].loc && randrange(100) < 20) {
      rspeak(C.PIRATE_RUSTLES);
    }
  }

  if (robplayer) {
    rspeak(C.PIRATE_POUNCES);
    for (let treasure = 1; treasure <= NOBJECTS; treasure++) {
      if (!gameData.objects[objNames[treasure]]?.treasure) continue;
      if (treasure === C.PYRAMID && (store.loc === C.LOC_PLOVER || store.loc === C.LOC_ALCOVE)) {
        continue;
      }
      if (at(treasure) && store.objects[treasure].fixed === 0) { // IS_FREE = 0
        carry(treasure, store.loc);
      }
      if (toting(treasure)) {
        drop(treasure, store.chloc);
      }
    }
  }

  return true;
}

function dwarfMove(): boolean {
  const store = useGameStore.getState();
  const dwarves = store.dwarves.map(d => ({ ...d }));
  let dtotal = 0;
  let attack = 0;
  let stick = 0;

  if (store.loc === LOC_NOWHERE || isForced(store.loc) || tstbit(store.newloc, 3)) { // COND_NOARRR = 3
    return true;
  }

  if (store.dflag === 0) {
    if (tstbit(store.loc, 6)) { // COND_DEEP = 6
      useGameStore.setState({ dflag: 1 });
    }
    return true;
  }

  if (store.dflag === 1) {
    if (!tstbit(store.loc, 6) || (randrange(100) < 95 && (!tstbit(store.loc, 4) || randrange(100) < 85))) { // COND_NOBACK = 4
      return true;
    }
    useGameStore.setState({ dflag: 2 });
    
    // Kill 0, 1, or 2 dwarves at meeting
    for (let i = 1; i <= 2; i++) {
      let j = 1 + randrange(NDWARVES - 1);
      if (randrange(100) < 50) {
        dwarves[j].loc = 0;
      }
    }

    for (let i = 1; i <= NDWARVES - 1; i++) {
      if (dwarves[i].loc === store.loc) {
        dwarves[i].loc = DALTLC;
      }
      dwarves[i].oldloc = dwarves[i].loc;
    }

    useGameStore.setState({ dwarves });
    rspeak(C.DWARF_RAN);
    drop(C.AXE, store.loc);
    return true;
  }

  for (let i = 1; i <= NDWARVES; i++) {
    if (dwarves[i].loc === 0) continue;

    // Fill choices coordinates
    const tk: number[] = [0];
    const locId = locNames[dwarves[i].loc];
    const locData = gameData.locations[locId];
    if (locData && locData.travel) {
      for (const rule of locData.travel) {
        const [actionType, target] = rule.action;
        if (actionType === 'goto') {
          const destIdx = locNames.indexOf(target as string);
          if (!tstbit(destIdx, 6)) continue; // Must be deep
          if (destIdx === dwarves[i].oldloc) continue;
          if (destIdx === dwarves[i].loc) continue;
          if (isForced(destIdx)) continue;
          if (i === PIRATE && tstbit(destIdx, 3)) continue; // COND_NOARRR = 3
          
          let skip = false;
          if (rule.condition && rule.condition[0] === 'nodwarves') {
            skip = true;
          }
          if (skip) continue;
          if (tk.length > 1 && destIdx === tk[tk.length - 1]) continue;

          tk.push(destIdx);
        }
      }
    }

    tk.push(dwarves[i].oldloc);
    let choices = tk.length - 1;
    if (choices >= 2) {
      choices--;
    }
    const idx = 1 + randrange(choices);
    dwarves[i].oldloc = dwarves[i].loc;
    dwarves[i].loc = tk[idx];

    dwarves[i].seen = (dwarves[i].seen && tstbit(store.loc, 6)) || (dwarves[i].loc === store.loc || dwarves[i].oldloc === store.loc);
    
    if (!dwarves[i].seen) continue;

    dwarves[i].loc = store.loc;
    if (spottedByPirate(i, dwarves)) continue;

    dtotal++;
    if (dwarves[i].oldloc === dwarves[i].loc) {
      attack++;
      let knfloc = store.knfloc;
      if (knfloc >= LOC_NOWHERE) {
        knfloc = store.loc;
      }
      useGameStore.setState({ knfloc });
      if (randrange(1000) < 95 * (store.dflag - 2)) {
        stick++;
      }
    }
  }

  useGameStore.setState({ dwarves, dtotal });

  if (dtotal === 0) return true;

  rspeak(dtotal === 1 ? C.DWARF_SINGLE : C.DWARF_PACK, dtotal);
  if (attack === 0) return true;

  if (store.dflag === 2) {
    useGameStore.setState({ dflag: 3 });
  }

  if (attack > 1) {
    rspeak(C.THROWN_KNIVES, attack);
    rspeak(stick > 1 ? C.MULTIPLE_HITS : (stick === 1 ? C.ONE_HIT : C.NONE_HIT), stick);
  } else {
    rspeak(C.KNIFE_THROWN);
    rspeak(stick ? C.GETS_YOU : C.MISSES_YOU);
  }

  if (stick === 0) return true;
  useGameStore.setState({ oldlc2: store.loc });
  return false; // Dead
}

function croak(fromMove: boolean = false): void {
  const store = useGameStore.getState();
  const obituaries = gameData.obituaries;
  const numdie = store.numdie;
  const query = obituaries[numdie]?.query;

  // The reference increments numdie BEFORE the closing-time check, so a death
  // during closing still counts (affecting the final score). Record whether
  // this death happened inside do_move(): if not (e.g. the troll bridge), the
  // reference runs a fresh do_move() after reincarnation.
  useGameStore.setState({ numdie: numdie + 1, reincarnateMove: !fromMove });

  if (store.closng) {
    rspeak(C.DEATH_CLOSING);
    terminate(Termination.endgame);
  }

  useGameStore.setState({
    pendingQuery: {
      type: 'croak',
    }
  });

  speak(query);
}

function describeLocation(): void {
  const store = useGameStore.getState();
  const locId = locNames[store.loc];
  const locData = gameData.locations[locId];
  if (!locData) return;

  const locs = store.locs.map(l => ({ ...l }));
  let msg = locData.description.short;

  if (store.locs[store.loc].abbrev % store.abbnum === 0 || !msg) {
    msg = locData.description.long;
  }

  if (!isForced(store.loc) && isDarkHere()) {
    msg = gameData.arbitrary_messages['PITCH_DARK'] as string;
  }

  if (toting(C.BEAR)) {
    rspeak(C.TAME_BEAR);
  }

  speak(msg);

  if (store.loc === C.LOC_Y2 && randrange(100) < 25 && !store.closng) {
    rspeak(C.SAYS_PLUGH);
  }
}

function listObjects(): void {
  const store = useGameStore.getState();
  if (isDarkHere()) return;

  const locs = store.locs.map(l => ({ ...l }));
  locs[store.loc].abbrev++;
  useGameStore.setState({ locs });

  let tally = store.tally;

  for (let i = locs[store.loc].atloc; i !== 0; i = store.link[i]) {
    let obj = i;
    if (obj > NOBJECTS) {
      obj = obj - NOBJECTS;
    }
    if (obj === C.STEPS && toting(C.NUGGET)) {
      continue;
    }

    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    if (objects[obj].prop === STATE_NOTFOUND) {
      if (store.closed) continue;

      objects[obj].prop = STATE_FOUND;
      if (obj === C.RUG) {
        objects[obj].prop = 1; // RUG_DRAGON
      }
      if (obj === C.CHAIN) {
        objects[obj].prop = 1; // CHAINING_BEAR
      }
      if (obj === C.EGGS) {
        useGameStore.setState({ seenbigwords: true });
      }
      tally = useGameStore.getState().tally - 1;
      useGameStore.setState({ objects, tally });
    }

    let kk = useGameStore.getState().objects[obj].prop;
    if (obj === C.STEPS) {
      kk = (store.loc === useGameStore.getState().objects[C.STEPS].fixed) ? 1 : 0; // STEPS_UP = 1, STEPS_DOWN = 0
    }
    pspeak(obj, SpeakType.look, true, kk);
  }
}

function closeCheck(): boolean {
  const store = useGameStore.getState();
  const thresholds = gameData.turn_thresholds;

  // Turn threshold point deductions
  for (const t of thresholds) {
    if (store.turns === t.threshold + 1) {
      useGameStore.setState({ trnluz: useGameStore.getState().trnluz + t.point_loss });
      speak(t.message);
    }
  }

  let clock1 = store.clock1;
  let clock2 = store.clock2;

  if (store.tally === 0 && tstbit(store.loc, 6) && store.loc !== C.LOC_Y2) {
    clock1--;
    useGameStore.setState({ clock1 });
  }

  if (clock1 === 0) {
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[C.GRATE].prop = 0; // GRATE_CLOSED
    objects[C.FISSURE].prop = 0; // UNBRIDGED
    useGameStore.setState({ objects });

    const dwarves = store.dwarves.map(d => ({ ...d }));
    for (let i = 1; i <= NDWARVES; i++) {
      dwarves[i].seen = false;
      dwarves[i].loc = LOC_NOWHERE;
    }
    useGameStore.setState({ dwarves });

    destroy(C.TROLL);
    move(C.TROLL + NOBJECTS, 0); // IS_FREE
    const tLocs = getPlacAndFixd(C.TROLL);
    move(C.TROLL2, tLocs.plac);
    move(C.TROLL2 + NOBJECTS, tLocs.fixd);
    juggle(C.CHASM);

    if (store.objects[C.BEAR].prop !== 3) { // BEAR_DEAD
      destroy(C.BEAR);
    }
    objects[C.CHAIN].prop = 0; // CHAIN_HEAP
    objects[C.CHAIN].fixed = 0; // IS_FREE
    objects[C.AXE].prop = 0; // AXE_HERE
    objects[C.AXE].fixed = 0; // IS_FREE
    useGameStore.setState({ objects });

    rspeak(C.CAVE_CLOSING);
    useGameStore.setState({ clock1: -1, closng: true });
    return store.closed;
  } else if (clock1 < 0) {
    clock2--;
    useGameStore.setState({ clock2 });
  }

  if (clock2 === 0) {
    put(C.BOTTLE, C.LOC_NE, EMPTY_BOTTLE);
    put(C.PLANT, C.LOC_NE, 0); // PLANT_THIRSTY = 0
    put(C.OYSTER, C.LOC_NE, 0); // STATE_FOUND = 0
    put(C.LAMP, C.LOC_NE, 0); // LAMP_DARK = 0
    put(C.ROD, C.LOC_NE, 0); // STATE_FOUND = 0
    put(C.DWARF, C.LOC_NE, 0); // STATE_FOUND = 0
    
    useGameStore.setState({
      loc: C.LOC_NE,
      oldloc: C.LOC_NE,
      newloc: C.LOC_NE,
    });

    move(C.GRATE, C.LOC_SW);
    move(C.SIGN, C.LOC_SW);
    {
      const o = useGameStore.getState().objects.map(oo => ({ ...oo }));
      o[C.SIGN].prop = 1; // ENDGAME_SIGN = 1
      useGameStore.setState({ objects: o });
    }

    put(C.SNAKE, C.LOC_SW, 1); // SNAKE_CHASED = 1
    put(C.BIRD, C.LOC_SW, 1); // BIRD_CAGED = 1
    put(C.CAGE, C.LOC_SW, 0); // STATE_FOUND = 0
    put(C.ROD2, C.LOC_SW, 0); // STATE_FOUND = 0
    put(C.PILLOW, C.LOC_SW, 0); // STATE_FOUND = 0
    put(C.MIRROR, C.LOC_NE, 0); // STATE_FOUND = 0

    {
      const o = useGameStore.getState().objects.map(oo => ({ ...oo }));
      o[C.MIRROR].fixed = C.LOC_SW;
      useGameStore.setState({ objects: o });
    }

    for (let i = 1; i <= NOBJECTS; i++) {
      if (toting(i)) {
        destroy(i);
      }
    }

    rspeak(C.CAVE_CLOSED);
    useGameStore.setState({ closed: true });
    return true;
  }

  lampCheck();
  return false;
}

function lampCheck(): void {
  const store = useGameStore.getState();
  let limit = store.limit;
  let lmwarn = store.lmwarn;

  if (store.objects[C.LAMP].prop === 1) { // LAMP_BRIGHT
    limit--;
    useGameStore.setState({ limit });
  }

  if (limit <= WARNTIME) {
    if (here(C.BATTERY) && store.objects[C.BATTERY].prop === 0 && here(C.LAMP)) { // FRESH_BATTERIES = 0
      rspeak(C.REPLACE_BATTERIES);
      const objects = useGameStore.getState().objects.map(o => ({ ...o }));
      objects[C.BATTERY].prop = 1; // DEAD_BATTERIES = 1
      useGameStore.setState({ objects, limit: limit + BATTERYLIFE, lmwarn: false });
    } else if (!lmwarn && here(C.LAMP)) {
      useGameStore.setState({ lmwarn: true });
      if (store.objects[C.BATTERY].prop === 1) { // DEAD_BATTERIES
        rspeak(C.MISSING_BATTERIES);
      } else if (store.objects[C.BATTERY].place === LOC_NOWHERE) {
        rspeak(C.LAMP_DIM);
      } else {
        rspeak(C.GET_BATTERIES);
      }
    }
  }

  if (limit === 0) {
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[C.LAMP].prop = 0; // LAMP_DARK
    useGameStore.setState({ objects, limit: -1 });
    if (here(C.LAMP)) {
      rspeak(C.LAMP_OUT);
    }
  }
}

function doMove(): boolean {
  const store = useGameStore.getState();
  let newloc = store.newloc;

  // Cannot leave cave once closed
  if (tstbit(newloc, 5) && newloc !== 0 && store.closng) { // COND_ABOVE = 5
    rspeak(C.EXIT_CLOSED);
    newloc = store.loc;
    useGameStore.setState({ newloc });
    if (!store.panic) {
      useGameStore.setState({ clock2: PANICTIME, panic: true });
    }
  }

  // Check if dwarf blocks the way
  if (newloc !== store.loc && !isForced(store.loc) && !tstbit(store.loc, 3)) { // COND_NOARRR = 3
    for (let i = 1; i <= NDWARVES - 1; i++) {
      if (store.dwarves[i].oldloc === newloc && store.dwarves[i].seen) {
        newloc = store.loc;
        useGameStore.setState({ newloc });
        rspeak(C.DWARF_BLOCK);
        break;
      }
    }
  }

  useGameStore.setState({ loc: newloc });

  if (!dwarfMove()) {
    croak(true);
    return false;
  }

  const updatedStore = useGameStore.getState();
  if (updatedStore.loc === LOC_NOWHERE) {
    croak(true);
    return false;
  }

  // Pitch dark falls in pit
  if (!isForced(updatedStore.loc) && isDarkHere() && updatedStore.wzdark && randrange(100) < PIT_KILL_PROB) {
    rspeak(C.PIT_FALL);
    useGameStore.setState({ oldlc2: updatedStore.loc });
    croak(true);
    return false;
  }

  return true;
}

function preprocessCommand(cmd: { word: { raw: string; id: number; type: WordType }[] }): boolean {
  const store = useGameStore.getState();
  
  if (cmd.word[0].type === WordType.MOTION && cmd.word[0].id === C.ENTER &&
      (cmd.word[1].id === C.STREAM || cmd.word[1].id === C.WATER)) {
    if (liqloc(store.loc) === C.WATER) {
      rspeak(C.FEET_WET);
    } else {
      rspeak(C.WHERE_QUERY);
    }
    return false;
  }

  if (cmd.word[0].type === WordType.OBJECT) {
    if (cmd.word[1].type === WordType.ACTION) {
      // Swap to Action + Object
      const tmp = cmd.word[0];
      cmd.word[0] = cmd.word[1];
      cmd.word[1] = tmp;
    }

    if (cmd.word[0].id === C.GRATE) {
      cmd.word[0].type = WordType.MOTION;
      if (store.loc === C.LOC_START || store.loc === C.LOC_VALLEY || store.loc === C.LOC_SLIT) {
        cmd.word[0].id = C.DEPRESSION;
      }
      if (store.loc === C.LOC_COBBLE || store.loc === C.LOC_DEBRIS || store.loc === C.LOC_AWKWARD ||
          store.loc === C.LOC_BIRDCHAMBER || store.loc === C.LOC_PITTOP) {
        cmd.word[0].id = C.ENTRANCE;
      }
    }

    if ((cmd.word[0].id === C.WATER || cmd.word[0].id === C.OIL) &&
        (cmd.word[1].id === C.PLANT || cmd.word[1].id === C.DOOR)) {
      if (at(cmd.word[1].id)) {
        // Copy (not alias) the liquid word into slot 1 before overwriting
        // slot 0 with POUR, matching the reference's by-value struct copy.
        cmd.word[1] = { ...cmd.word[0] };
        cmd.word[0] = { ...cmd.word[0], id: C.POUR, type: WordType.ACTION, raw: 'POUR' };
      }
    }

    if (cmd.word[0].id === C.CAGE && cmd.word[1].id === C.BIRD && here(C.CAGE) && here(C.BIRD)) {
      cmd.word[0].id = C.CARRY;
      cmd.word[0].type = WordType.ACTION;
    }
  }

  if (cmd.word[0].type === WordType.NO_WORD_TYPE) {
    cmd.word[0].type = WordType.MOTION;
  }

  return true;
}

// ── Verbs Actions ────────────────────────────────────────────────────────────

function vcarry(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (obj === INTRANSITIVE) {
    const atloc = store.locs[store.loc].atloc;
    if (atloc === 0 || store.link[atloc] !== 0 || atdwrf(store.loc) > 0) {
      return GO_UNKNOWN;
    }
    obj = atloc;
  }

  if (toting(obj)) {
    speak(gameData.actions[actionNames[verb]]?.message);
    return GO_CLEAROBJ;
  }

  if (obj === C.MESSAG) {
    rspeak(C.REMOVE_MESSAGE);
    destroy(C.MESSAG);
    return GO_CLEAROBJ;
  }

  if (store.objects[obj].fixed !== IS_FREE) {
    switch (obj) {
      case C.PLANT:
        rspeak((store.objects[C.PLANT].prop === 0 || store.objects[C.PLANT].prop < STATE_NOTFOUND) ? C.DEEP_ROOTS : C.YOU_JOKING);
        break;
      case C.BEAR:
        rspeak(store.objects[C.BEAR].prop === 1 ? C.BEAR_CHAINED : C.YOU_JOKING); // SITTING_BEAR = 1
        break;
      case C.CHAIN:
        rspeak(store.objects[C.BEAR].prop !== 0 ? C.STILL_LOCKED : C.YOU_JOKING);
        break;
      case C.RUG:
        rspeak(store.objects[C.RUG].prop === 2 ? C.RUG_HOVERS : C.YOU_JOKING); // RUG_HOVER = 2
        break;
      case C.URN:
        rspeak(C.URN_NOBUDGE);
        break;
      case C.CAVITY:
        rspeak(C.DOUGHNUT_HOLES);
        break;
      case C.BLOOD:
        rspeak(C.FEW_DROPS);
        break;
      case C.SIGN:
        rspeak(C.HAND_PASSTHROUGH);
        break;
      default:
        rspeak(C.YOU_JOKING);
    }
    return GO_CLEAROBJ;
  }

  if (obj === C.WATER || obj === C.OIL) {
    if (!here(C.BOTTLE) || liquid() !== obj) {
      if (!toting(C.BOTTLE)) {
        rspeak(C.NO_CONTAINER);
        return GO_CLEAROBJ;
      }
      if (store.objects[C.BOTTLE].prop === EMPTY_BOTTLE) {
        return fill(verb, C.BOTTLE);
      } else {
        rspeak(C.BOTTLE_FULL);
      }
      return GO_CLEAROBJ;
    }
    obj = C.BOTTLE;
  }

  if (store.holdng >= INVLIMIT) {
    rspeak(C.CARRY_LIMIT);
    return GO_CLEAROBJ;
  }

  if (obj === C.BIRD && store.objects[C.BIRD].prop !== 1 && store.objects[C.BIRD].prop >= STATE_NOTFOUND) { // BIRD_CAGED = 1
    if (store.objects[C.BIRD].prop === 2) { // BIRD_FOREST_UNCAGED = 2
      destroy(C.BIRD);
      rspeak(C.BIRD_CRAP);
      return GO_CLEAROBJ;
    }
    if (!toting(C.CAGE)) {
      rspeak(C.CANNOT_CARRY);
      return GO_CLEAROBJ;
    }
    if (toting(C.ROD)) {
      rspeak(C.BIRD_EVADES);
      return GO_CLEAROBJ;
    }
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[C.BIRD].prop = 1; // BIRD_CAGED = 1
    useGameStore.setState({ objects });
  }

  if ((obj === C.BIRD || obj === C.CAGE) && objectStateEquals(C.BIRD, 1)) { // BIRD_CAGED
    carry(C.BIRD + C.CAGE - obj, store.loc);
  }

  carry(obj, store.loc);

  if (obj === C.BOTTLE && liquid() !== 0) {
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[liquid()].place = CARRIED;
    useGameStore.setState({ objects });
  }

  // Matches C: !OBJECT_IS_FOUND(obj) i.e. prop != STATE_FOUND (0).
  if (GSTONE(obj) && useGameStore.getState().objects[obj].prop !== STATE_FOUND) {
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[obj].prop = STATE_FOUND;
    objects[C.CAVITY].prop = 1; // CAVITY_EMPTY = 1
    useGameStore.setState({ objects });
  }

  rspeak(C.OK_MAN);
  return GO_CLEAROBJ;
}

function GSTONE(obj: number): boolean {
  return obj === C.EMERALD || obj === C.RUBY || obj === C.AMBER || obj === C.SAPPH;
}

function discard(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (obj === C.ROD && !toting(C.ROD) && toting(C.ROD2)) {
    obj = C.ROD2;
  }

  if (!toting(obj)) {
    speak(gameData.actions[actionNames[verb]]?.message);
    return GO_CLEAROBJ;
  }

  if (GSTONE(obj) && at(C.CAVITY) && store.objects[C.CAVITY].prop !== 0) { // CAVITY_FULL = 0
    rspeak(C.GEM_FITS);
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[obj].prop = 1; // STATE_IN_CAVITY = 1
    objects[C.CAVITY].prop = 0; // CAVITY_FULL = 0
    useGameStore.setState({ objects });

    // RUG states: RUG_FLOOR = 0, RUG_DRAGON = 1, RUG_HOVER = 2
    if (here(C.RUG) && ((obj === C.EMERALD && store.objects[C.RUG].prop !== 2) || (obj === C.RUBY && store.objects[C.RUG].prop === 2))) {
      if (obj === C.RUBY) {
        rspeak(C.RUG_SETTLES);
      } else if (toting(C.RUG)) {
        rspeak(C.RUG_WIGGLES);
      } else {
        rspeak(C.RUG_RISES);
      }

      if (!toting(C.RUG) || obj === C.RUBY) {
        const k = (store.objects[C.RUG].prop === 2) ? 0 : 2; // was HOVER -> FLOOR, else -> HOVER
        objects[C.RUG].prop = k;
        useGameStore.setState({ objects });
        const dest = (k === 2) ? getPlacAndFixd(C.SAPPH).plac : 0; // IS_FREE = 0
        move(C.RUG + NOBJECTS, dest);
      }
    }
    drop(obj, store.loc);
    return GO_CLEAROBJ;
  }

  if (obj === C.COINS && here(C.VEND)) {
    destroy(C.COINS);
    drop(C.BATTERY, store.loc);
    pspeak(C.BATTERY, SpeakType.look, true, 0); // FRESH_BATTERIES = 0
    return GO_CLEAROBJ;
  }

  if (liquid() === obj) {
    obj = C.BOTTLE;
  }
  if (obj === C.BOTTLE && liquid() !== 0) {
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[liquid()].place = LOC_NOWHERE;
    useGameStore.setState({ objects });
  }

  if (obj === C.BEAR && at(C.TROLL)) {
    stateChange(C.TROLL, 2); // TROLL_GONE = 2
    move(C.TROLL, LOC_NOWHERE);
    move(C.TROLL + NOBJECTS, 0);
    const tLocs = getPlacAndFixd(C.TROLL);
    move(C.TROLL2, tLocs.plac);
    move(C.TROLL2 + NOBJECTS, tLocs.fixd);
    juggle(C.CHASM);
    drop(obj, store.loc);
    return GO_CLEAROBJ;
  }

  if (obj === C.VASE) {
    const pLocs = getPlacAndFixd(C.PILLOW);
    if (store.loc !== pLocs.plac) {
      stateChange(C.VASE, at(C.PILLOW) ? 0 : 1); // VASE_WHOLE = 0, VASE_DROPPED = 1
      if (useGameStore.getState().objects[C.VASE].prop !== 0) { // not VASE_WHOLE
        const objects = useGameStore.getState().objects.map(o => ({ ...o }));
        objects[C.VASE].fixed = -1; // IS_FIXED
        useGameStore.setState({ objects });
      }
      drop(obj, store.loc);
      return GO_CLEAROBJ;
    }
  }

  if (obj === C.CAGE && store.objects[C.BIRD].prop === 1) { // BIRD_CAGED
    drop(C.BIRD, store.loc);
  }

  if (obj === C.BIRD) {
    if (at(C.DRAGON) && store.objects[C.DRAGON].prop === 0) { // DRAGON_BARS = 0
      rspeak(C.BIRD_BURNT);
      destroy(C.BIRD);
      return GO_CLEAROBJ;
    }
    if (here(C.SNAKE)) {
      rspeak(C.BIRD_ATTACKS);
      if (store.closed) {
        return GO_DWARFWAKE;
      }
      destroy(C.SNAKE);
      const objects = useGameStore.getState().objects.map(o => ({ ...o }));
      objects[C.SNAKE].prop = 1; // SNAKE_CHASED = 1
      useGameStore.setState({ objects });
    } else {
      rspeak(C.OK_MAN);
    }
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[C.BIRD].prop = tstbit(store.loc, 7) ? 2 : 0; // FOREST = 7, uncaged state
    useGameStore.setState({ objects });
    drop(obj, store.loc);
    return GO_CLEAROBJ;
  }

  rspeak(C.OK_MAN);
  drop(obj, store.loc);
  return GO_CLEAROBJ;
}

function drink(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (obj === INTRANSITIVE && liqloc(store.loc) !== C.WATER && (liquid() !== C.WATER || !here(C.BOTTLE))) {
    return GO_UNKNOWN;
  }
  if (obj === C.BLOOD) {
    destroy(C.BLOOD);
    stateChange(C.DRAGON, 2); // DRAGON_BLOODLESS = 2
    useGameStore.setState({ blooded: true });
    return GO_CLEAROBJ;
  }
  if (obj !== INTRANSITIVE && obj !== C.WATER) {
    rspeak(C.RIDICULOUS_ATTEMPT);
    return GO_CLEAROBJ;
  }
  if (liquid() === C.WATER && here(C.BOTTLE)) {
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[C.WATER].place = LOC_NOWHERE;
    useGameStore.setState({ objects });
    stateChange(C.BOTTLE, EMPTY_BOTTLE);
    return GO_CLEAROBJ;
  }
  speak(gameData.actions[actionNames[verb]]?.message);
  return GO_CLEAROBJ;
}

function eat(verb: number, obj: number): number {
  const store = useGameStore.getState();
  switch (obj) {
    case INTRANSITIVE:
      if (!here(C.FOOD)) {
        return GO_UNKNOWN;
      }
    case C.FOOD:
      destroy(C.FOOD);
      rspeak(C.THANKS_DELICIOUS);
      break;
    case C.BIRD:
    case C.SNAKE:
    case C.CLAM:
    case C.OYSTER:
    case C.DWARF:
    case C.DRAGON:
    case C.TROLL:
    case C.BEAR:
    case C.OGRE:
      rspeak(C.LOST_APPETITE);
      break;
    default:
      speak(gameData.actions[actionNames[verb]]?.message);
  }
  return GO_CLEAROBJ;
}

function extinguish(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (obj === INTRANSITIVE) {
    if (here(C.LAMP) && store.objects[C.LAMP].prop === 1) {
      obj = C.LAMP;
    }
    if (here(C.URN) && store.objects[C.URN].prop === 2) { // URN_LIT
      obj = C.URN;
    }
    if (obj === INTRANSITIVE) {
      return GO_UNKNOWN;
    }
  }

  switch (obj) {
    case C.URN:
      if (store.objects[C.URN].prop !== 0) { // URN_EMPTY
        stateChange(C.URN, 1); // URN_DARK = 1
      } else {
        pspeak(C.URN, SpeakType.change, true, 1);
      }
      break;
    case C.LAMP:
      stateChange(C.LAMP, 0); // LAMP_DARK = 0
      rspeak(isDarkHere() ? C.PITCH_DARK : C.NO_MESSAGE);
      break;
    case C.DRAGON:
    case C.VOLCANO:
      rspeak(C.BEYOND_POWER);
      break;
    default:
      speak(gameData.actions[actionNames[verb]]?.message);
  }
  return GO_CLEAROBJ;
}

function feed(verb: number, obj: number): number {
  const store = useGameStore.getState();
  switch (obj) {
    case C.BIRD:
      rspeak(C.BIRD_PINING);
      break;
    case C.DRAGON:
      rspeak(store.objects[C.DRAGON].prop !== 0 ? C.RIDICULOUS_ATTEMPT : C.NOTHING_EDIBLE); // DRAGON_BARS = 0
      break;
    case C.SNAKE:
      if (!store.closed && here(C.BIRD)) {
        destroy(C.BIRD);
        rspeak(C.BIRD_DEVOURED);
      } else {
        rspeak(C.NOTHING_EDIBLE);
      }
      break;
    case C.TROLL:
      rspeak(C.TROLL_VICES);
      break;
    case C.DWARF:
      if (here(C.FOOD)) {
        useGameStore.setState({ dflag: store.dflag + 2 });
        rspeak(C.REALLY_MAD);
      } else {
        speak(gameData.actions[actionNames[verb]]?.message);
      }
      break;
    case C.BEAR:
      if (store.objects[C.BEAR].prop === 3) { // BEAR_DEAD
        rspeak(C.RIDICULOUS_ATTEMPT);
        break;
      }
      if (store.objects[C.BEAR].prop === 0) { // UNTAMED_BEAR
        if (here(C.FOOD)) {
          destroy(C.FOOD);
          // Re-read state after destroy() so its mutation isn't clobbered.
          const objects = useGameStore.getState().objects.map(o => ({ ...o }));
          objects[C.AXE].fixed = 0; // IS_FREE = 0
          objects[C.AXE].prop = 0; // AXE_HERE = 0
          useGameStore.setState({ objects });
          stateChange(C.BEAR, 1); // SITTING_BEAR = 1
        } else {
          rspeak(C.NOTHING_EDIBLE);
        }
        break;
      }
      speak(gameData.actions[actionNames[verb]]?.message);
      break;
    case C.OGRE:
      if (here(C.FOOD)) {
        rspeak(C.OGRE_FULL);
      } else {
        speak(gameData.actions[actionNames[verb]]?.message);
      }
      break;
    default:
      rspeak(C.AM_GAME);
  }
  return GO_CLEAROBJ;
}

function fill(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (obj === C.VASE) {
    if (liqloc(store.loc) === 0) {
      rspeak(C.FILL_INVALID);
      return GO_CLEAROBJ;
    }
    if (!toting(C.VASE)) {
      rspeak(C.ARENT_CARRYING);
      return GO_CLEAROBJ;
    }
    rspeak(C.SHATTER_VASE);
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[C.VASE].prop = 2; // VASE_BROKEN = 2
    objects[C.VASE].fixed = -1; // IS_FIXED
    useGameStore.setState({ objects });
    drop(C.VASE, store.loc);
    return GO_CLEAROBJ;
  }

  if (obj === C.URN) {
    if (store.objects[C.URN].prop !== 0) { // URN_EMPTY
      rspeak(C.FULL_URN);
      return GO_CLEAROBJ;
    }
    if (!here(C.BOTTLE)) {
      rspeak(C.FILL_INVALID);
      return GO_CLEAROBJ;
    }
    const k = liquid();
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    switch (k) {
      case C.WATER:
        objects[C.BOTTLE].prop = EMPTY_BOTTLE;
        useGameStore.setState({ objects });
        rspeak(C.WATER_URN);
        break;
      case C.OIL:
        objects[C.URN].prop = 1; // URN_DARK = 1
        objects[C.BOTTLE].prop = EMPTY_BOTTLE;
        useGameStore.setState({ objects });
        rspeak(C.OIL_URN);
        break;
      default:
        rspeak(C.FILL_INVALID);
        return GO_CLEAROBJ;
    }
    objects[k].place = LOC_NOWHERE;
    useGameStore.setState({ objects });
    return GO_CLEAROBJ;
  }

  if (obj !== INTRANSITIVE && obj !== C.BOTTLE) {
    speak(gameData.actions[actionNames[verb]]?.message);
    return GO_CLEAROBJ;
  }
  if (obj === INTRANSITIVE && !here(C.BOTTLE)) {
    return GO_UNKNOWN;
  }

  if (here(C.URN) && store.objects[C.URN].prop !== 0) {
    rspeak(C.URN_NOPOUR);
    return GO_CLEAROBJ;
  }
  if (liquid() !== 0) {
    rspeak(C.BOTTLE_FULL);
    return GO_CLEAROBJ;
  }
  if (liqloc(store.loc) === 0) {
    rspeak(C.NO_LIQUID);
    return GO_CLEAROBJ;
  }

  stateChange(C.BOTTLE, (liqloc(store.loc) === C.OIL) ? OIL_BOTTLE : WATER_BOTTLE);
  if (toting(C.BOTTLE)) {
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[liquid()].place = CARRIED;
    useGameStore.setState({ objects });
  }
  return GO_CLEAROBJ;
}

function find(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (toting(obj)) {
    rspeak(C.ALREADY_CARRYING);
    return GO_CLEAROBJ;
  }
  if (store.closed) {
    rspeak(C.NEEDED_NEARBY);
    return GO_CLEAROBJ;
  }
  if (at(obj) || (liquid() === obj && at(C.BOTTLE)) || obj === liqloc(store.loc) || (obj === C.DWARF && atdwrf(store.loc) > 0)) {
    rspeak(C.YOU_HAVEIT);
    return GO_CLEAROBJ;
  }
  speak(gameData.actions[actionNames[verb]]?.message);
  return GO_CLEAROBJ;
}

function fly(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (obj === INTRANSITIVE) {
    if (!here(C.RUG)) {
      rspeak(C.FLAP_ARMS);
      return GO_CLEAROBJ;
    }
    if (store.objects[C.RUG].prop !== 2) { // RUG_HOVER = 2
      rspeak(C.RUG_NOTHING2);
      return GO_CLEAROBJ;
    }
    obj = C.RUG;
  }

  if (obj !== C.RUG) {
    speak(gameData.actions[actionNames[verb]]?.message);
    return GO_CLEAROBJ;
  }
  if (store.objects[C.RUG].prop !== 2) { // RUG_HOVER = 2
    rspeak(C.RUG_NOTHING1);
    return GO_CLEAROBJ;
  }

  if (store.loc === C.LOC_CLIFF) {
    useGameStore.setState({ oldlc2: store.oldloc, oldloc: store.loc, newloc: C.LOC_LEDGE });
    rspeak(C.RUG_GOES);
  } else if (store.loc === C.LOC_LEDGE) {
    useGameStore.setState({ oldlc2: store.oldloc, oldloc: store.loc, newloc: C.LOC_CLIFF });
    rspeak(C.RUG_RETURNS);
  } else {
    rspeak(C.NOTHING_HAPPENS);
  }
  return GO_TERMINATE;
}

function inven(): number {
  const store = useGameStore.getState();
  let empty = true;
  for (let i = 1; i <= NOBJECTS; i++) {
    if (i === C.BEAR || !toting(i)) continue;
    if (empty) {
      rspeak(C.NOW_HOLDING);
      empty = false;
    }
    pspeak(i, SpeakType.touch, false, -1);
  }
  if (toting(C.BEAR)) {
    rspeak(C.TAME_BEAR);
  }
  if (empty) {
    rspeak(C.NO_CARRY);
  }
  return GO_CLEAROBJ;
}

function light(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (obj === INTRANSITIVE) {
    let selects = 0;
    if (here(C.LAMP) && store.objects[C.LAMP].prop === 0 && store.limit >= 0) { // LAMP_DARK = 0
      obj = C.LAMP;
      selects++;
    }
    if (here(C.URN) && store.objects[C.URN].prop === 1) { // URN_DARK = 1
      obj = C.URN;
      selects++;
    }
    if (selects !== 1) {
      return GO_UNKNOWN;
    }
  }

  switch (obj) {
    case C.URN:
      stateChange(C.URN, store.objects[C.URN].prop === 0 ? 0 : 2); // URN_EMPTY = 0, URN_LIT = 2
      break;
    case C.LAMP:
      if (store.limit < 0) {
        rspeak(C.LAMP_OUT);
        break;
      }
      stateChange(C.LAMP, 1); // LAMP_BRIGHT = 1
      if (store.wzdark) {
        return GO_TOP;
      }
      break;
    default:
      speak(gameData.actions[actionNames[verb]]?.message);
  }
  return GO_CLEAROBJ;
}

function listen(): number {
  const store = useGameStore.getState();
  let soundlatch = false;
  const locId = locNames[store.loc];
  const soundMsg = gameData.locations[locId]?.sound;

  if (soundMsg && soundMsg !== 'SILENT') {
    const soundIdx = msgNames.indexOf(soundMsg);
    rspeak(soundIdx);
    if (!gameData.locations[locId]?.loud) {
      rspeak(C.NO_MESSAGE);
    }
    soundlatch = true;
  }

  for (let i = 1; i <= NOBJECTS; i++) {
    const objData = gameData.objects[objNames[i]];
    if (!here(i) || !objData || !objData.sounds || objData.sounds.length === 0 ||
        store.objects[i].prop < STATE_NOTFOUND || store.objects[i].prop === STATE_NOTFOUND) {
      continue;
    }
    let mi = store.objects[i].prop;
    if (i === C.BIRD) {
      mi += 3 * (store.blooded ? 1 : 0);
    }
    pspeak(i, SpeakType.hear, true, mi, store.zzword);
    rspeak(C.NO_MESSAGE);
    if (i === C.BIRD && mi === 2) { // bird endstate
      destroy(C.BIRD);
    }
    soundlatch = true;
  }

  if (!soundlatch) {
    rspeak(C.ALL_SILENT);
  }
  return GO_CLEAROBJ;
}

function lock(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (obj === INTRANSITIVE) {
    if (here(C.CLAM)) obj = C.CLAM;
    if (here(C.OYSTER)) obj = C.OYSTER;
    if (at(C.DOOR)) obj = C.DOOR;
    if (at(C.GRATE)) obj = C.GRATE;
    if (here(C.CHAIN)) obj = C.CHAIN;
    if (obj === INTRANSITIVE) {
      rspeak(C.NOTHING_LOCKED);
      return GO_CLEAROBJ;
    }
  }

  switch (obj) {
    case C.CHAIN:
      if (here(C.KEYS)) {
        return chain(verb);
      } else {
        rspeak(C.NO_KEYS);
      }
      break;
    case C.GRATE:
      if (here(C.KEYS)) {
        if (store.closng) {
          rspeak(C.EXIT_CLOSED);
          if (!store.panic) {
            useGameStore.setState({ clock2: PANICTIME, panic: true });
          }
        } else {
          stateChange(C.GRATE, (verb === C.LOCK) ? 0 : 1); // GRATE_CLOSED = 0, GRATE_OPEN = 1
        }
      } else {
        rspeak(C.NO_KEYS);
      }
      break;
    case C.CLAM:
      if (verb === C.LOCK) {
        rspeak(C.HUH_MAN);
      } else if (toting(C.CLAM)) {
        rspeak(C.DROP_CLAM);
      } else if (!toting(C.TRIDENT)) {
        rspeak(C.CLAM_OPENER);
      } else {
        destroy(C.CLAM);
        drop(C.OYSTER, store.loc);
        drop(C.PEARL, C.LOC_CULDESAC);
        rspeak(C.PEARL_FALLS);
      }
      break;
    case C.OYSTER:
      if (verb === C.LOCK) {
        rspeak(C.HUH_MAN);
      } else if (toting(C.OYSTER)) {
        rspeak(C.DROP_OYSTER);
      } else if (!toting(C.TRIDENT)) {
        rspeak(C.OYSTER_OPENER);
      } else {
        rspeak(C.OYSTER_OPENS);
      }
      break;
    case C.DOOR:
      rspeak((store.objects[C.DOOR].prop === 1) ? C.OK_MAN : C.RUSTY_DOOR); // DOOR_UNRUSTED = 1
      break;
    case C.CAGE:
      rspeak(C.NO_LOCK);
      break;
    case C.KEYS:
      rspeak(C.CANNOT_UNLOCK);
      break;
    default:
      speak(gameData.actions[actionNames[verb]]?.message);
  }
  return GO_CLEAROBJ;
}

function chain(verb: number): number {
  const store = useGameStore.getState();
  // Bear states: UNTAMED=0, SITTING=1, CONTENTED=2, DEAD=3
  // Chain states: CHAIN_HEAP=0, CHAINING_BEAR=1, CHAIN_FIXED=2
  if (verb !== C.LOCK) {
    if (store.objects[C.BEAR].prop === 0) { // UNTAMED_BEAR
      rspeak(C.BEAR_BLOCKS);
      return GO_CLEAROBJ;
    }
    if (store.objects[C.CHAIN].prop === 0) { // CHAIN_HEAP
      rspeak(C.ALREADY_UNLOCKED);
      return GO_CLEAROBJ;
    }
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[C.CHAIN].prop = 0; // CHAIN_HEAP
    objects[C.CHAIN].fixed = 0; // IS_FREE
    if (objects[C.BEAR].prop !== 3) { // BEAR_DEAD
      objects[C.BEAR].prop = 2; // CONTENTED_BEAR
    }
    objects[C.BEAR].fixed = (objects[C.BEAR].prop === 3) ? -1 : 0; // DEAD -> IS_FIXED else IS_FREE
    useGameStore.setState({ objects });
    rspeak(C.CHAIN_UNLOCKED);
    return GO_CLEAROBJ;
  }

  // LOCK CHAIN
  if (store.objects[C.CHAIN].prop !== 0) { // CHAIN not in a heap
    rspeak(C.ALREADY_LOCKED);
    return GO_CLEAROBJ;
  }
  const { plac } = getPlacAndFixd(C.CHAIN);
  if (store.loc !== plac) {
    rspeak(C.NO_LOCKSITE);
    return GO_CLEAROBJ;
  }
  const objects = useGameStore.getState().objects.map(o => ({ ...o }));
  objects[C.CHAIN].prop = 2; // CHAIN_FIXED
  useGameStore.setState({ objects });
  if (toting(C.CHAIN)) {
    drop(C.CHAIN, store.loc);
  }
  const objects2 = useGameStore.getState().objects.map(o => ({ ...o }));
  objects2[C.CHAIN].fixed = -1; // IS_FIXED
  useGameStore.setState({ objects: objects2 });
  rspeak(C.CHAIN_LOCKED);
  return GO_CLEAROBJ;
}

function pour(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (obj === C.BOTTLE || obj === INTRANSITIVE) {
    obj = liquid();
  }
  if (obj === 0) {
    return GO_UNKNOWN;
  }
  if (!toting(obj)) {
    speak(gameData.actions[actionNames[verb]]?.message);
    return GO_CLEAROBJ;
  }

  if (obj !== C.OIL && obj !== C.WATER) {
    rspeak(C.CANT_POUR);
    return GO_CLEAROBJ;
  }
  if (here(C.URN) && store.objects[C.URN].prop === 0) { // URN_EMPTY = 0
    return fill(verb, C.URN);
  }
  
  const objects = useGameStore.getState().objects.map(o => ({ ...o }));
  objects[C.BOTTLE].prop = EMPTY_BOTTLE;
  objects[obj].place = LOC_NOWHERE;
  useGameStore.setState({ objects });

  if (!(at(C.PLANT) || at(C.DOOR))) {
    rspeak(C.GROUND_WET);
    return GO_CLEAROBJ;
  }

  if (!at(C.DOOR)) {
    if (obj === C.WATER) {
      const nextProp = (useGameStore.getState().objects[C.PLANT].prop + 1) % 3;
      stateChange(C.PLANT, nextProp);
      const objects = useGameStore.getState().objects.map(o => ({ ...o }));
      objects[C.PLANT2].prop = nextProp;
      useGameStore.setState({ objects });
      return GO_MOVE;
    } else {
      rspeak(C.SHAKING_LEAVES);
      return GO_CLEAROBJ;
    }
  } else {
    stateChange(C.DOOR, (obj === C.OIL) ? 1 : 0); // DOOR_UNRUSTED = 1, DOOR_RUSTED = 0
    return GO_CLEAROBJ;
  }
}

function quit(): number {
  useGameStore.setState({
    pendingQuery: {
      type: 'quit',
    }
  });
  speak(gameData.arbitrary_messages['REALLY_QUIT'] as string);
  return GO_CLEAROBJ;
}

function read(command: any): number {
  const store = useGameStore.getState();
  let obj = command.obj;
  if (obj === INTRANSITIVE) {
    obj = 0;
    for (let i = 1; i <= NOBJECTS; i++) {
      const objData = gameData.objects[objNames[i]];
      if (here(i) && objData && objData.texts && objData.texts.length > 0 && store.objects[i].prop >= STATE_NOTFOUND) {
        obj = obj * NOBJECTS + i;
      }
    }
    if (obj > NOBJECTS || obj === 0 || isDarkHere()) {
      return GO_UNKNOWN;
    }
  }

  if (isDarkHere()) {
    rspeak(C.NO_SEE, command.word[0].raw);
  } else if (obj === C.OYSTER) {
    if (!toting(C.OYSTER) || !store.closed) {
      rspeak(C.DONT_UNDERSTAND);
    } else if (!store.clshnt) {
      // yes_or_no(CLUE_QUERY, WAYOUT_CLUE, OK_MAN): only reveal on "yes".
      useGameStore.setState({ pendingQuery: { type: 'clue' } });
      rspeak(C.CLUE_QUERY);
    } else {
      pspeak(C.OYSTER, SpeakType.hear, true, 1);
    }
  } else if (!gameData.objects[objNames[obj]]?.texts || store.objects[obj].prop === STATE_NOTFOUND) {
    speak(gameData.actions[actionNames[command.verb]]?.message);
  } else {
    pspeak(obj, SpeakType.study, true, store.objects[obj].prop);
  }
  return GO_CLEAROBJ;
}

function reservoir(): number {
  const store = useGameStore.getState();
  if (!at(C.RESER) && store.loc !== C.LOC_RESBOTTOM) {
    rspeak(C.NOTHING_HAPPENS);
    return GO_CLEAROBJ;
  } else {
    stateChange(C.RESER, store.objects[C.RESER].prop === 1 ? 0 : 1); // WATERS_PARTED = 1
    if (at(C.RESER)) {
      return GO_CLEAROBJ;
    } else {
      useGameStore.setState({ oldlc2: store.loc, newloc: LOC_NOWHERE });
      rspeak(C.NOT_BRIGHT);
      return GO_TERMINATE;
    }
  }
}

function rub(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (obj === C.URN && store.objects[C.URN].prop === 2) { // URN_LIT = 2
    destroy(C.URN);
    drop(C.AMBER, store.loc);
    // Re-read after drop() so its place mutation isn't clobbered.
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[C.AMBER].prop = 1; // AMBER_IN_ROCK = 1
    useGameStore.setState({ objects, tally: useGameStore.getState().tally - 1 });
    drop(C.CAVITY, store.loc);
    rspeak(C.URN_GENIES);
  } else if (obj !== C.LAMP) {
    rspeak(C.PECULIAR_NOTHING);
  } else {
    speak(gameData.actions[actionNames[verb]]?.message);
  }
  return GO_CLEAROBJ;
}

function say(command: any): number {
  if (command.word[1].type === WordType.MOTION &&
      (command.word[1].id === C.XYZZY || command.word[1].id === C.PLUGH || command.word[1].id === C.PLOVER)) {
    return GO_WORD2;
  }
  if (command.word[1].type === WordType.ACTION && command.word[1].id === C.PART) {
    return reservoir();
  }
  if (command.word[1].type === WordType.ACTION &&
      (command.word[1].id === C.FEE || command.word[1].id === C.FIE ||
       command.word[1].id === C.FOE || command.word[1].id === C.FOO ||
       command.word[1].id === C.FUM)) {
    return bigwords(command.word[1].id);
  }
  sspeak(C.OKEY_DOKEY, command.word[1].raw);
  return GO_CLEAROBJ;
}

function throw_support(spk: number): number {
  rspeak(spk);
  drop(C.AXE, useGameStore.getState().loc);
  return GO_MOVE;
}

function throwit(command: any): number {
  const store = useGameStore.getState();
  if (!toting(command.obj)) {
    speak(gameData.actions[actionNames[command.verb]]?.message);
    return GO_CLEAROBJ;
  }
  if (gameData.objects[objNames[command.obj]]?.treasure && at(C.TROLL)) {
    drop(command.obj, LOC_NOWHERE);
    move(C.TROLL, LOC_NOWHERE);
    move(C.TROLL + NOBJECTS, 0); // IS_FREE = 0
    const tLocs = getPlacAndFixd(C.TROLL);
    drop(C.TROLL2, tLocs.plac);
    drop(C.TROLL2 + NOBJECTS, tLocs.fixd);
    juggle(C.CHASM);
    rspeak(C.TROLL_SATISFIED);
    return GO_CLEAROBJ;
  }
  if (command.obj === C.FOOD && here(C.BEAR)) {
    command.obj = C.BEAR;
    return feed(command.verb, command.obj);
  }
  if (command.obj !== C.AXE) {
    return discard(command.verb, command.obj);
  } else {
    if (atdwrf(store.loc) <= 0) {
      if (at(C.DRAGON) && store.objects[C.DRAGON].prop === 0) { // DRAGON_BARS
        return throw_support(C.DRAGON_SCALES);
      }
      if (at(C.TROLL)) {
        return throw_support(C.TROLL_RETURNS);
      }
      if (at(C.OGRE)) {
        return throw_support(C.OGRE_DODGE);
      }
      if (here(C.BEAR) && store.objects[C.BEAR].prop === 0) { // UNTAMED
        drop(C.AXE, store.loc);
        const objects = useGameStore.getState().objects.map(o => ({ ...o }));
        objects[C.AXE].fixed = -1; // IS_FIXED
        useGameStore.setState({ objects });
        juggle(C.BEAR);
        stateChange(C.AXE, 1); // AXE_LOST = 1
        return GO_CLEAROBJ;
      }
      command.obj = INTRANSITIVE;
      return attack(command);
    }

    if (randrange(NDWARVES + 1) < store.dflag) {
      return throw_support(C.DWARF_DODGES);
    } else {
      const i = atdwrf(store.loc);
      const dwarves = store.dwarves.map(d => ({ ...d }));
      dwarves[i].seen = false;
      dwarves[i].loc = LOC_NOWHERE;
      
      const dkill = store.dkill + 1;
      useGameStore.setState({ dwarves, dkill });
      return throw_support(dkill === 1 ? C.DWARF_SMOKE : C.KILLED_DWARF);
    }
  }
}

function wake(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (obj !== C.DWARF || !store.closed) {
    speak(gameData.actions[actionNames[verb]]?.message);
    return GO_CLEAROBJ;
  } else {
    rspeak(C.PROD_DWARF);
    return GO_DWARFWAKE;
  }
}

function seed(verb: number, arg: string): number {
  const s = parseInt(arg);
  speak(gameData.actions[actionNames[verb]]?.message, s);
  set_seed(s);
  const turns = useGameStore.getState().turns - 1;
  useGameStore.setState({ turns });
  return GO_TOP;
}

function waste(verb: number, turns: number): number {
  const store = useGameStore.getState();
  const limit = store.limit - turns;
  speak(gameData.actions[actionNames[verb]]?.message, limit);
  useGameStore.setState({ limit });
  return GO_TOP;
}

function wave(verb: number, obj: number): number {
  const store = useGameStore.getState();
  if (obj !== C.ROD || !toting(obj) || (!here(C.BIRD) && (store.closng || !at(C.FISSURE)))) {
    speak(((!toting(obj)) && (obj !== C.ROD || !toting(C.ROD2))) ? gameData.arbitrary_messages['ARENT_CARRYING'] as string : gameData.actions[actionNames[verb]]?.message);
    return GO_CLEAROBJ;
  }

  if (store.objects[C.BIRD].prop === 0 && store.loc === store.objects[C.STEPS].place && store.objects[C.JADE].prop === STATE_NOTFOUND) { // BIRD_UNCAGED = 0
    drop(C.JADE, store.loc);
    const objects = useGameStore.getState().objects.map(o => ({ ...o }));
    objects[C.JADE].prop = STATE_FOUND;
    useGameStore.setState({ objects, tally: useGameStore.getState().tally - 1 });
    rspeak(C.NECKLACE_FLY);
    return GO_CLEAROBJ;
  } else {
    if (store.closed) {
      rspeak(store.objects[C.BIRD].prop === 1 ? C.CAGE_FLY : C.FREE_FLY);
      return GO_DWARFWAKE;
    }
    if (store.closng || !at(C.FISSURE)) {
      rspeak(store.objects[C.BIRD].prop === 1 ? C.CAGE_FLY : C.FREE_FLY);
      return GO_CLEAROBJ;
    }
    if (here(C.BIRD)) {
      rspeak(store.objects[C.BIRD].prop === 1 ? C.CAGE_FLY : C.FREE_FLY);
    }
    stateChange(C.FISSURE, store.objects[C.FISSURE].prop === 1 ? 0 : 1); // BRIDGED = 1, UNBRIDGED = 0
    return GO_CLEAROBJ;
  }
}

function attack(command: any): number {
  const store = useGameStore.getState();
  const verb = command.verb;
  let obj = command.obj;

  if (obj === INTRANSITIVE) {
    let changes = 0;
    if (atdwrf(store.loc) > 0) {
      obj = C.DWARF;
      changes++;
    }
    if (here(C.SNAKE)) {
      obj = C.SNAKE;
      changes++;
    }
    if (at(C.DRAGON) && store.objects[C.DRAGON].prop === 0) { // DRAGON_BARS
      obj = C.DRAGON;
      changes++;
    }
    if (at(C.TROLL)) {
      obj = C.TROLL;
      changes++;
    }
    if (at(C.OGRE)) {
      obj = C.OGRE;
      changes++;
    }
    if (here(C.BEAR) && store.objects[C.BEAR].prop === 0) { // UNTAMED
      obj = C.BEAR;
      changes++;
    }
    if (obj === INTRANSITIVE) {
      if (here(C.BIRD) && verb !== C.THROW) {
        obj = C.BIRD;
        changes++;
      }
      if (here(C.VEND) && verb !== C.THROW) {
        obj = C.VEND;
        changes++;
      }
      if (here(C.CLAM) || here(C.OYSTER)) {
        obj = C.CLAM;
        changes++;
      }
    }
    if (changes >= 2) {
      return GO_UNKNOWN;
    }
  }

  if (obj === C.BIRD) {
    if (store.closed) {
      rspeak(C.UNHAPPY_BIRD);
    } else {
      destroy(C.BIRD);
      rspeak(C.BIRD_DEAD);
    }
    return GO_CLEAROBJ;
  }
  if (obj === C.VEND) {
    stateChange(C.VEND, store.objects[C.VEND].prop === 0 ? 1 : 0); // VEND_BLOCKS = 0
    return GO_CLEAROBJ;
  }
  if (obj === C.BEAR) {
    switch (store.objects[C.BEAR].prop) {
      case 0: // UNTAMED_BEAR
        rspeak(C.BEAR_HANDS);
        break;
      case 1: // SITTING_BEAR
      case 2: // CONTENTED_BEAR
        rspeak(C.BEAR_CONFUSED);
        break;
      case 3: // BEAR_DEAD
        rspeak(C.ALREADY_DEAD);
        break;
    }
    return GO_CLEAROBJ;
  }

  if (obj === C.DRAGON && store.objects[C.DRAGON].prop === 0) {
    useGameStore.setState({
      pendingQuery: {
        type: 'dragon',
      }
    });
    speak(gameData.arbitrary_messages['BARE_HANDS_QUERY'] as string);
    return GO_CLEAROBJ;
  }

  if (obj === C.OGRE) {
    rspeak(C.OGRE_DODGE); // OGRE_DODGE in C, but here we speak dodges
    if (atdwrf(store.loc) <= 0) {
      return GO_CLEAROBJ;
    }
    rspeak(C.KNIFE_THROWN);
    destroy(C.OGRE);
    
    let dwarvesCount = 0;
    const dwarves = store.dwarves.map(d => ({ ...d }));
    for (let i = 1; i < PIRATE; i++) {
      if (dwarves[i].loc === store.loc) {
        dwarvesCount++;
        dwarves[i].loc = C.LOC_LONGWEST;
        dwarves[i].seen = false;
      }
    }
    useGameStore.setState({ dwarves });
    rspeak(dwarvesCount > 1 ? C.OGRE_PANIC1 : C.OGRE_PANIC2);
    return GO_CLEAROBJ;
  }

  switch (obj) {
    case INTRANSITIVE:
      rspeak(C.NO_TARGET);
      break;
    case C.CLAM:
    case C.OYSTER:
      rspeak(C.SHELL_IMPERVIOUS);
      break;
    case C.SNAKE:
      rspeak(C.SNAKE_WARNING);
      break;
    case C.DWARF:
      if (store.closed) {
        return GO_DWARFWAKE;
      }
      rspeak(C.BARE_HANDS_QUERY);
      break;
    case C.DRAGON:
      rspeak(C.ALREADY_DEAD);
      break;
    case C.TROLL:
      rspeak(C.ROCKY_TROLL);
      break;
    default:
      speak(gameData.actions[actionNames[verb]]?.message);
  }
  return GO_CLEAROBJ;
}

function bigwords(id: number): number {
  const store = useGameStore.getState();
  const foobar = Math.abs(store.foobar);

  if (foobar === WORD_EMPTY && (id === C.FIE || id === C.FOE || id === C.FOO || id === C.FUM)) {
    rspeak(C.NOTHING_HAPPENS);
    return GO_CLEAROBJ;
  }

  if ((foobar === WORD_EMPTY && id === C.FEE) ||
      (foobar === C.FEE && id === C.FIE) || (foobar === C.FIE && id === C.FOE) ||
      (foobar === C.FOE && id === C.FOO)) {
    useGameStore.setState({ foobar: id });
    if (id !== C.FOO) {
      rspeak(C.OK_MAN);
      return GO_CLEAROBJ;
    }
    useGameStore.setState({ foobar: WORD_EMPTY });
    const eggPlac = getPlacAndFixd(C.EGGS).plac;
    if (store.objects[C.EGGS].place === eggPlac || (toting(C.EGGS) && store.loc === eggPlac)) {
      rspeak(C.NOTHING_HAPPENS);
      return GO_CLEAROBJ;
    } else {
      if (store.objects[C.EGGS].place === LOC_NOWHERE && store.objects[C.TROLL].place === LOC_NOWHERE && store.objects[C.TROLL].prop === 0) { // TROLL_UNPAID = 0
        const objects = useGameStore.getState().objects.map(o => ({ ...o }));
        objects[C.TROLL].prop = 1; // TROLL_PAIDONCE = 1
        useGameStore.setState({ objects });
      }
      if (here(C.EGGS)) {
        pspeak(C.EGGS, SpeakType.look, true, 1); // EGGS_VANISHED = 1
      } else if (store.loc === eggPlac) {
        pspeak(C.EGGS, SpeakType.look, true, 0); // EGGS_HERE = 0
      } else {
        pspeak(C.EGGS, SpeakType.look, true, 2); // EGGS_DONE = 2
      }
      move(C.EGGS, eggPlac);
      return GO_CLEAROBJ;
    }
  } else {
    // Magic-word sequence was started but is incorrect.
    if (store.seenbigwords) {
      rspeak(C.START_OVER);
    } else {
      rspeak(C.WELL_POINTLESS);
    }
    useGameStore.setState({ foobar: WORD_EMPTY });
    return GO_CLEAROBJ;
  }
}

function blast(): void {
  const store = useGameStore.getState();
  if (store.objects[C.ROD2].prop === STATE_NOTFOUND || !store.closed) {
    rspeak(C.REQUIRES_DYNAMITE);
  } else {
    let bonus = 0;
    if (here(C.ROD2)) {
      bonus = 1; // splatter
      rspeak(C.SPLATTER_MESSAGE);
    } else if (store.loc === C.LOC_NE) {
      bonus = 2; // defeat
      rspeak(C.DEFEAT_MESSAGE);
    } else {
      bonus = 3; // victory
      rspeak(C.VICTORY_MESSAGE);
    }
    useGameStore.setState({ bonus });
    terminate(Termination.endgame);
  }
}

function vbreak(verb: number, obj: number): number {
  const store = useGameStore.getState();
  switch (obj) {
    case C.MIRROR:
      if (store.closed) {
        stateChange(C.MIRROR, 1); // MIRROR_BROKEN = 1
        return GO_DWARFWAKE;
      } else {
        rspeak(C.TOO_FAR);
        break;
      }
    case C.VASE:
      if (store.objects[C.VASE].prop === 0) { // VASE_WHOLE = 0
        if (toting(C.VASE)) {
          drop(C.VASE, store.loc);
        }
        stateChange(C.VASE, 2); // VASE_BROKEN = 2
        // Re-read after stateChange/drop so their mutations aren't clobbered.
        const objects = useGameStore.getState().objects.map(o => ({ ...o }));
        objects[C.VASE].fixed = -1; // IS_FIXED
        useGameStore.setState({ objects });
        break;
      }
    default:
      speak(gameData.actions[actionNames[verb]]?.message);
  }
  return GO_CLEAROBJ;
}

function brief(): number {
  useGameStore.setState({ abbnum: 10000, detail: 3 });
  rspeak(C.BRIEF_CONFIRM);
  return GO_CLEAROBJ;
}

export const saveFiles = new Map<string, string>();

function serializeGameState(): string {
  const store = useGameStore.getState();
  return JSON.stringify({
    lcg_x: store.lcg_x,
    turns: store.turns,
    limit: store.limit,
    novice: store.novice,
    numdie: store.numdie,
    trnluz: store.trnluz,
    saved: store.saved + 5, // Deduct 5 points penalty for saving
    tally: store.tally,
    thresh: store.thresh,
    detail: store.detail,
    abbnum: store.abbnum,
    chloc: store.chloc,
    chloc2: store.chloc2,
    loc: store.loc,
    oldloc: store.oldloc,
    oldlc2: store.oldlc2,
    newloc: store.newloc,
    dflag: store.dflag,
    dkill: store.dkill,
    dtotal: store.dtotal,
    foobar: store.foobar,
    holdng: store.holdng,
    igo: store.igo,
    iwest: store.iwest,
    knfloc: store.knfloc,
    clock1: store.clock1,
    clock2: store.clock2,
    clshnt: store.clshnt,
    closed: store.closed,
    closng: store.closng,
    lmwarn: store.lmwarn,
    panic: store.panic,
    wzdark: store.wzdark,
    blooded: store.blooded,
    conds: store.conds,
    bonus: store.bonus,
    zzword: store.zzword,
    seenbigwords: store.seenbigwords,
    oldobj: store.oldobj,
    locs: store.locs,
    dwarves: store.dwarves,
    objects: store.objects,
    hints: store.hints,
    link: store.link,
    visitedRooms: store.visitedRooms,
  });
}

function suspend(): number {
  rspeak(C.SUSPEND_WARNING);
  rspeak(C.THIS_ACCEPTABLE);
  useGameStore.setState({
    pendingQuery: {
      type: 'save_accept'
    }
  });
  return GO_CLEAROBJ;
}

function resume(): number {
  const store = useGameStore.getState();
  const atStart = store.loc === C.LOC_START && store.locs[C.LOC_START].abbrev === 1;
  if (!atStart) {
    rspeak(C.RESUME_ABANDON);
    rspeak(C.THIS_ACCEPTABLE);
    useGameStore.setState({
      pendingQuery: {
        type: 'resume_accept'
      }
    });
    return GO_CLEAROBJ;
  }

  useGameStore.setState({
    pendingQuery: {
      type: 'resume_file'
    }
  });
  speakPrompt('File name: ');
  return GO_CLEAROBJ;
}

// ── Main Action Dispatcher ───────────────────────────────────────────────────

function action(cmd: { verb: number; part: number; obj: number; word: { raw: string; id: number; type: WordType }[] }): number {
  const store = useGameStore.getState();
  const verbName = actionNames[cmd.verb];
  const verbData = gameData.actions[verbName];

  if (verbData?.noaction) {
    speak(verbData.message);
    return GO_CLEAROBJ;
  }

  if (cmd.part === 0) { // SpeechPart.unknown
    if (here(cmd.obj)) {
      // Ok
    } else if (cmd.obj === C.DWARF && atdwrf(store.loc) > 0) {
      // Ok
    } else if (!store.closed && ((liquid() === cmd.obj && here(C.BOTTLE)) || cmd.obj === liqloc(store.loc))) {
      // Ok
    } else if (cmd.obj === C.OIL && here(C.URN) && store.objects[C.URN].prop !== 0) { // URN_EMPTY = 0
      cmd.obj = C.URN;
    } else if (cmd.obj === C.PLANT && at(C.PLANT2) && store.objects[C.PLANT2].prop !== 0) { // PLANT_THIRSTY
      cmd.obj = C.PLANT2;
    } else if (cmd.obj === C.KNIFE && store.knfloc === store.loc) {
      useGameStore.setState({ knfloc: -1 });
      rspeak(C.KNIVES_VANISH);
      return GO_CLEAROBJ;
    } else if (cmd.obj === C.ROD && here(C.ROD2)) {
      cmd.obj = C.ROD2;
    } else if ((cmd.verb === C.FIND || cmd.verb === C.INVENTORY) &&
               (cmd.word[1].id === WORD_EMPTY || cmd.word[1].id === WORD_NOT_FOUND)) {
      // Ok
    } else {
      rspeak(C.NO_SEE, cmd.word[0].raw);
      return GO_CLEAROBJ;
    }

    if (cmd.verb !== 0) {
      cmd.part = 2; // SpeechPart.transitive
    }
  }

  // Intransitive verb actions
  if (cmd.part === 1) { // SpeechPart.intransitive
    if (cmd.word[1].raw && cmd.verb !== C.SAY) {
      return GO_WORD2;
    }
    if (cmd.verb === C.SAY) {
      cmd.obj = cmd.word[1].raw ? C.KEYS : 0;
    }
    if (cmd.obj === 0 || cmd.obj === INTRANSITIVE) {
      switch (cmd.verb) {
        case C.CARRY:
          return vcarry(cmd.verb, INTRANSITIVE);
        case C.DROP:
          return GO_UNKNOWN;
        case C.SAY:
          return GO_UNKNOWN;
        case C.UNLOCK:
          return lock(cmd.verb, INTRANSITIVE);
        case C.NOTHING:
          rspeak(C.OK_MAN);
          return GO_CLEAROBJ;
        case C.LOCK:
          return lock(cmd.verb, INTRANSITIVE);
        case C.LIGHT:
          return light(cmd.verb, INTRANSITIVE);
        case C.EXTINGUISH:
          return extinguish(cmd.verb, INTRANSITIVE);
        case C.WAVE:
          return GO_UNKNOWN;
        case C.GO:
          speak(verbData?.message);
          return GO_CLEAROBJ;
        case C.ATTACK:
          cmd.obj = INTRANSITIVE;
          return attack(cmd);
        case C.POUR:
          return pour(cmd.verb, INTRANSITIVE);
        case C.EAT:
          return eat(cmd.verb, INTRANSITIVE);
        case C.DRINK:
          return drink(cmd.verb, INTRANSITIVE);
        case C.THROW:
          return GO_UNKNOWN;
        case C.QUIT:
          return quit();
        case C.INVENTORY:
          return inven();
        case C.FILL:
          return fill(cmd.verb, INTRANSITIVE);
        case C.BLAST:
          blast();
          return GO_CLEAROBJ;
        case C.SCORE:
          score(Termination.scoregame);
          return GO_CLEAROBJ;
        case C.FEE:
        case C.FIE:
        case C.FOE:
        case C.FOO:
        case C.FUM:
          return bigwords(cmd.word[0].id);
        case C.BRIEF:
          return brief();
        case C.READ:
          cmd.obj = INTRANSITIVE;
          return read(cmd);
        case C.SAVE:
          return suspend();
        case C.RESUME:
          return resume();
        case C.FLY:
          return fly(cmd.verb, INTRANSITIVE);
        case C.LISTEN:
          return listen();
        case C.SEED:
        case C.WASTE:
          rspeak(C.NUMERIC_REQUIRED);
          return GO_TOP;
        case C.PART:
          return reservoir();
        default:
          return GO_UNKNOWN;
      }
    }
  }

  // Transitive verb actions. The reference falls through from the
  // intransitive case, so a carried object (e.g. after "food" then "get")
  // is handled here even though part is still intransitive.
  if (cmd.part === 2 || (cmd.part === 1 && cmd.obj !== 0 && cmd.obj !== INTRANSITIVE)) {
    switch (cmd.verb) {
      case C.CARRY:
        return vcarry(cmd.verb, cmd.obj);
      case C.DROP:
        return discard(cmd.verb, cmd.obj);
      case C.SAY:
        return say(cmd);
      case C.UNLOCK:
        return lock(cmd.verb, cmd.obj);
      case C.NOTHING:
        rspeak(C.OK_MAN);
        return GO_CLEAROBJ;
      case C.LOCK:
        return lock(cmd.verb, cmd.obj);
      case C.LIGHT:
        return light(cmd.verb, cmd.obj);
      case C.EXTINGUISH:
        return extinguish(cmd.verb, cmd.obj);
      case C.WAVE:
        return wave(cmd.verb, cmd.obj);
      case C.TAME:
        speak(verbData?.message);
        return GO_CLEAROBJ;
      case C.GO:
        speak(verbData?.message);
        return GO_CLEAROBJ;
      case C.ATTACK:
        return attack(cmd);
      case C.POUR:
        return pour(cmd.verb, cmd.obj);
      case C.EAT:
        return eat(cmd.verb, cmd.obj);
      case C.DRINK:
        return drink(cmd.verb, cmd.obj);
      case C.RUB:
        return rub(cmd.verb, cmd.obj);
      case C.THROW:
        return throwit(cmd);
      case C.QUIT:
        speak(verbData?.message);
        return GO_CLEAROBJ;
      case C.FIND:
        return find(cmd.verb, cmd.obj);
      case C.INVENTORY:
        return find(cmd.verb, cmd.obj);
      case C.FEED:
        return feed(cmd.verb, cmd.obj);
      case C.FILL:
        return fill(cmd.verb, cmd.obj);
      case C.BLAST:
        blast();
        return GO_CLEAROBJ;
      case C.SCORE:
        speak(verbData?.message);
        return GO_CLEAROBJ;
      case C.FEE:
      case C.FIE:
      case C.FOE:
      case C.FOO:
      case C.FUM:
        speak(verbData?.message);
        return GO_CLEAROBJ;
      case C.BRIEF:
        speak(verbData?.message);
        return GO_CLEAROBJ;
      case C.READ:
        return read(cmd);
      case C.BREAK:
        return vbreak(cmd.verb, cmd.obj);
      case C.WAKE:
        return wake(cmd.verb, cmd.obj);
      case C.SAVE:
        speak(verbData?.message);
        return GO_CLEAROBJ;
      case C.RESUME:
        speak(verbData?.message);
        return GO_CLEAROBJ;
      case C.FLY:
        return fly(cmd.verb, cmd.obj);
      case C.LISTEN:
        speak(verbData?.message);
        return GO_CLEAROBJ;
      case C.SEED:
        return seed(cmd.verb, cmd.word[1].raw);
      case C.WASTE:
        return waste(cmd.verb, parseInt(cmd.word[1].raw));
      case C.PART:
        return reservoir();
      default:
        return GO_UNKNOWN;
    }
  }

  // Unknown verb, object couldn't be deduced: "What do you want to do with the X?"
  sspeak(C.WHAT_DO, cmd.word[0].raw);
  return GO_CHECKHINT;
}

// ── Scoring and Reincarnation ────────────────────────────────────────────────

export function score(mode: Termination): number {
  const store = useGameStore.getState();
  let score = 0;
  let mxscor = 0;

  // Tally treasures points
  for (let i = 1; i <= NOBJECTS; i++) {
    const objId = objNames[i];
    if (!gameData.objects[objId]?.treasure) continue;
    
    // Treasure has inventory message
    if (gameData.objects[objId].inventory) {
      let k = 12;
      if (i === C.CHEST) k = 14;
      if (i > C.CHEST) k = 16;
      
      if (store.objects[i].prop >= STATE_FOUND) {
        score += 2;
      }
      // OBJECT_IS_FOUND: prop must be exactly STATE_FOUND (0), not merely >= 0.
      if (store.objects[i].place === C.LOC_BUILDING && store.objects[i].prop === STATE_FOUND) {
        score += k - 2;
      }
      mxscor += k;
    }
  }

  const NDEATHS = 3;
  score += (NDEATHS - store.numdie) * 10;
  mxscor += NDEATHS * 10;

  if (mode === Termination.endgame) {
    score += 4;
  }
  mxscor += 4;

  if (store.dflag !== 0) {
    score += 25;
  }
  mxscor += 25;

  if (store.closng) {
    score += 25;
  }
  mxscor += 25;

  if (store.closed) {
    if (store.bonus === 0) score += 10; // none
    if (store.bonus === 1) score += 25; // splatter
    if (store.bonus === 2) score += 30; // defeat
    if (store.bonus === 3) score += 45; // victory
  }
  mxscor += 45;

  if (store.objects[C.MAGAZINE].place === C.LOC_WITTSEND) {
    score += 1;
  }
  mxscor += 1;

  score += 2;
  mxscor += 2;

  // Deduct hints
  for (let i = 0; i < gameData.hints.length; i++) {
    if (store.hints[i].used) {
      score -= gameData.hints[i].penalty;
    }
  }

  if (store.novice) score -= 5;
  if (store.clshnt) score -= 10;

  score = score - store.trnluz - store.saved;

  if (mode === Termination.scoregame) {
    rspeak(C.GARNERED_POINTS, score, mxscor, store.turns, store.turns);
  }

  useGameStore.setState({ score });
  return score;
}

export function terminate(mode: Termination): never {
  const store = useGameStore.getState();
  const points = score(mode);
  const NCLASSES = gameData.classes.length;

  let mxscor = 430; // Maximum standard score

  if (points + store.trnluz + 1 >= mxscor && store.trnluz !== 0) {
    rspeak(C.TOOK_LONG);
  }
  if (points + store.saved + 1 >= mxscor && store.saved !== 0) {
    rspeak(C.WITHOUT_SUSPENDS);
  }

  rspeak(C.TOTAL_SCORE, points, mxscor, store.turns, store.turns);

  for (let i = 0; i < NCLASSES; i++) {
    if (gameData.classes[i].threshold >= points) {
      speak(gameData.classes[i].message);
      if (i < NCLASSES - 1) {
        const nxt = gameData.classes[i].threshold + 1 - points;
        rspeak(C.NEXT_HIGHER, nxt, nxt);
      } else {
        rspeak(C.NO_HIGHER);
      }
      break;
    }
  }

  // End turn loops by resetting or doing nothing
  useGameStore.setState({ pendingQuery: null });
  // Custom exit throws exception to break command routine
  throw new Error('GAME_TERMINATED');
}

// ── Initialization Engine ────────────────────────────────────────────────────

function initialiseEngine(): void {
  const store = useGameStore.getState();

  // Choose a random seedval
  const seedval = Math.floor(Math.random() * LCG_M);
  set_seed(seedval);

  const dwarves = store.dwarves.map(d => ({ ...d }));
  const dwarflocs = gameData.dwarflocs;
  for (let i = 1; i <= NDWARVES; i++) {
    dwarves[i].loc = locNames.indexOf(dwarflocs[i - 1]);
  }

  const objects = useGameStore.getState().objects.map(o => ({ ...o }));
  for (let i = 1; i <= NOBJECTS; i++) {
    objects[i].place = LOC_NOWHERE;
  }
  useGameStore.setState({ dwarves, objects });

  // Forced locations bit
  for (let i = 1; i <= NLOCATIONS; i++) {
    const locId = locNames[i];
    const locData = gameData.locations[locId];
    if (locData && locData.travel && locData.travel.length > 0) {
      if (locData.travel[0].verbs.length === 0) {
        // Set bit in conditions
        // Wait, conditions is parsed, but we just check isForced() in tstbit!
        // So no need to mutate conditions array directly.
      }
    }
  }

  // Drop initial objects
  for (let i = NOBJECTS; i >= 1; i--) {
    const { plac, fixd } = getPlacAndFixd(i);
    if (fixd > 0) {
      drop(i + NOBJECTS, fixd);
      drop(i, plac);
    }
  }

  for (let i = 1; i <= NOBJECTS; i++) {
    const k = NOBJECTS + 1 - i;
    const { plac, fixd } = getPlacAndFixd(k);
    
    const storeObjects = useGameStore.getState().objects.map(o => ({ ...o }));
    storeObjects[k].fixed = fixd;
    useGameStore.setState({ objects: storeObjects });

    if (plac !== 0 && fixd <= 0) {
      drop(k, plac);
    }
  }

  const finalObjects = useGameStore.getState().objects.map(o => ({ ...o }));
  let tally = 0;
  for (let object = 1; object <= NOBJECTS; object++) {
    const isTr = isTreasure(object);
    if (isTr) {
      tally++;
      if (hasInventory(object)) {
        finalObjects[object].prop = STATE_NOTFOUND;
      }
    } else {
      finalObjects[object].prop = STATE_FOUND;
    }
  }

  useGameStore.setState({ objects: finalObjects, tally, conds: 1 << 11 });
}

// ── Game UI Synchronization ──────────────────────────────────────────────────

function syncStoreStrings(): void {
  const store = useGameStore.getState();
  const currentLocId = locNames[store.loc];
  
  const inventory: string[] = [];
  for (let i = 1; i <= NOBJECTS; i++) {
    if (store.objects[i].place === CARRIED) {
      inventory.push(objNames[i]);
    }
  }

  const objectLocations: Record<string, string> = {};
  const objectStates: Record<string, number> = {};
  for (let i = 1; i <= NOBJECTS; i++) {
    const place = store.objects[i].place;
    const fixed = store.objects[i].fixed;
    const prop = store.objects[i].prop;
    const objId = objNames[i];
    
    let decodedState = prop;
    if (prop < STATE_NOTFOUND) {
      decodedState = -1 - prop;
    }
    objectStates[objId] = decodedState;

    if (place === CARRIED) {
      objectLocations[objId] = 'IN_INVENTORY';
    } else if (place === store.loc || fixed === store.loc) {
      objectLocations[objId] = currentLocId;
    } else if (place === LOC_NOWHERE) {
      objectLocations[objId] = 'LOC_NOWHERE';
    } else {
      objectLocations[objId] = locNames[place];
    }
  }

  useGameStore.setState({
    currentLocation: currentLocId,
    inventory,
    objectLocations,
    objectStates,
  });
}

// ── Command Parsing ──────────────────────────────────────────────────────────

function tokenize(raw: string, cmd: { word: { raw: string; id: number; type: WordType }[] }) {
  const parts = raw.trim().split(/\s+/);
  
  const getVocabIdAndType = (word: string) => {
    if (!word) {
      return { id: WORD_EMPTY, type: WordType.NO_WORD_TYPE };
    }
    const wordUpper = word.toUpperCase();
    const resolvedKey = gameData.vocabulary[wordUpper] || gameData.vocabulary[wordUpper.substring(0, 5)];

    if (resolvedKey) {
      const motionIdx = motionNames.indexOf(resolvedKey);
      if (motionIdx !== -1) {
        return { id: motionIdx, type: WordType.MOTION };
      }
      const objIdx = objNames.indexOf(resolvedKey);
      if (objIdx !== -1) {
        return { id: objIdx, type: WordType.OBJECT };
      }
      const actIdx = actionNames.indexOf(resolvedKey);
      // The reservoir magic word (PART) is excluded here: its vocabulary
      // entry is only a placeholder ("Z'ZZZ"). Only the seed-generated
      // zzword (checked below) should ever resolve to PART.
      if (actIdx !== -1 && actIdx !== C.PART) {
        return { id: actIdx, type: WordType.ACTION };
      }
    }

    // Check special zzword
    const store = useGameStore.getState();
    if (store.zzword && wordUpper === store.zzword) {
      return { id: C.PART, type: WordType.ACTION };
    }

    // Check numbers
    if (/^-?\d+$/.test(word)) {
      return { id: WORD_EMPTY, type: WordType.NUMERIC };
    }

    return { id: WORD_NOT_FOUND, type: WordType.NO_WORD_TYPE };
  };

  const w0 = parts[0] || '';
  const w1 = parts[1] || '';

  const meta0 = getVocabIdAndType(w0);
  const meta1 = getVocabIdAndType(w1);

  cmd.word[0] = { raw: w0, id: meta0.id, type: meta0.type };
  cmd.word[1] = { raw: w1, id: meta1.id, type: meta1.type };
}

// ── Core Entry Points ────────────────────────────────────────────────────────

export function initializeGame(): void {
  initIndexMappings();

  // Populate state arrays
  const locs = Array.from({ length: NLOCATIONS + 1 }, () => ({ abbrev: 0, atloc: 0 }));
  const dwarves = Array.from({ length: NDWARVES + 1 }, () => ({ seen: false, loc: 0, oldloc: 0 }));
  const objects = Array.from({ length: NOBJECTS + 1 }, () => ({ fixed: 0, prop: 0, place: 0 }));
  const hints = Array.from({ length: gameData.hints.length }, () => ({ used: false, lc: 0 }));
  const link = Array.from({ length: NOBJECTS * 2 + 1 }, () => 0);

  useGameStore.setState({
    locs,
    dwarves,
    objects,
    hints,
    link,
    turns: 0,
    numdie: 0,
    trnluz: 0,
    saved: 0,
    tally: 0,
    thresh: 0,
    detail: 0,
    abbnum: 5,
    chloc: C.LOC_MAZEEND12,
    chloc2: C.LOC_DEADEND13,
    loc: C.LOC_START,
    // The reference leaves oldloc/oldlc2 zero-initialised (LOC_NOWHERE) so
    // that "back" on the very first location reports NOT_CONNECTED.
    oldloc: LOC_NOWHERE,
    oldlc2: LOC_NOWHERE,
    newloc: C.LOC_START,
    dflag: 0,
    dkill: 0,
    dtotal: 0,
    foobar: 0,
    holdng: 0,
    igo: 0,
    iwest: 0,
    knfloc: 0,
    clock1: WARNTIME,
    clock2: FLASHTIME,
    clshnt: false,
    closed: false,
    closng: false,
    lmwarn: false,
    panic: false,
    wzdark: false,
    blooded: false,
    conds: 1 << 11,
    bonus: 0,
    zzword: '',
    seenbigwords: false,
    oldobj: 0,
    history: [],
    visitedRooms: [],
    savedCmd: null,
    skipHintTick: false,
    reincarnateMove: false,
    pendingQuery: {
      type: 'welcome'
    }
  });

  initialiseEngine();
  syncStoreStrings();

  // Display initial instructions greeting
  speak(gameData.arbitrary_messages['WELCOME_YOU'] as string);
}

export function processCommand(input: string): void {
  let store = useGameStore.getState();
  const rawInput = input.trim().toUpperCase();

  // A truly empty line at the command prompt: the reference input reader
  // (get_command_input) echoes an empty prompt and reads again without
  // taking a turn. A whitespace-only line is NOT empty - it becomes a
  // command with an empty word (later treated as an unknown motion).
  if (input === '' && !store.pendingQuery) {
    store.addMessage('> ');
    syncStoreStrings();
    return;
  }

  useGameStore.setState({ wzdark: isDarkHere() });

  let q = store.pendingQuery;
  const isFilenameQuery = q && (q.type === 'save_file' || q.type === 'resume_file');

  if (!q) {
    // At closing time, reveal any stashed objects being carried. The oyster
    // gets a special message; every carried not-found/stashed object is
    // re-stashified so it isn't re-described until dropped and re-taken.
    if (store.closed) {
      const oProp = store.objects[C.OYSTER].prop;
      if (oProp <= STATE_NOTFOUND && toting(C.OYSTER)) {
        pspeak(C.OYSTER, SpeakType.look, true, 1);
      }
      const objs = useGameStore.getState().objects.map(o => ({ ...o }));
      for (let i = 1; i <= NOBJECTS; i++) {
        if (toting(i) && objs[i].prop <= STATE_NOTFOUND) {
          objs[i].prop = -1 - objs[i].prop; // OBJECT_STASHIFY
        }
      }
      useGameStore.setState({ objects: objs });
    }

    // The command right after a hint interaction shares that turn's single
    // checkhints() call in the reference, so skip the tick exactly once.
    if (store.skipHintTick) {
      useGameStore.setState({ skipHintTick: false });
    } else {
      checkHints();
    }
    store = useGameStore.getState();
    q = store.pendingQuery;
  }

  if (!isFilenameQuery || process.env.NODE_ENV !== 'test') {
    store.addMessage(`> ${input}`);
  }

  // Handle pending async queries
  if (store.pendingQuery) {
    const q = store.pendingQuery;
    
    // Check if it's a yes/no query
    const isYesNoQuery = ['welcome', 'quit', 'hint', 'hint_confirm', 'dragon', 'croak', 'save_accept', 'resume_accept', 'clue'].includes(q.type);
    
    if (isYesNoQuery) {
      const isYes = rawInput === 'YES' || rawInput === 'Y';
      const isNo = rawInput === 'NO' || rawInput === 'N';
      
      if (!isYes && !isNo) {
        rspeak(C.PLEASE_ANSWER);
        if (q.type === 'welcome') {
          speak(gameData.arbitrary_messages['WELCOME_YOU'] as string);
        } else if (q.type === 'quit') {
          speak(gameData.arbitrary_messages['REALLY_QUIT'] as string);
        } else if (q.type === 'dragon') {
          // The dragon prompt uses silent_yes_or_no(): it does NOT re-print
          // the "With what? Your bare hands?" question on an invalid answer.
        } else if (q.type === 'croak') {
          const store = useGameStore.getState();
          const query = gameData.obituaries[store.numdie - 1]?.query;
          speak(query);
        } else if (q.type === 'hint') {
          speak(gameData.hints[q.hintIndex!].question);
        } else if (q.type === 'hint_confirm') {
          rspeak(C.WANT_HINT);
        } else if (q.type === 'save_accept' || q.type === 'resume_accept') {
          rspeak(C.THIS_ACCEPTABLE);
        } else if (q.type === 'clue') {
          rspeak(C.CLUE_QUERY);
        }
        syncStoreStrings();
        return;
      }
      
      useGameStore.setState({ pendingQuery: null });
      
      if (q.type === 'welcome') {
        if (isYes) {
          useGameStore.setState({ novice: true, limit: NOVICELIMIT });
          rspeak(C.CAVE_NEARBY);
        } else {
          useGameStore.setState({ novice: false, limit: GAMELIMIT });
        }
        describeLocation();
        listObjects();
        syncStoreStrings();
        return;
      }
      
      if (q.type === 'quit') {
        // yes_or_no(REALLY_QUIT, OK_MAN, OK_MAN): both responses are "OK".
        rspeak(C.OK_MAN);
        if (isYes) {
          terminate(Termination.quitgame);
        }
        syncStoreStrings();
        return;
      }

      if (q.type === 'clue') {
        // yes_or_no(CLUE_QUERY, WAYOUT_CLUE, OK_MAN): clshnt = (answer == yes).
        if (isYes) {
          useGameStore.setState({ clshnt: true });
          rspeak(C.WAYOUT_CLUE);
        } else {
          rspeak(C.OK_MAN);
        }
        syncStoreStrings();
        return;
      }
      
      if (q.type === 'hint') {
        const hintIdx = q.hintIndex!;
        if (isYes) {
          const hint = gameData.hints[hintIdx];
          rspeak(C.HINT_COST, hint.penalty, hint.penalty);
          useGameStore.setState({
            pendingQuery: {
              type: 'hint_confirm',
              hintIndex: hintIdx
            }
          });
          rspeak(C.WANT_HINT);
        } else {
          rspeak(C.OK_MAN);
          // Hint declined: the following command shares this turn's tick.
          useGameStore.setState({ skipHintTick: true });
        }
        syncStoreStrings();
        return;
      }

      if (q.type === 'hint_confirm') {
        const hintIdx = q.hintIndex!;
        if (isYes) {
          const hint = gameData.hints[hintIdx];
          const hints = store.hints.map(h => ({ ...h }));
          hints[hintIdx].used = true;
          
          let limit = store.limit;
          if (limit > WARNTIME) {
            limit += WARNTIME * hint.penalty;
          }
          useGameStore.setState({ hints, limit });
          speak(hint.hint);
        } else {
          rspeak(C.OK_MAN);
        }
        // Hint interaction finished: the following command shares this tick.
        useGameStore.setState({ skipHintTick: true });
        syncStoreStrings();
        return;
      }

      if (q.type === 'dragon') {
        if (isYes) {
          stateChange(C.DRAGON, 1); // DRAGON_DEAD = 1
          const objects = useGameStore.getState().objects.map(o => ({ ...o }));
          objects[C.RUG].prop = 0; // RUG_FLOOR = 0
          useGameStore.setState({ objects });
          move(C.DRAGON + NOBJECTS, -1); // IS_FIXED = -1
          move(C.RUG + NOBJECTS, 0); // IS_FREE = 0
          move(C.DRAGON, C.LOC_SECRET5);
          move(C.RUG, C.LOC_SECRET5);
          drop(C.BLOOD, C.LOC_SECRET5);
          
          const secret4 = locNames.indexOf('LOC_SECRET4');
          const secret6 = locNames.indexOf('LOC_SECRET6');
          const currentObjects = useGameStore.getState().objects;
          for (let i = 1; i <= NOBJECTS; i++) {
            if (currentObjects[i].place === secret4 || currentObjects[i].place === secret6) {
              move(i, C.LOC_SECRET5);
            }
          }
          useGameStore.setState({ newloc: C.LOC_SECRET5 });
          doMove();
          describeLocation();
          listObjects();
        } else {
          // Reference returns GO_MOVE here, so the location is re-described.
          rspeak(C.NASTY_DRAGON);
          doMove();
          describeLocation();
          listObjects();
        }
        syncStoreStrings();
        return;
      }

      if (q.type === 'croak') {
        // numdie has already been incremented in croak(); the reference
        // yes_or_no() prints the obituary's yes_response on "yes" or the
        // OK_MAN ("OK") no_response on "no".
        const NDEATHS = gameData.obituaries.length;
        if (!isYes) {
          rspeak(C.OK_MAN);
          terminate(Termination.endgame);
        }
        speak(gameData.obituaries[store.numdie - 1]?.yes_response);
        if (store.numdie === NDEATHS) {
          terminate(Termination.endgame);
        }
        if (isYes && store.numdie < 3) {
          const objects = useGameStore.getState().objects.map(o => ({ ...o }));
          objects[C.WATER].place = LOC_NOWHERE;
          objects[C.OIL].place = LOC_NOWHERE;
          if (toting(C.LAMP)) {
            objects[C.LAMP].prop = 0; // LAMP_DARK = 0
          }
          useGameStore.setState({ objects });

          // Drop in descending index order (as the reference does) so the
          // resulting atloc linked-list order matches.
          for (let i = NOBJECTS; i >= 1; i--) {
            if (toting(i)) {
              drop(i, i === C.LAMP ? C.LOC_START : store.oldlc2);
            }
          }

          useGameStore.setState({
            loc: C.LOC_BUILDING,
            oldloc: C.LOC_BUILDING,
            newloc: C.LOC_BUILDING,
          });

          // If the death happened outside do_move() (e.g. the troll bridge),
          // the reference runs a fresh do_move() after reincarnation. Deaths
          // that occurred inside do_move() already ran dwarfMove, so skip it.
          if (store.reincarnateMove) {
            if (!doMove()) {
              syncStoreStrings();
              return;
            }
          }
          describeLocation();
          listObjects();
        } else {
          terminate(Termination.endgame);
        }
        syncStoreStrings();
        return;
      }

      if (q.type === 'save_accept') {
        if (isYes) {
          rspeak(C.OK_MAN);
          useGameStore.setState({
            pendingQuery: {
              type: 'save_file'
            }
          });
          speakPrompt('File name: ');
        } else {
          rspeak(C.OK_MAN);
        }
        syncStoreStrings();
        return;
      }

      if (q.type === 'resume_accept') {
        if (isYes) {
          rspeak(C.OK_MAN);
          useGameStore.setState({
            pendingQuery: {
              type: 'resume_file'
            }
          });
          speakPrompt('File name: ');
        } else {
          rspeak(C.OK_MAN);
        }
        syncStoreStrings();
        return;
      }
    } else {
      // Filename queries: save_file or resume_file
      useGameStore.setState({ pendingQuery: null });

      const filename = input.trim();
      if (!filename) {
        speakPrompt('File name: ');
        useGameStore.setState({ pendingQuery: { type: q.type } });
        syncStoreStrings();
        return;
      }

      if (q.type === 'save_file') {
        // Save state to memory map
        const serialized = serializeGameState();
        saveFiles.set(filename, serialized);

        rspeak(C.RESUME_HELP);
        terminate(Termination.endgame);
      }

      if (q.type === 'resume_file') {
        let isLoaded = false;
        let stateToLoad: any = null;

        if (saveFiles.has(filename)) {
          const serialized = saveFiles.get(filename)!;
          stateToLoad = JSON.parse(serialized);
          isLoaded = true;
        } else if (typeof process !== 'undefined') {
          try {
            const fs = require('fs');
            const path = require('path');
            let filepath = filename;
            if (!fs.existsSync(filepath)) {
              filepath = path.resolve('/Users/christie/Repositories/games/adventure/open-adventure-source/tests', filename);
            }
            if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
              const buf = fs.readFileSync(filepath);
              stateToLoad = deserializeSaveFile(buf);
              if (!isValid(stateToLoad)) {
                rspeak(C.SAVE_TAMPERING);
                terminate(Termination.quitgame);
              }
              isLoaded = true;
            }
          } catch (e: any) {
            if (e instanceof Error) {
              if (e.message === 'BAD_SAVE') {
                rspeak(C.BAD_SAVE);
                playerMove(C.NUL);
                describeLocation();
                listObjects();
                syncStoreStrings();
                return;
              } else if (e.message === 'VERSION_SKEW') {
                const fileVer = (e as any).version || 0;
                rspeak(C.VERSION_SKEW, Math.trunc(fileVer / 10), fileVer % 10, 3, 1);
                playerMove(C.NUL);
                describeLocation();
                listObjects();
                syncStoreStrings();
                return;
              } else if (e.message === 'SAVE_TAMPERING') {
                rspeak(C.SAVE_TAMPERING);
                terminate(Termination.quitgame);
              }
            }
          }
        }

        if (!isLoaded) {
          speak(`Can't open file ${filename}, try again.`);
          speakPrompt('File name: ');
          useGameStore.setState({ pendingQuery: { type: 'resume_file' } });
          syncStoreStrings();
          return;
        }

        // Resume state
        useGameStore.setState(stateToLoad);
        playerMove(C.NUL);
        describeLocation();
        listObjects();
      }

      syncStoreStrings();
      return;
    }
  }
  


  // The reference rejects commands with more than two words before taking a
  // turn, re-prompting instead.
  if (input.trim().split(/\s+/).filter(Boolean).length > 2) {
    rspeak(C.TWO_WORDS);
    syncStoreStrings();
    return;
  }

  // Parse command token structure
  const cmd = {
    verb: 0,
    part: 0, // SpeechPart.unknown = 0
    obj: 0,
    word: [
      { raw: '', id: 0, type: WordType.NO_WORD_TYPE },
      { raw: '', id: 0, type: WordType.NO_WORD_TYPE }
    ]
  };

  tokenize(input, cmd);

  // If the previous command ended awaiting a verb or object (GO_UNKNOWN /
  // GO_CHECKHINT), carry its verb/obj so a bare follow-up word completes it.
  const carried = store.savedCmd;
  if (carried) {
    cmd.verb = carried.verb;
    cmd.obj = carried.obj;
    useGameStore.setState({ savedCmd: null });
  }

  // Magic word foobar reset checking
  useGameStore.setState({
    foobar: store.foobar > 0 ? -store.foobar : 0
  });

  useGameStore.setState({ turns: store.turns + 1 });
  
  if (!preprocessCommand(cmd)) {
    syncStoreStrings();
    return;
  }

  if (closeCheck()) {
    // The cave has just closed: the reference describes the new location
    // (the repository) at the top of the next turn, before any prompt.
    describeLocation();
    listObjects();
    syncStoreStrings();
    return;
  }

  // Execute turn action
  try {
    let phase = GO_CLEAROBJ;
    let loopCount = 0;
    while (loopCount < 10) {
      if (cmd.word[0].id === WORD_NOT_FOUND) {
        rspeak(C.DONT_KNOW, cmd.word[0].raw);
        phase = GO_CLEAROBJ;
        break;
      }

      // Give the user hints about single-letter shortcuts.
      const raw0 = (cmd.word[0].raw || '').toLowerCase();
      if (raw0 === 'west') {
        const iwest = useGameStore.getState().iwest + 1;
        useGameStore.setState({ iwest });
        if (iwest === 10) rspeak(C.W_IS_WEST);
      }
      if (raw0 === 'go' && cmd.word[1].id !== WORD_EMPTY) {
        const igo = useGameStore.getState().igo + 1;
        useGameStore.setState({ igo });
        if (igo === 10) rspeak(C.GO_UNNEEDED);
      }

      if (cmd.word[0].type === WordType.MOTION) {
        playerMove(cmd.word[0].id);
        phase = GO_TERMINATE;
      } else if (cmd.word[0].type === WordType.OBJECT) {
        cmd.part = 0; // SpeechPart.unknown
        cmd.obj = cmd.word[0].id;
        phase = action(cmd);
      } else if (cmd.word[0].type === WordType.ACTION) {
        cmd.verb = cmd.word[0].id;
        if (cmd.word[1].type === WordType.NUMERIC) {
          cmd.part = 2; // SpeechPart.transitive
        } else {
          cmd.part = 1; // SpeechPart.intransitive
        }
        phase = action(cmd);
      } else if (cmd.word[0].type === WordType.NUMERIC) {
        // A bare number is not understood (outside of oldstyle mode).
        rspeak(C.DONT_KNOW, cmd.word[0].raw);
        phase = GO_CLEAROBJ;
        break;
      }

      if (phase === GO_MOVE) {
        playerMove(C.NUL);
        phase = GO_TERMINATE;
      }

      if (phase === GO_WORD2) {
        // Shift the second word into the first slot and re-dispatch.
        // NOTE: the reference does NOT re-run preprocess here (command
        // state stays PREPROCESSED), so object->motion rewrites such as
        // GRATE->ENTER must not be reapplied.
        cmd.word[0] = cmd.word[1];
        cmd.word[1] = { raw: '', id: WORD_EMPTY, type: WordType.NO_WORD_TYPE };
        loopCount++;
        continue;
      }

      break;
    }

    if (phase === GO_UNKNOWN) {
      const word0Raw = cmd.word[0].raw;
      const formatted = word0Raw.charAt(0).toUpperCase() + word0Raw.slice(1);
      rspeak(C.DO_WHAT, formatted);
      cmd.obj = 0; // NO_OBJECT
      // Keep the verb so a bare object on the next line completes it.
      useGameStore.setState({ savedCmd: { verb: cmd.verb, obj: 0 } });
      phase = GO_CLEAROBJ;
    }

    if (phase === GO_CHECKHINT) {
      // WHAT_DO: keep verb/obj so the next word can complete the command.
      useGameStore.setState({ savedCmd: { verb: cmd.verb, obj: cmd.obj } });
    }

    if (phase === GO_DWARFWAKE) {
      rspeak(C.DWARVES_AWAKEN);
      terminate(Termination.endgame);
    }

    // A query may have been raised mid-turn (e.g. reincarnation after the
    // troll bridge collapses under the bear). Stop and wait for the answer
    // instead of continuing to move/describe.
    if (useGameStore.getState().pendingQuery) {
      syncStoreStrings();
      return;
    }

    const executed = (phase === GO_TERMINATE);

    if (executed) {
      if (!doMove()) {
        syncStoreStrings();
        return;
      }

      // Loop while the new location is forced (empty travel verbs)
      while (isForced(useGameStore.getState().loc)) {
        describeLocation();
        listObjects();

        playerMove(motionNames.indexOf('HERE'));
        if (!doMove()) {
          syncStoreStrings();
          return;
        }
      }

      describeLocation();
      listObjects();
    } else if (phase === GO_TOP) {
      describeLocation();
      listObjects();
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'GAME_TERMINATED') {
      // The game ended mid-turn (blast, dwarves waking, etc.). Flush the
      // final output and propagate so the caller ends the game, exactly as
      // the quit/reincarnation paths already do.
      syncStoreStrings();
      throw error;
    }
    throw error;
  } finally {
    // The reference records the just-completed command's object in
    // clear_command(); some hints (e.g. the bird hint) depend on it.
    useGameStore.setState({ oldobj: cmd.obj });
  }

  syncStoreStrings();
}

function playerMove(motion: number): void {
  const store = useGameStore.getState();
  const currentLocId = locNames[store.loc];
  const locData = gameData.locations[currentLocId];
  if (!locData) return;

  let newloc = store.loc;

  if (motion === C.NUL) return;

  if (motion === C.BACK) {
    let target = store.oldloc;
    if (isForced(target)) {
      target = store.oldlc2;
    }
    useGameStore.setState({
      oldlc2: store.oldloc,
      oldloc: store.loc,
    });
    
    if (tstbit(store.loc, 4)) { // COND_NOBACK = 4
      rspeak(C.TWIST_TURN);
      return;
    }
    if (target === store.loc) {
      rspeak(C.FORGOT_PATH);
      return;
    }
    
    const currentRules = locData.travel || [];
    let matchedRuleIndex = -1;
    let fallbackRuleIndex = -1;
    
    for (let i = 0; i < currentRules.length; i++) {
      const rule = currentRules[i];
      const [actionType, destId] = rule.action;
      if (actionType === 'goto') {
        const destIdx = locNames.indexOf(destId as string);
        if (destIdx === target) {
          matchedRuleIndex = i;
          break;
        }
        if (isForced(destIdx)) {
          const nextRules = gameData.locations[destId as string].travel || [];
          if (nextRules.length > 0 && nextRules[0].action[0] === 'goto') {
            const nextDestIdx = locNames.indexOf(nextRules[0].action[1] as string);
            if (nextDestIdx === target) {
              fallbackRuleIndex = i;
            }
          }
        }
      }
    }
    
    let finalRuleIndex = matchedRuleIndex !== -1 ? matchedRuleIndex : fallbackRuleIndex;
    if (finalRuleIndex === -1) {
      rspeak(C.NOT_CONNECTED);
      return;
    }
    
    const rule = currentRules[finalRuleIndex];
    if (rule.verbs.length > 0) {
      const resolvedMotionName = rule.verbs[0];
      motion = motionNames.indexOf(resolvedMotionName);
    } else {
      rspeak(C.NOT_CONNECTED);
      return;
    }
  } else if (motion === C.LOOK) {
    if (store.detail < 3) {
      rspeak(C.NO_MORE_DETAIL);
    }
    useGameStore.setState({ detail: store.detail + 1, wzdark: false });
    const locs = store.locs.map(l => ({ ...l }));
    locs[store.loc].abbrev = 0;
    useGameStore.setState({ locs });
    return;
  } else if (motion === C.CAVE) {
    const isOut = tstbit(store.loc, 5) || tstbit(store.loc, 7); // ABOVE or FOREST
    rspeak((isOut && store.loc !== C.LOC_GRATE) ? C.FOLLOW_STREAM : C.NEED_DETAIL);
    return;
  } else {
    useGameStore.setState({ oldlc2: store.oldloc, oldloc: store.loc });
  }

  // Normal travel matching
  const currentRules = locData.travel || [];
  let foundRule = false;
  let startIdx = -1;
  const motionName = motionNames[motion];
  for (let i = 0; i < currentRules.length; i++) {
    if (currentRules[i].verbs.includes(motionName) || (motionName === 'HERE' && currentRules[i].verbs.length === 0)) {
      startIdx = i;
      break;
    }
  }

  if (startIdx !== -1) {
    foundRule = true;
    for (let i = startIdx; i < currentRules.length; i++) {
      const rule = currentRules[i];
      if (rule.condition) {
        if (!checkCondition(rule.condition)) {
          continue;
        }
      }
      
      const [actionType, target] = rule.action;
      if (actionType === 'goto') {
        useGameStore.setState({ newloc: locNames.indexOf(target as string) });
        return;
      }
      if (actionType === 'speak') {
        const msgIdx = msgNames.indexOf(target as string);
        rspeak(msgIdx);
        useGameStore.setState({ newloc: store.loc });
        return;
      }
      if (actionType === 'special') {
        const specialIdx = target as number;
        if (specialIdx === 1) {
          let nextLoc = store.loc === C.LOC_PLOVER ? C.LOC_ALCOVE : C.LOC_PLOVER;
          if (store.holdng > 1 || (store.holdng === 1 && !toting(C.EMERALD))) {
            newloc = store.loc;
            rspeak(C.MUST_DROP);
          } else {
            newloc = nextLoc;
          }
          useGameStore.setState({ newloc });
          return;
        }
        if (specialIdx === 2) {
          drop(C.EMERALD, store.loc);
          continue;
        }
        if (specialIdx === 3) {
          const objects = useGameStore.getState().objects.map(o => ({ ...o }));
          if (objects[C.TROLL].prop === 1) { // TROLL_PAIDONCE
            pspeak(C.TROLL, SpeakType.look, true, 1);
            objects[C.TROLL].prop = 0; // TROLL_UNPAID
            useGameStore.setState({ objects });
            destroy(C.TROLL2);
            move(C.TROLL2 + NOBJECTS, 0); // IS_FREE = 0
            const chLocs = getPlacAndFixd(C.TROLL);
            move(C.TROLL, chLocs.plac);
            move(C.TROLL + NOBJECTS, chLocs.fixd);
            juggle(C.CHASM);
            useGameStore.setState({ newloc: store.loc });
            return;
          } else {
            const chLocs = getPlacAndFixd(C.TROLL);
            newloc = chLocs.plac + chLocs.fixd - store.loc;
            if (objects[C.TROLL].prop === 0) { // TROLL_UNPAID
              objects[C.TROLL].prop = 1; // TROLL_PAIDONCE
            }
            useGameStore.setState({ objects });
            if (!toting(C.BEAR)) {
              useGameStore.setState({ newloc });
              return;
            }
            stateChange(C.CHASM, 1); // BRIDGE_WRECKED = 1
            {
              const o = useGameStore.getState().objects.map(oo => ({ ...oo }));
              o[C.TROLL].prop = 2; // TROLL_GONE = 2
              useGameStore.setState({ objects: o });
            }
            drop(C.BEAR, newloc);
            // Re-read after drop() so its link/place bookkeeping isn't clobbered.
            {
              const o = useGameStore.getState().objects.map(oo => ({ ...oo }));
              o[C.BEAR].fixed = -1; // IS_FIXED
              o[C.BEAR].prop = 3; // BEAR_DEAD
              useGameStore.setState({ objects: o, oldlc2: newloc });
            }
            croak();
            return;
          }
        }
      }
    }
  }

  if (!foundRule) {
    switch (motion) {
      case C.EAST:
      case C.WEST:
      case C.SOUTH:
      case C.NORTH:
      case C.NE:
      case C.NW:
      case C.SW:
      case C.SE:
      case C.UP:
      case C.DOWN:
        rspeak(C.BAD_DIRECTION);
        break;
      case C.FORWARD:
      case C.LEFT:
      case C.RIGHT:
        rspeak(C.UNSURE_FACING);
        break;
      case C.OUTSIDE:
      case C.INSIDE:
        rspeak(C.NO_INOUT_HERE);
        break;
      case C.XYZZY:
      case C.PLUGH:
        rspeak(C.NOTHING_HAPPENS);
        break;
      case C.CRAWL:
        rspeak(C.WHICH_WAY);
        break;
      default:
        rspeak(C.CANT_APPLY);
    }
  }
}

function checkCondition(cond: TravelCondition): boolean {
  const store = useGameStore.getState();
  const type = cond[0];
  if (type === 'nodwarves') {
    randrange(100);
    return true;
  }
  if (type === 'pct') {
    const pct = cond[1] as number;
    return randrange(100) < pct;
  }
  if (type === 'carry') {
    const objId = cond[1] as string;
    const objIdx = objNames.indexOf(objId);
    const result = toting(objIdx);
    return result;
  }
  if (type === 'with') {
    const objId = cond[1] as string;
    const objIdx = objNames.indexOf(objId);
    return here(objIdx);
  }
  if (type === 'not') {
    const objId = cond[1] as string;
    const stateVal = cond[2];
    const objIdx = objNames.indexOf(objId);
    
    let targetState = 0;
    if (typeof stateVal === 'number') {
      targetState = stateVal;
    } else {
      const states = gameData.objects[objId]?.states || [];
      targetState = states.indexOf(stateVal as string);
      if (targetState === -1) {
        targetState = 0;
      }
    }
    
    return store.objects[objIdx].prop !== targetState;
  }
  return false;
}

export enum WordType {
  NO_WORD_TYPE = 0,
  MOTION = 1,
  OBJECT = 2,
  ACTION = 3,
  NUMERIC = 4
}

function speakPrompt(msg: string): void {
  if (process.env.NODE_ENV !== 'test') {
    speak(msg);
  }
}

function deserializeSaveFile(buffer: Buffer) {
  const magic = buffer.toString('utf8', 0, 15);
  if (!magic.startsWith('open-adventure\n')) {
    throw new Error('BAD_SAVE');
  }
  const version = buffer.readInt32LE(16);
  if (version !== 31) {
    const err = new Error('VERSION_SKEW');
    (err as any).version = version;
    throw err;
  }
  const canary = buffer.readInt32LE(20);
  if (canary !== 2317) {
    throw new Error('BAD_SAVE');
  }

  const gOffset = 24;
  const readInt = (offset: number) => buffer.readInt32LE(gOffset + offset);
  const readBool = (offset: number) => buffer.readInt32LE(gOffset + offset) !== 0;

  const lcg_x = readInt(0);
  const abbnum = readInt(4);
  const bonus = readInt(8);
  const chloc = readInt(12);
  const chloc2 = readInt(16);
  const clock1 = readInt(20);
  const clock2 = readInt(24);
  const clshnt = readBool(28);
  const closed = readBool(32);
  const closng = readBool(36);
  const lmwarn = readBool(40);
  const novice = readBool(44);
  const panic = readBool(48);
  const wzdark = readBool(52);
  const blooded = readBool(56);
  const conds = readInt(60);
  const detail = readInt(64);
  const dflag = readInt(68);
  const dkill = readInt(72);
  const dtotal = readInt(76);
  const foobar = readInt(80);
  const holdng = readInt(84);
  const igo = readInt(88);
  const iwest = readInt(92);
  const knfloc = readInt(96);
  const limit = readInt(100);
  const loc = readInt(104);
  const newloc = readInt(108);
  const numdie = readInt(112);
  const oldloc = readInt(116);
  const oldlc2 = readInt(120);
  const oldobj = readInt(124);
  const saved = readInt(128);
  const tally = readInt(132);
  const thresh = readInt(136);
  const seenbigwords = readBool(140);
  const trnluz = readInt(144);
  const turns = readInt(148);

  let zzword = '';
  for (let i = 0; i < 5; i++) {
    const charCode = buffer[gOffset + 152 + i];
    if (charCode === 0) break;
    zzword += String.fromCharCode(charCode);
  }

  const locs: { abbrev: number; atloc: number }[] = [];
  let offset = 160;
  for (let i = 0; i < 185; i++) {
    locs.push({
      abbrev: readInt(offset),
      atloc: readInt(offset + 4),
    });
    offset += 8;
  }

  const dwarves: { seen: boolean; loc: number; oldloc: number }[] = [];
  offset = 1640;
  for (let i = 0; i < 7; i++) {
    dwarves.push({
      seen: readBool(offset),
      loc: readInt(offset + 4),
      oldloc: readInt(offset + 8),
    });
    offset += 12;
  }

  const objects: { fixed: number; prop: number; place: number }[] = [];
  offset = 1724;
  for (let i = 0; i < 70; i++) {
    objects.push({
      fixed: readInt(offset),
      prop: readInt(offset + 4),
      place: readInt(offset + 8),
    });
    offset += 12;
  }

  const hints: { used: boolean; lc: number }[] = [];
  offset = 2564;
  for (let i = 0; i < 10; i++) {
    hints.push({
      used: readBool(offset),
      lc: readInt(offset + 4),
    });
    offset += 8;
  }

  const link: number[] = [];
  offset = 2644;
  for (let i = 0; i < 139; i++) {
    link.push(readInt(offset));
    offset += 4;
  }

  return {
    lcg_x, abbnum, bonus, chloc, chloc2, clock1, clock2, clshnt, closed, closng,
    lmwarn, novice, panic, wzdark, blooded, conds, detail, dflag, dkill, dtotal,
    foobar, holdng, igo, iwest, knfloc, limit, loc, newloc, numdie, oldloc,
    oldlc2, oldobj, saved, tally, thresh, seenbigwords, trnluz, turns, zzword,
    locs, dwarves, objects, hints, link
  };
}

function isValid(valgame: any): boolean {
  if (valgame.abbnum === 0) return false;
  if (valgame.lcg_x >= LCG_M) return false;
  
  if (valgame.chloc < -1 || valgame.chloc > NLOCATIONS ||
      valgame.chloc2 < -1 || valgame.chloc2 > NLOCATIONS ||
      valgame.loc < 0 || valgame.loc > NLOCATIONS || 
      valgame.newloc < 0 || valgame.newloc > NLOCATIONS || 
      valgame.oldloc < 0 || valgame.oldloc > NLOCATIONS || 
      valgame.oldlc2 < 0 || valgame.oldlc2 > NLOCATIONS) {
    return false;
  }
  
  for (let i = 0; i <= NDWARVES; i++) {
    if (valgame.dwarves[i].loc < -1 || valgame.dwarves[i].loc > NLOCATIONS ||
        valgame.dwarves[i].oldloc < -1 || valgame.dwarves[i].oldloc > NLOCATIONS) {
      return false;
    }
  }
  
  for (let i = 0; i <= NOBJECTS; i++) {
    if (valgame.objects[i].place < -1 || valgame.objects[i].place > NLOCATIONS ||
        valgame.objects[i].fixed < -1 || valgame.objects[i].fixed > NLOCATIONS) {
      return false;
    }
  }
  
  if (valgame.dtotal < 0 || valgame.dtotal > NDWARVES ||
      valgame.dkill < 0 || valgame.dkill > NDWARVES) {
    return false;
  }
  
  if (valgame.numdie >= 3) {
    return false;
  }
  
  let temp_tally = 0;
  for (let treasure = 1; treasure <= NOBJECTS; treasure++) {
    const objName = objNames[treasure];
    const isTreasure = gameData.objects[objName]?.treasure;
    if (isTreasure) {
      if (valgame.objects[treasure].prop === -1) {
        temp_tally++;
      }
    }
  }
  if (temp_tally !== valgame.tally) {
    return false;
  }
  
  for (let obj = 0; obj <= NOBJECTS; obj++) {
    const prop = valgame.objects[obj].prop;
    if (prop < -4 || prop > 3) {
      return false;
    }
  }
  
  return true;
}

export function handleEOF(): void {
  const store = useGameStore.getState();
  const q = store.pendingQuery;
  
  if (q) {
    if (q.type === 'save_file' || q.type === 'resume_file') {
      speak('File name: ');
      useGameStore.setState({ pendingQuery: null });
      describeLocation();
      listObjects();
      speak('> ');
    } else {
      speak('> ');
    }
  } else {
    speak('> ');
  }
  
  terminate(Termination.quitgame);
}
