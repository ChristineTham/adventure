export interface Words {
  words: string[] | null;
  oldstyle?: boolean;
}

export type Motion = Words;

export interface Action extends Words {
  message?: string;
}

export interface Hint {
  name: string;
  number: number;
  turns: number;
  penalty: number;
  question: string;
  hint: string;
}

export type TravelCondition = 
  | ['pct', number]
  | ['carry', string]
  | ['with', string]
  | ['not', string, string | number]
  | ['nodwarves'];

export interface TravelRule {
  verbs: string[];
  action: [string, string | number];
  condition?: TravelCondition; 
}

export interface PlayerClass {
  threshold: number;
  message: string;
}

export interface GameLocation {
  description: {
    long: string | null;
    short: string | null;
    maptag?: string | null;
  };
  conditions: Record<string, boolean | number>;
  travel: TravelRule[];
  hints?: string[]; // References to hint tags
  sound?: string;
  loud?: boolean;
}

export interface ObjectData {
  inventory: string;
  words: string[];
  states?: string[];
  descriptions: string[];
  changes?: string[];
  treasure?: boolean;
  immovable?: boolean;
  locations?: string[];
}

export interface GameData {
  motions: Record<string, Motion>;
  actions: Record<string, Action>;
  hints: Hint[];
  locations: Record<string, GameLocation>;
  objects: Record<string, ObjectData>;
  arbitrary_messages: Record<string, string | string[]>;
  dwarflocs: string[];
  classes: PlayerClass[];
  turn_thresholds: Record<string, string>;
  obituaries: string[];
  vocabulary: Record<string, string>;
}
