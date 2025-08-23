import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DimensionInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const DimensionInput = ({ value, onChange, className }: DimensionInputProps) => {

  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [thickness, setThickness] = useState('');

  useEffect(() => {
    const parts = value ? value.split(' x ') : ['', '', ''];
    setWidth(parts[0] || '');
    setHeight(parts[1] || '');
    setThickness(parts[2] || '');
  }, [value]);

  useEffect(() => {
    const newDimensionString = `${width} x ${height} x ${thickness}`;

    if (newDimensionString !== value) {
      onChange(newDimensionString);
    }
  }, [width, height, thickness, onChange, value]);

  return (

    <div className={cn("flex items-center w-[fit-cotent] rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
      <Input
        type="text"
        inputMode="decimal"
        placeholder="Largura"
        value={width}
        onChange={(e) => setWidth(e.target.value)}
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center w-1/3"
      />
      <span className="text-muted-foreground">x</span>
      <Input
        type="text"
        inputMode="decimal"
        placeholder="Altura"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center w-1/3"
      />
      <span className="text-muted-foreground">x</span>
      <Input
        type="text"
        inputMode="decimal"
        placeholder="Espessura"
        value={thickness}
        onChange={(e) => setThickness(e.target.value)}
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center w-1/3"
      />
    </div>
  );
};