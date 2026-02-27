import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { transferApi } from '@/lib/api';
import { TransferMethod, TransferQuote, TransferConfirmResult } from '@/types/admin';
import MethodSelect from '@/components/transfer/MethodSelect';
import FeeSummaryCard from '@/components/transfer/FeeSummaryCard';
import TransferStatusBadge from '@/components/transfer/TransferStatusBadge';
import WhatsAppButton from '@/components/transfer/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeftRight, Loader2, CheckCircle, ClipboardList, AlertTriangle } from 'lucide-react';

type Step = 'form' | 'quote' | 'result';

export default function TransferRequest() {
  const [methods, setMethods] = useState<TransferMethod[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);

  const [fromMethodId, setFromMethodId] = useState('');
  const [toMethodId, setToMethodId] = useState('');
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [step, setStep] = useState<Step>('form');
  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [result, setResult] = useState<TransferConfirmResult | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await transferApi.getMethods();
        setMethods(res.data || []);
      } catch {
        toast.error('فشل في تحميل طرق التحويل');
      } finally {
        setIsLoadingMethods(false);
      }
    };
    fetchMethods();
  }, []);

  const handleGetQuote = async () => {
    if (!fromMethodId || !toMethodId) {
      toast.error('يرجى اختيار طريقة التحويل');
      return;
    }
    if (fromMethodId === toMethodId) {
      toast.error('يجب أن تختلف طريقة الإرسال عن الاستلام');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('يرجى إدخال مبلغ أكبر من صفر');
      return;
    }

    setIsQuoting(true);
    try {
      const res = await transferApi.getQuote({
        fromMethodId,
        toMethodId,
        amount: parsedAmount,
      });
      setQuote(res.data);
      setStep('quote');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في الحصول على التسعير');
    } finally {
      setIsQuoting(false);
    }
  };

  const handleConfirm = async () => {
    if (!quote || !quote.available) return;
    setIsConfirming(true);
    try {
      const res = await transferApi.confirm({
        fromMethodId,
        toMethodId,
        amount: parseFloat(amount),
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        customerWhatsapp: customerPhone || undefined,
      });
      setResult(res.data);
      setStep('result');
      toast.success('تم إنشاء طلب التحويل بنجاح');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تأكيد التحويل');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReset = () => {
    setFromMethodId('');
    setToMethodId('');
    setAmount('');
    setCustomerName('');
    setCustomerPhone('');
    setQuote(null);
    setResult(null);
    setStep('form');
  };

  if (isLoadingMethods) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Result screen
  if (step === 'result' && result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Card className="border-green-200">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-9 w-9 text-green-600" />
            </div>
            <CardTitle className="text-xl">تم إنشاء الطلب بنجاح!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">رقم الطلب</span>
              <span className="font-bold text-primary">{result.order.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الحالة</span>
              <TransferStatusBadge status={result.order.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">المبلغ</span>
              <span className="font-medium">{result.order.amount.toLocaleString('ar-EG')} ج.م</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الرسوم</span>
              <span className="font-medium">{result.order.fee.toLocaleString('ar-EG')} ج.م</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold border-t pt-3">
              <span>الإجمالي</span>
              <span className="text-primary">{result.order.total.toLocaleString('ar-EG')} ج.م</span>
            </div>

            <div className="pt-3 space-y-3">
              <WhatsAppButton
                whatsappUrl={result.whatsapp.whatsappUrl}
                label="تواصل مع الوسيط عبر واتساب"
                className="w-full"
              />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  يتم إتمام التحويلات يدوياً عبر محادثة الوسيط على واتساب.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  تحويل جديد
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/transfer/orders">
                    <ClipboardList className="ml-2 h-4 w-4" />
                    طلباتي
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ArrowLeftRight className="h-8 w-8" />
          تحويل الأموال
        </h1>
        <p className="text-muted-foreground mt-1">
          حوّل أموالك بين المحافظ الإلكترونية بسهولة
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <MethodSelect
            label="التحويل من"
            methods={methods}
            value={fromMethodId}
            onChange={(val) => {
              setFromMethodId(val);
              if (step === 'quote') setStep('form');
            }}
            excludeId={toMethodId}
            disabled={step === 'result'}
          />

          <MethodSelect
            label="التحويل إلى"
            methods={methods}
            value={toMethodId}
            onChange={(val) => {
              setToMethodId(val);
              if (step === 'quote') setStep('form');
            }}
            excludeId={fromMethodId}
            disabled={step === 'result'}
          />

          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ (ج.م) *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (step === 'quote') setStep('form');
              }}
              disabled={step === 'result'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerName">الاسم (اختياري)</Label>
            <Input
              id="customerName"
              placeholder="اسمك"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={step === 'result'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">رقم الهاتف / واتساب (اختياري)</Label>
            <Input
              id="customerPhone"
              placeholder="01012345678"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              disabled={step === 'result'}
            />
          </div>

          {step === 'form' && (
            <Button
              className="w-full"
              onClick={handleGetQuote}
              disabled={isQuoting || !fromMethodId || !toMethodId || !amount}
            >
              {isQuoting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              احصل على التسعير
            </Button>
          )}

          {step === 'quote' && quote && (
            <div className="space-y-4 pt-2">
              <FeeSummaryCard quote={quote} />
              {quote.available && (
                <Button
                  className="w-full"
                  onClick={handleConfirm}
                  disabled={isConfirming}
                >
                  {isConfirming && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  تأكيد التحويل
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep('form')}
              >
                تعديل البيانات
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-center">
        <Button variant="link" asChild>
          <Link to="/transfer/orders">
            <ClipboardList className="ml-1 h-4 w-4" />
            تتبع طلباتك
          </Link>
        </Button>
      </div>
    </div>
  );
}
