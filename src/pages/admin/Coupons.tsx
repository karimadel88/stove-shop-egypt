import { useEffect, useState } from 'react';
import { couponsApi } from '@/lib/api';
import { Coupon } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Ticket, Loader2, Percent, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CouponFormData {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const defaultFormData: CouponFormData = {
  code: '',
  description: '',
  type: 'percentage',
  value: 0,
  minOrderAmount: 0,
  maxUses: 0,
  validFrom: '',
  validUntil: '',
  isActive: true,
};

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await couponsApi.list();
      setCoupons(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحميل الكوبونات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateDialog = () => {
    setEditingCoupon(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxUses: coupon.maxUses || 0,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data: any = {
        ...formData,
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : undefined,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
      };

      if (editingCoupon) {
        await couponsApi.update(editingCoupon._id, data);
        toast.success('تم تحديث الكوبون بنجاح');
      } else {
        await couponsApi.create(data);
        toast.success('تم إنشاء الكوبون بنجاح');
      }
      setIsFormOpen(false);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ الكوبون');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCoupon) return;
    try {
      await couponsApi.delete(deletingCoupon._id);
      toast.success('تم حذف الكوبون بنجاح');
      setIsDeleteOpen(false);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف الكوبون');
    }
  };

  const isExpired = (coupon: Coupon) => {
    return coupon.validUntil && new Date(coupon.validUntil) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ticket className="h-8 w-8" />
            الكوبونات
          </h1>
          <p className="text-muted-foreground">إدارة كوبونات الخصم</p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-sm">
          <Plus className="ml-2 h-4 w-4" />
          إضافة كوبون جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الكوبونات ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد كوبونات</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead className="text-right">الكود</TableHead>
                    <TableHead className="text-right">الخصم</TableHead>
                    <TableHead className="text-center">الاستخدام</TableHead>
                    <TableHead className="text-right">فترة الصلاحية</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-left py-3 px-4">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell className="text-right py-4">
                      <code className="px-2 py-1 bg-primary/5 text-primary border border-primary/10 rounded font-mono font-bold">
                        {coupon.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-primary font-bold">
                          {coupon.type === 'percentage' ? (
                            <Percent className="h-4 w-4" />
                          ) : (
                            <span className="text-xs">ج.م</span>
                          )}
                          <span>
                            {coupon.value}
                            {coupon.type === 'percentage' && '%'}
                          </span>
                        </div>
                        {coupon.minOrderAmount > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            الحد الأدنى: {coupon.minOrderAmount} ج.م
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <span className="font-medium">{coupon.usedCount}</span>
                      <span className="text-muted-foreground mx-1">/</span>
                      <span className="text-muted-foreground">{coupon.maxUses || '∞'}</span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="text-xs space-y-0.5">
                        {coupon.validFrom && (
                          <div className="flex items-center gap-1 justify-start">
                            <span className="w-4 text-muted-foreground">من:</span>
                            <span>{format(new Date(coupon.validFrom), 'd MMM yyyy', { locale: ar })}</span>
                          </div>
                        )}
                        {coupon.validUntil && (
                          <div className="flex items-center gap-1 justify-start">
                            <span className="w-4 text-muted-foreground">إلى:</span>
                            <span className={isExpired(coupon) ? 'text-destructive font-medium' : ''}>
                              {format(new Date(coupon.validUntil), 'd MMM yyyy', { locale: ar })}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      {isExpired(coupon) ? (
                        <Badge variant="secondary" className="bg-red-50 text-red-600 hover:bg-red-50 border-red-100 uppercase text-[10px]">منتهي</Badge>
                      ) : (
                        <Badge variant={coupon.isActive ? 'default' : 'secondary'} className={coupon.isActive ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : ""}>
                          {coupon.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openEditDialog(coupon)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => { setDeletingCoupon(coupon); setIsDeleteOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</DialogTitle>
            <DialogDescription>
              {editingCoupon ? 'تحديث بيانات الكوبون' : 'إضافة كوبون خصم جديد'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">الكود *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  required
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>النوع</Label>
                  <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">نسبة مئوية</SelectItem>
                      <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">القيمة *</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrderAmount">الحد الأدنى للطلب (ج.م)</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">الحد الأقصى للاستخدام (0 = غير محدود)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="0"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">صالح من</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">صالح حتى</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">نشط</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {editingCoupon ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الكوبون</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الكوبون "{deletingCoupon?.code}"؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
