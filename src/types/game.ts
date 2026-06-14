export interface Words {
  words: string[] | null;
  oldstyle?: boolean;
}

export interface Motion extends Words {}

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

export interface TravelRule {
  verbs: string[];
  action: [string, string | number];
  condition?: any[]; // Simplified for now, will refine as needed
}

export interface Location {
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
  locations: Record<string, Location>;
  objects: Record<string, ObjectData>;
  arbitrary_messages: Record<string, string | string[]>;
  dwarflocs: string[];
  classes: any[];
  turn_thresholds: Record<string, string>;
  obituaries: string[];
}
