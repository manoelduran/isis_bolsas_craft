import { createContext, useState, useMemo, type ReactNode } from 'react';
import { initialMaterialsState } from '@/lib/formStructure';
import { produce } from 'immer';
import type { MaterialsState } from '@/types';

interface RawMaterialContextType {
  materialsState: MaterialsState;
  updateMaterialCosts: (costs: { id: string; cost: number; unity?: string }[]) => void;
  areCostsLoaded: boolean;
}

export const RawMaterialContext = createContext<RawMaterialContextType | undefined>(undefined);

export const RawMaterialProvider = ({ children }: { children: ReactNode }) => {
  const [materialsState, setMaterialsState] = useState<MaterialsState>(initialMaterialsState);

  const areCostsLoaded = useMemo(() => {
    return Object.values(materialsState).some(category => 
      Object.values(category).some(item => (item as { cost: number }).cost > 0)
    );
  }, [materialsState]);

  const updateMaterialCosts = (costs: { id: string; cost: number; unity?: string }[]) => {
    const costMap = new Map(costs.map(c => [c.id, { cost: c.cost, unity: c.unity }]));

    const newState = produce(materialsState, draft => {
      costMap.forEach(({ cost, unity }, id) => {
        for (const category of Object.keys(draft) as Array<keyof MaterialsState>) {
          if (draft[category][id]) {
            draft[category][id].cost = cost;
            if (unity) draft[category][id].unity = unity;
          }
        }
      });
    });
    setMaterialsState(newState);
  };

  return (
    <RawMaterialContext.Provider value={{ materialsState, updateMaterialCosts: updateMaterialCosts, areCostsLoaded }}>
      {children}
    </RawMaterialContext.Provider>
  );
};