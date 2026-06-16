import { create } from 'zustand';

interface GameState {
  currentLocation: string;
  inventory: string[];
  objectLocations: Record<string, string>; // Maps objectId -> locationId
  objectStates: Record<string, number>; // Maps objectId -> state (0-indexed)
  history: string[];
  flags: Record<string, boolean | number>;
  
  // Actions
  setLocation: (location: string) => void;
  setObjectLocation: (objectId: string, locationId: string) => void;
  setObjectState: (objectId: string, state: number) => void;
  addToInventory: (item: string) => void;
  removeFromInventory: (item: string) => void;
  addMessage: (message: string) => void;
  setFlag: (flag: string, value: boolean | number) => void;
  reset: () => void;
}

const initialState: Pick<GameState, 'currentLocation' | 'inventory' | 'objectLocations' | 'objectStates' | 'history' | 'flags'> = {
  currentLocation: '',
  inventory: [],
  objectLocations: {},
  objectStates: {},
  history: [],
  flags: {},
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setLocation: (location: string): void => set({ currentLocation: location }),
  
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
    
  reset: (): void => set(initialState),
}));
