import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface NameInputsProps {
  names: string[];
  count: number;
  onNamesChange: (names: string[]) => void;
  label: string;
}

export function NameInputs({ names, count, onNamesChange, label }: NameInputsProps) {
  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    onNamesChange(newNames);
  };

  const addName = () => {
    if (names.length < count) {
      onNamesChange([...names, '']);
    }
  };

  const removeName = (index: number) => {
    const newNames = names.filter((_, i) => i !== index);
    onNamesChange(newNames);
  };

  // Ensure we have exactly 'count' number of inputs
  const displayNames = [...names];
  while (displayNames.length < count) {
    displayNames.push('');
  }
  displayNames.splice(count);

  if (count === 0) return null;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="space-y-2">
        {displayNames.map((name, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder={`${label.slice(0, -1)} ${index + 1} name`}
              className="flex-1"
            />
            {names.length > index && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeName(index)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}