import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  whatsappUrl?: string;
  phone?: string;
  message?: string;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export default function WhatsAppButton({
  whatsappUrl,
  phone,
  message,
  label = 'فتح واتساب',
  variant = 'default',
  size = 'default',
  className,
}: WhatsAppButtonProps) {
  const url =
    whatsappUrl ||
    `https://wa.me/${phone}?text=${encodeURIComponent(message || '')}`;

  return (
    <Button
      variant={variant}
      size={size}
      className={`bg-green-600 hover:bg-green-700 text-white ${className || ''}`}
      onClick={() => window.open(url, '_blank')}
    >
      <MessageCircle className="ml-2 h-4 w-4" />
      {label}
    </Button>
  );
}
