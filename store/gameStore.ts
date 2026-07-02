import { create } from 'zustand';

export interface DwarfState {
  seen: boolean;
  loc: number;
  oldloc: number;
}

export interface ObjectState {
  fixed: number;
  prop: number;
  place: number;
}

export interface HintState {
  used: boolean;
  lc: number;
}

export interface LocState {
  abbrev: number;
  atloc: number;
}

interface GameState {
  // Classic C state variables
  lcg_x: number;
  turns: number;
  limit: number;
  novice: boolean;
  numdie: number;
  trnluz: number;
  saved: number;
  tally: number;
  thresh: number;
  detail: number;
  abbnum: number;
  chloc: number;
  chloc2: number;
  
  loc: number;
  oldloc: number;
  oldlc2: number;
  newloc: number;
  
  dflag: number;
  dkill: number;
  dtotal: number;
  foobar: number;
  holdng: number;
  igo: number;
  iwest: number;
  knfloc: number;
  
  clock1: number;
  clock2: number;
  clshnt: boolean;
  closed: boolean;
  closng: boolean;
  lmwarn: boolean;
  panic: boolean;
  wzdark: boolean;
  blooded: boolean;
  conds: number;
  bonus: number; // enum scorebonus
  zzword: string;
  seenbigwords: boolean;
  oldobj: number;
  
  // Classic state arrays
  locs: LocState[];
  dwarves: DwarfState[];
  objects: ObjectState[];
  hints: HintState[];
  link: number[];

  // Reactive properties for the UI
  currentLocation: string;
  inventory: string[];
  objectLocations: Record<string, string>; // Maps objectId -> locationId
  objectStates: Record<string, number>; // Maps objectId -> state
  history: string[];
  flags: Record<string, boolean | number>;
  score: number;
  visitedRooms: string[];
  pendingQuery: {
    type: string; // 'welcome' | 'quit' | 'hint' | 'dragon' | 'croak'
    hintIndex?: number;
  } | null;
  // A command that ended in GO_UNKNOWN/GO_CHECKHINT keeps its verb/obj so
  // the next bare word can complete it (e.g. "get" then "food").
  savedCmd: { verb: number; obj: number } | null;
  // In the reference, a hint offer and the command read afterwards share a
  // single checkhints() call. Because our hint Q&A is asynchronous, we must
  // skip the hint tick on the command immediately following a hint answer.
  skipHintTick: boolean;
  // True when a death occurred outside of do_move() (e.g. the troll bridge
  // collapse): the reference then runs an extra do_move()/dwarfMove after the
  // reincarnation, which we must replicate to keep the RNG in sync.
  reincarnateMove: boolean;
  
  // Actions
  setLocation: (location: string) => void;
  setObjectLocation: (objectId: string, locationId: string) => void;
  setObjectState: (objectId: string, state: number) => void;
  addToInventory: (item: string) => void;
  removeFromInventory: (item: string) => void;
  addMessage: (message: string) => void;
  setFlag: (flag: string, value: boolean | number) => void;
  setScore: (score: number) => void;
  reset: () => void;
}

const initialState: Omit<GameState, 'setLocation' | 'setObjectLocation' | 'setObjectState' | 'addToInventory' | 'removeFromInventory' | 'addMessage' | 'setFlag' | 'setScore' | 'reset'> = {
  lcg_x: 0,
  turns: 0,
  limit: 0,
  novice: false,
  numdie: 0,
  trnluz: 0,
  saved: 0,
  tally: 0,
  thresh: 0,
  detail: 0,
  abbnum: 5,
  chloc: 0,
  chloc2: 0,
  loc: 0,
  oldloc: 0,
  oldlc2: 0,
  newloc: 0,
  dflag: 0,
  dkill: 0,
  dtotal: 0,
  foobar: 0,
  holdng: 0,
  igo: 0,
  iwest: 0,
  knfloc: 0,
  clock1: 0,
  clock2: 0,
  clshnt: false,
  closed: false,
  closng: false,
  lmwarn: false,
  panic: false,
  wzdark: false,
  blooded: false,
  conds: 0,
  bonus: 0,
  zzword: '',
  seenbigwords: false,
  oldobj: 0,
  locs: [],
  dwarves: [],
  objects: [],
  hints: [],
  link: [],
  
  currentLocation: '',
  inventory: [],
  objectLocations: {},
  objectStates: {},
  history: [],
  flags: {},
  score: 0,
  visitedRooms: [],
  pendingQuery: null,
  savedCmd: null,
  skipHintTick: false,
  reincarnateMove: false,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setLocation: (location: string): void => 
    set((state: GameState) => ({ 
      currentLocation: location, 
      visitedRooms: state.visitedRooms.includes(location) 
        ? state.visitedRooms 
        : [...state.visitedRooms, location] 
    })),
  
  setObjectLocation: (objectId: string, locationId: string): void =>
    set((state: GameState) => ({ objectLocations: { ...state.objectLocations, [objectId]: locationId } })),
  
  setObjectState: (objectId: string, state: number): void =>
    set((s: GameState) => ({ objectStates: { ...s.objectStates, [objectId]: state } })),
  
  addToInventory: (item: string): void => 
    set((state: GameState) => ({ inventory: [...state.inventory, item] })),
    
  removeFromInventory: (item: string): void =>
    set((state: GameState) => ({ inventory: state.inventory.filter((i: string) => i !== item) })),
    
  addMessage: (message: string): void =>
    set((state: GameState) => ({ history: [...state.history, message] })),
    
  setFlag: (flag: string, value: boolean | number): void =>
    set((state: GameState) => ({ flags: { ...state.flags, [flag]: value } })),

  setScore: (score: number): void => set({ score }),
    
  reset: (): void => set(initialState),
}));
