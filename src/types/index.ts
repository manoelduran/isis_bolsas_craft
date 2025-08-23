export interface MaterialDetails {
  name: string;
  cost: number;
  unity: string;
}

export interface MaterialsState {
  primary: Record<string, MaterialDetails>;
  secondary: Record<string, MaterialDetails>;
  extra: Record<string, MaterialDetails>;
}

export interface BagForm {
  style: string;
  dimensions: string;
  profit_percentage: number;
  taxes: number;
  primary: Record<string, { quantity: number; }>;
  secondary: Record<string, { quantity: number; }>;
  extra: Record<string, { quantity: number; }>;
}