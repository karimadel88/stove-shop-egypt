import { useEffect, useState } from 'react';
import { adminTransferApi } from '@/lib/api';
import { TransferMethod } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Wallet, Loader2 } from 'lucide-react';

interface MethodFormData {
  name: string;
  code: string;
  category: string;
  enabled: boolean;
  sortOrder: number;
}

const defaultFormData: MethodFormData = {
  name: '',
  code: '',
  category: 'wallet',
  enabled: true,
  sortOrder: 0,
};

const categoryLabels: Record<string, string> = {
  wallet: 'محفظة إلكترونية',
  bank: 'حساب بنكي',
  cash: 'نقدي',
  other: 'أخرى',
};

export default function AdminTransferMethods() {
  const [methods, setMethods] = useState<TransferMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<TransferMethod | null>(null);
  const [deletingMethod, setDeletingMethod] = useState<TransferMethod | null>(null);
  const [formData, setFormData] = useState<MethodFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMethods = async () => {
    setIsLoading(true);
    try {
      const res = await adminTransferApi.listMethods();
      setMethods(res.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحميل طرق التحويل');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const openCreate = () => {
    setEditingMethod(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEdit = (method: TransferMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      code: method.code,
      category: method.category,
      enabled: method.enabled,
      sortOrder: method.sortOrder,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingMethod) {
        await adminTransferApi.updateMethod(editingMethod._id, formData);
        toast.success('تم تحديث طريقة التحويل');
      } else {
        await adminTransferApi.createMethod(formData);
        toast.success('تمت إضافة طريقة التحويل');
      }
      setIsFormOpen(false);
      fetchMethods();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ طريقة التحويل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEnabled = async (method: TransferMethod) => {
    try {
      await adminTransferApi.updateMethod(method._id, { enabled: !method.enabled });
      toast.success(method.enabled ? 'تم تعطيل الطريقة' : 'تم تفعيل الطريقة');
      fetchMethods();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحديث الحالة');
    }
  };

  const handleDelete = async () => {
    if (!deletingMethod) return;
    try {
      await adminTransferApi.deleteMethod(deletingMethod._id);
      toast.success('تم حذف طريقة التحويل');
      setIsDeleteOpen(false);
      fetchMethods();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف طريقة التحويل');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-7 w-7 sm:h-8 sm:w-8" />
            طرق التحويل
          </h1>
          <p className="text-muted-foreground text-sm">إدارة طرق التحويل المتاحة</p>
        </div>
        <Button onClick={openCreate} className="shadow-sm w-full sm:w-auto">
          <Plus className="ml-2 h-4 w-4" />
          إضافة طريقة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>طرق التحويل ({methods.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : methods.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد طرق تحويل</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الكود</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-center">الترتيب</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methods.map((method) => (
                  <TableRow key={method._id}>
                    <TableCell className="font-bold text-primary">{method.name}</TableCell>
                    <TableCell className="font-mono text-xs">{method.code}</TableCell>
                    <TableCell>{categoryLabels[method.category] || method.category}</TableCell>
                    <TableCell className="text-center">{method.sortOrder}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={method.enabled}
                        onCheckedChange={() => handleToggleEnabled(method)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(method)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setDeletingMethod(method); setIsDeleteOpen(true); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] sm:w-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMethod ? 'تعديل طريقة التحويل' : 'إضافة طريقة تحويل جديدة'}</DialogTitle>
            <DialogDescription>إعداد طريقة التحويل</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم *</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">الكود *</Label>
                <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="VODAFONE_CASH" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">التصنيف</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wallet">محفظة إلكترونية</SelectItem>
                    <SelectItem value="bank">حساب بنكي</SelectItem>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">الترتيب</Label>
                <Input id="sortOrder" type="number" min="0" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="enabled" checked={formData.enabled} onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })} />
                <Label htmlFor="enabled">مفعّل</Label>
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

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف طريقة التحويل</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف "{deletingMethod?.name}"؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
