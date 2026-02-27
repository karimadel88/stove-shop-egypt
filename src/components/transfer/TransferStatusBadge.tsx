import { TransferOrderStatus } from '@/types/admin';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<TransferOrderStatus, { label: string; className: string }> = {
  PENDING_CONFIRMATION: {
    label: 'بانتظار التأكيد',
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200',
  },
  SUBMITTED: {
    label: 'تم الإرسال',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200',
  },
  IN_PROGRESS: {
    label: 'قيد التنفيذ',
    className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-indigo-200',
  },
  COMPLETED: {
    label: 'مكتمل',
    className: 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200',
  },
  CANCELLED: {
    label: 'ملغي',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200',
  },
  REJECTED: {
    label: 'مرفوض',
    className: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200',
  },
};

interface TransferStatusBadgeProps {
  status: TransferOrderStatus;
}

export default function TransferStatusBadge({ status }: TransferStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: '' };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
