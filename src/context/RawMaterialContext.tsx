import { createContext, useState, useMemo, type ReactNode } from 'react';
import { initialMaterialsState } from '@/lib/formStructure';
import { produce } from 'immer';
import type { MaterialsState } from '@/types';

interface RawMaterialContextType {
  materialsState: MaterialsState;
  updateMaterialCosts: (costs: { id: string; cost: number; }[]) => void;
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

   const updateMaterialCosts = (costs: { id: string; cost: number; }[]) => {
    const costMap = new Map(costs.map(c => [c.id, { cost: c.cost }]));

    const newState = produce(materialsState, draft => {

      for (const categoryKey of Object.keys(draft) as Array<keyof MaterialsState>) {

        for (const itemId in draft[categoryKey]) {

          const dataFromFile = costMap.get(itemId);

          if (dataFromFile) {

            draft[categoryKey][itemId].cost = dataFromFile.cost;
          } else {

            const item = draft[categoryKey][itemId];
            if (item !== undefined && item.cost !== undefined && item.cost <= 0) {

              if (categoryKey === 'primary' || categoryKey === 'secondary') {
                item.cost = 1;
              }

            }
          }
        }
      }
    });

    setMaterialsState(newState);
  };

  return (
    <RawMaterialContext.Provider value={{ materialsState, updateMaterialCosts: updateMaterialCosts, areCostsLoaded }}>
      {children}
    </RawMaterialContext.Provider>
  );
};