import { createContext, useState, useMemo, type ReactNode } from 'react';
import { allCraftFields } from '@/lib/formFields';
import type { RawMaterial } from '@/types';

interface RawMaterialContextType {
  materials: RawMaterial[];
  updateMaterialCosts: (costs: { id: string; cost: number }[]) => void;
  areCostsLoaded: boolean;
}

export const RawMaterialContext = createContext<RawMaterialContextType | undefined>(undefined);

export const RawMaterialProvider = ({ children }: { children: ReactNode }) => {
  const [materials, setMaterials] = useState<RawMaterial[]>(
    allCraftFields.map(field => ({ ...field, cost: 0 }))
  );

  const areCostsLoaded = useMemo(() => materials.some(m => m.cost > 0), [materials]);

  const updateMaterialCosts = (costs: { id: string; cost: number }[]) => {
    setMaterials(currentMaterials => {
      const costMap = new Map(costs.map(c => [c.id, c.cost]));
      return currentMaterials.map(material => ({
        ...material,
        cost: costMap.get(material.id) ?? material.cost,
      }));
    });
  };

  return (
    <RawMaterialContext.Provider value={{ materials, updateMaterialCosts, areCostsLoaded }}>
      {children}
    </RawMaterialContext.Provider>
  );
};