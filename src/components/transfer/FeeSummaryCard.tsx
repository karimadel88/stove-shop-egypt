import { TransferQuote } from '@/types/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface FeeSummaryCardProps {
  quote: TransferQuote;
}

export default function FeeSummaryCard({ quote }: FeeSummaryCardProps) {
  return (
    <Card className={quote.available ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {quote.available ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-700">التحويل متاح</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">التحويل غير متاح</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">من</span>
          <Badge variant="outline">{quote.fromMethod.name}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">إلى</span>
          <Badge variant="outline">{quote.toMethod.name}</Badge>
        </div>
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">المبلغ</span>
            <span className="font-medium">{quote.amount.toLocaleString('ar-EG')} ج.م</span>
          </div>
          {quote.available && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الرسوم</span>
                <span className="font-medium text-orange-600">{quote.fee.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold border-t pt-2">
                <span>الإجمالي</span>
                <span className="text-primary">{quote.total.toLocaleString('ar-EG')} ج.م</span>
              </div>
            </>
          )}
        </div>
        {!quote.available && quote.message && (
          <p className="text-sm text-red-600 mt-2">{quote.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
