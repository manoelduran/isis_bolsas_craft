export interface RawMaterial {
  id: string;
  name: string;
  cost: number;
}


export interface FormFieldData {
  rawMaterialId: string;
  quantity: number;
}