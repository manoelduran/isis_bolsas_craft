
import { createContext, useState, useMemo, type ReactNode } from 'react';
import { initialCraftState } from '@/lib/formStructure';
import { produce } from 'immer'; // immer ajuda a atualizar estados aninhados facilmente
import type { CraftingFormState } from '@/types';

interface RawMaterialContextType {
  craftState: CraftingFormState;
  updateMaterialCosts: (costs: { id: string; cost: number; unity?: string }[]) => void;
  areCostsLoaded: boolean;
}

export const RawMaterialContext = createContext<RawMaterialContextType | undefined>(undefined);

export const RawMaterialProvider = ({ children }: { children: ReactNode }) => {
  const [craftState, setCraftState] = useState<CraftingFormState>(initialCraftState);

  const areCostsLoaded = useMemo(() => {
    return Object.values(craftState).some(category => 
      Object.values(category).some(item => (item as { cost: number }).cost > 0)
    );
  }, [craftState]);

  const updateMaterialCosts = (costs: { id: string; cost: number; unity?: string }[]) => {
    const costMap = new Map(costs.map(c => [c.id, { cost: c.cost, unity: c.unity }]));

    const newState = produce(craftState, draft => {
      costMap.forEach(({ cost, unity }, id) => {
        for (const category of Object.keys(draft) as Array<keyof CraftingFormState>) {
          if (draft[category][id]) {
            draft[category][id].cost = cost;
            if (unity) {
              draft[category][id].unity = unity;
            }
          }
        }
      });
    });

    setCraftState(newState);
  };

  return (
    <RawMaterialContext.Provider value={{ craftState, updateMaterialCosts, areCostsLoaded }}>
      {children}
    </RawMaterialContext.Provider>
  );
};