import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DimensionInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const DimensionInput = ({ value, onChange, className }: DimensionInputProps) => {
  const parts = typeof value === 'string' ? value.split(' x ') : ['', '', ''];
  const width = parts[0] || '';
  const height = parts[1] || '';
  const thickness = parts[2] || '';

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${e.target.value} x ${height} x ${thickness}`);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${width} x ${e.target.value} x ${thickness}`);
  };

  const handleThicknessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`${width} x ${height} x ${e.target.value}`);
  };

  return (
    <div className={cn("flex items-center w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
      <Input
        type="text"
        inputMode="decimal"
        placeholder="Largura"
        value={width}
        onChange={handleWidthChange}
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center w-1/3"
      />
      <span className="text-muted-foreground">x</span>
      <Input
        type="text"
        inputMode="decimal"
        placeholder="Altura"
        value={height}
        onChange={handleHeightChange}
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center w-1/3"
      />
      <span className="text-muted-foreground">x</span>
      <Input
        type="text"
        inputMode="decimal"
        placeholder="Espessura"
        value={thickness}
        onChange={handleThicknessChange}
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-center w-1/3"
      />
    </div>
  );
};