import { useContext } from 'react';
import { RawMaterialContext } from '@/context/RawMaterialContext';

export const useRawMaterials = () => {
  const context = useContext(RawMaterialContext);
  if (context === undefined) {
    throw new Error('useRawMaterials must be used within a RawMaterialProvider');
  }
  return context;
};