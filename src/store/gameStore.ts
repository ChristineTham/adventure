import { create } from 'zustand';

interface GameState {
  currentLocation: string;
  inventory: string[];
  history: string[];
  flags: Record<string, boolean | number>;
  
  // Actions
  setLocation: (location: string) => void;
  addToInventory: (item: string) => void;
  removeFromInventory: (item: string) => void;
  addMessage: (message: string) => void;
  setFlag: (flag: string, value: boolean | number) => void;
  reset: () => void;
}

const initialState = {
  currentLocation: '',
  inventory: [],
  history: [],
  flags: {},
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  setLocation: (location) => set({ currentLocation: location }),
  
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
