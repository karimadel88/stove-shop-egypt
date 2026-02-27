import { TransferMethod } from '@/types/admin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface MethodSelectProps {
  label: string;
  methods: TransferMethod[];
  value: string;
  onChange: (value: string) => void;
  excludeId?: string;
  disabled?: boolean;
}

export default function MethodSelect({
  label,
  methods,
  value,
  onChange,
  excludeId,
  disabled,
}: MethodSelectProps) {
  const filtered = excludeId
    ? methods.filter((m) => m._id !== excludeId)
    : methods;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="اختر طريقة..." />
        </SelectTrigger>
        <SelectContent>
          {filtered.map((method) => (
            <SelectItem key={method._id} value={method._id}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
