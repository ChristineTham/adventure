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

const initialState = {
  currentLocation: '',
  inventory: [],
  objectLocations: {},
  objectStates: {},
  history: [],
  flags: {},
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setLocation: (location) => set({ currentLocation: location }),
  
  setObjectLocation: (objectId, locationId) =>
    set((state) => ({ objectLocations: { ...state.objectLocations, [objectId]: locationId } })),
  
  setObjectState: (objectId, state) =>
    set((s) => ({ objectStates: { ...s.objectStates, [objectId]: state } })),
  
  addToInventory: (item) => 
    set((state) => ({ inventory: [...state.inventory, item] })),
    
  removeFromInventory: (item) =>
    set((state) => ({ inventory: state.inventory.filter((i) => i !== item) })),
    
  addMessage: (message) =>
    set((state) => ({ history: [...state.history, message] })),
    
  setFlag: (flag, value) =>
    set((state) => ({ flags: { ...state.flags, [flag]: value } })),
    
  reset: () => set(initialState),
}));
