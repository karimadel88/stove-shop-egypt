import { useEffect, useState } from 'react';
import { shippingApi, citiesApi } from '@/lib/api';
import { ShippingMethod, City } from '@/types/admin';
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
import { Plus, Pencil, Trash2, Truck, Loader2, MapPin, Clock } from 'lucide-react';

interface ShippingFormData {
  name: string;
  description: string;
  basePrice: number;
  estimatedDays: number;
  isActive: boolean;
}

const defaultFormData: ShippingFormData = {
  name: '',
  description: '',
  basePrice: 0,
  estimatedDays: 3,
  isActive: true,
};

export default function Shipping() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [deletingMethod, setDeletingMethod] = useState<ShippingMethod | null>(null);
  const [pricingMethod, setPricingMethod] = useState<ShippingMethod | null>(null);
  const [formData, setFormData] = useState<ShippingFormData>(defaultFormData);
  const [cityPrices, setCityPrices] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMethods = async () => {
    setIsLoading(true);
    try {
      const [methodsRes, citiesRes] = await Promise.all([
        shippingApi.list(),
        citiesApi.list(),
      ]);
      setMethods(methodsRes.data || []);
      setCities(citiesRes.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحميل طرق الشحن');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const openCreateDialog = () => {
    setEditingMethod(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditDialog = (method: ShippingMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      description: method.description || '',
      basePrice: method.basePrice,
      estimatedDays: method.estimatedDays,
      isActive: method.isActive,
    });
    setIsFormOpen(true);
  };

  const openPricingDialog = (method: ShippingMethod) => {
    setPricingMethod(method);
    const prices: Record<string, number> = {};
    method.cityPrices?.forEach((cp) => {
      prices[cp.cityId] = cp.price;
    });
    setCityPrices(prices);
    setIsPricingOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingMethod) {
        await shippingApi.update(editingMethod._id, formData);
        toast.success('تم تحديث طريقة الشحن بنجاح');
      } else {
        await shippingApi.create(formData);
        toast.success('تم إضافة طريقة الشحن بنجاح');
      }
      setIsFormOpen(false);
      fetchMethods();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ طريقة الشحن');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePricing = async () => {
    if (!pricingMethod) return;
    setIsSubmitting(true);

    try {
      const prices = Object.entries(cityPrices)
        .filter(([_, price]) => price > 0)
        .map(([cityId, price]) => ({ cityId, price }));

      await shippingApi.setCityPrices(pricingMethod._id, prices);
      toast.success('تم تحديث أسعار المدن بنجاح');
      setIsPricingOpen(false);
      fetchMethods();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحديث الأسعار');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMethod) return;
    try {
      await shippingApi.delete(deletingMethod._id);
      toast.success('تم حذف طريقة الشحن بنجاح');
      setIsDeleteOpen(false);
      fetchMethods();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف طريقة الشحن');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="h-8 w-8" />
            طرق الشحن
          </h1>
          <p className="text-muted-foreground">إعداد خيارات التوصيل والأسعار</p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-sm">
          <Plus className="ml-2 h-4 w-4" />
          إضافة طريقة شحن جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>طرق الشحن ({methods.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : methods.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد طرق شحن</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">السعر الأساسي</TableHead>
                  <TableHead className="text-right">مدة التوصيل</TableHead>
                  <TableHead className="text-center">أسعار المدن</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-left py-3 px-4">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methods.map((method) => (
                  <TableRow key={method._id}>
                    <TableCell className="py-4">
                      <div>
                        <p className="font-bold text-primary">{method.name}</p>
                        {method.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-bold whitespace-nowrap">{method.basePrice.toLocaleString('ar-EG')} ج.م</span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center gap-1 justify-start text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{method.estimatedDays} أيام</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-medium"
                        onClick={() => openPricingDialog(method)}
                      >
                        <MapPin className="h-3.5 w-3.5 ml-1.5 text-primary" />
                        {method.cityPrices?.length || 0} مدن
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={method.isActive ? 'default' : 'secondary'} className={method.isActive ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : ""}>
                        {method.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => openEditDialog(method)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => { setDeletingMethod(method); setIsDeleteOpen(true); }}
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
            <DialogTitle>{editingMethod ? 'تعديل طريقة الشحن' : 'إضافة طريقة شحن جديدة'}</DialogTitle>
            <DialogDescription>إعداد خيار الشحن</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
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
                  <Label htmlFor="basePrice">السعر الأساسي (ج.م) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedDays">مدة التوصيل (أيام) *</Label>
                  <Input
                    id="estimatedDays"
                    type="number"
                    min="1"
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: parseInt(e.target.value) || 1 })}
                    required
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
                {editingMethod ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* City Pricing Dialog */}
      <Dialog open={isPricingOpen} onOpenChange={setIsPricingOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>أسعار المدن - {pricingMethod?.name}</DialogTitle>
            <DialogDescription>
              حدد سعر خاص لكل مدينة. اتركه 0 لاستخدام السعر الأساسي ({pricingMethod?.basePrice} ج.م).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {cities.map((city) => (
              <div key={city._id} className="flex items-center gap-4">
                <span className="flex-1 text-sm">{city.name}</span>
                <Input
                  type="number"
                  min="0"
                  className="w-32"
                  placeholder="أساسي"
                  value={cityPrices[city._id] || ''}
                  onChange={(e) => setCityPrices({ ...cityPrices, [city._id]: parseFloat(e.target.value) || 0 })}
                />
                <span className="text-sm text-muted-foreground w-12">ج.م</span>
              </div>
            ))}
            {cities.length === 0 && (
              <p className="text-center text-muted-foreground py-4">لا توجد مدن متاحة</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsPricingOpen(false)}>إلغاء</Button>
            <Button onClick={handleSavePricing} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ الأسعار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف طريقة الشحن</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{deletingMethod?.name}"؟
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
