export interface MaterialDetails {
  name: string;
  cost: number;
  unit: string;
}

export interface MaterialsState {
  primary: Record<string, MaterialDetails>;
  secondary: Record<string, MaterialDetails>;
  extra: Record<string, MaterialDetails>;
}

export interface BagForm {
  style: string;
  dimensions: string;
  bag_quantity: string | number;
  profit_percentage: string | number;
  taxes: string | number;
  primary: Record<string, { quantity: string | number; }>;
  created_at: Date;
  secondary: Record<string, { quantity: string | number; }>;
  extra: Record<string, { quantity: string | number; }>;
}