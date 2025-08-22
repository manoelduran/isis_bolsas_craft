export interface RawMaterial {
  id: string;
  name: string;
  cost: number;
}

export interface CraftItem {
  name: string;
  cost: number;
  quantity: number;
  unity: string;
}

export type CraftCategory = Record<string, CraftItem>;


export interface CraftingFormState {
  primary: CraftCategory;
  secondary: CraftCategory;
  extra: CraftCategory;
}
export interface FormFieldData {
  rawMaterialId: string;
  quantity: number;
}