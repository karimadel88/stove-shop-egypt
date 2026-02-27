import { useEffect, useState } from 'react';
import { adminTransferApi } from '@/lib/api';
import { TransferMethod, TransferFeeRule } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Plus, Pencil, Trash2, Receipt, Loader2 } from 'lucide-react';

interface FeeRuleFormData {
  fromMethodId: string;
  toMethodId: string;
  feeType: 'PERCENT' | 'FIXED';
  feeValue: number;
  minFee: number;
  maxFee: number;
  enabled: boolean;
  priority: number;
}

const defaultFormData: FeeRuleFormData = {
  fromMethodId: '',
  toMethodId: '',
  feeType: 'PERCENT',
  feeValue: 0,
  minFee: 0,
  maxFee: 0,
  enabled: true,
  priority: 10,
};

function getMethodName(method: any): string {
  if (typeof method === 'object' && method?.name) return method.name;
  return String(method);
}

function getMethodId(method: any): string {
  if (typeof method === 'object' && method?._id) return method._id;
  return String(method);
}

export default function AdminFeeRules() {
  const [rules, setRules] = useState<TransferFeeRule[]>([]);
  const [methods, setMethods] = useState<TransferMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TransferFeeRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<TransferFeeRule | null>(null);
  const [formData, setFormData] = useState<FeeRuleFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, methodsRes] = await Promise.all([
        adminTransferApi.listFeeRules(),
        adminTransferApi.listMethods(),
      ]);
      setRules(rulesRes.data || []);
      setMethods(methodsRes.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingRule(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEdit = (rule: TransferFeeRule) => {
    setEditingRule(rule);
    setFormData({
      fromMethodId: getMethodId(rule.fromMethodId),
      toMethodId: getMethodId(rule.toMethodId),
      feeType: rule.feeType,
      feeValue: rule.feeValue,
      minFee: rule.minFee || 0,
      maxFee: rule.maxFee || 0,
      enabled: rule.enabled,
      priority: rule.priority,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fromMethodId === formData.toMethodId) {
      toast.error('يجب أن تختلف طريقة الإرسال عن الاستلام');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = { ...formData };
      if (!payload.minFee) delete payload.minFee;
      if (!payload.maxFee) delete payload.maxFee;

      if (editingRule) {
        await adminTransferApi.updateFeeRule(editingRule._id, payload);
        toast.success('تم تحديث قاعدة الرسوم');
      } else {
        await adminTransferApi.createFeeRule(payload);
        toast.success('تمت إضافة قاعدة الرسوم');
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ قاعدة الرسوم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleEnabled = async (rule: TransferFeeRule) => {
    try {
      await adminTransferApi.updateFeeRule(rule._id, { enabled: !rule.enabled });
      toast.success(rule.enabled ? 'تم تعطيل القاعدة' : 'تم تفعيل القاعدة');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحديث الحالة');
    }
  };

  const handleDelete = async () => {
    if (!deletingRule) return;
    try {
      await adminTransferApi.deleteFeeRule(deletingRule._id);
      toast.success('تم حذف قاعدة الرسوم');
      setIsDeleteOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف قاعدة الرسوم');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Receipt className="h-8 w-8" />
            قواعد الرسوم
          </h1>
          <p className="text-muted-foreground">تحديد رسوم التحويل بين الطرق المختلفة</p>
        </div>
        <Button onClick={openCreate} className="shadow-sm">
          <Plus className="ml-2 h-4 w-4" />
          إضافة قاعدة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قواعد الرسوم ({rules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد قواعد رسوم</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">من</TableHead>
                    <TableHead className="text-right">إلى</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">القيمة</TableHead>
                    <TableHead className="text-right">الحد الأدنى</TableHead>
                    <TableHead className="text-right">الحد الأقصى</TableHead>
                    <TableHead className="text-center">الأولوية</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule._id}>
                      <TableCell className="font-medium">{getMethodName(rule.fromMethodId)}</TableCell>
                      <TableCell className="font-medium">{getMethodName(rule.toMethodId)}</TableCell>
                      <TableCell>{rule.feeType === 'PERCENT' ? 'نسبة %' : 'مبلغ ثابت'}</TableCell>
                      <TableCell>
                        {rule.feeType === 'PERCENT'
                          ? `${rule.feeValue}%`
                          : `${rule.feeValue.toLocaleString('ar-EG')} ج.م`}
                      </TableCell>
                      <TableCell>{rule.minFee ? `${rule.minFee.toLocaleString('ar-EG')} ج.م` : '-'}</TableCell>
                      <TableCell>{rule.maxFee ? `${rule.maxFee.toLocaleString('ar-EG')} ج.م` : '-'}</TableCell>
                      <TableCell className="text-center">{rule.priority}</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={rule.enabled} onCheckedChange={() => handleToggleEnabled(rule)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(rule)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => { setDeletingRule(rule); setIsDeleteOpen(true); }}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule ? 'تعديل قاعدة الرسوم' : 'إضافة قاعدة رسوم جديدة'}</DialogTitle>
            <DialogDescription>تحديد رسوم التحويل</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>من طريقة *</Label>
                <Select value={formData.fromMethodId} onValueChange={(val) => setFormData({ ...formData, fromMethodId: val })}>
                  <SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger>
                  <SelectContent>
                    {methods.map((m) => (
                      <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>إلى طريقة *</Label>
                <Select value={formData.toMethodId} onValueChange={(val) => setFormData({ ...formData, toMethodId: val })}>
                  <SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger>
                  <SelectContent>
                    {methods.map((m) => (
                      <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع الرسوم</Label>
                  <Select value={formData.feeType} onValueChange={(val: 'PERCENT' | 'FIXED') => setFormData({ ...formData, feeType: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENT">نسبة %</SelectItem>
                      <SelectItem value="FIXED">مبلغ ثابت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feeValue">القيمة *</Label>
                  <Input id="feeValue" type="number" min="0" step="any" value={formData.feeValue} onChange={(e) => setFormData({ ...formData, feeValue: parseFloat(e.target.value) || 0 })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minFee">الحد الأدنى (ج.م)</Label>
                  <Input id="minFee" type="number" min="0" value={formData.minFee} onChange={(e) => setFormData({ ...formData, minFee: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFee">الحد الأقصى (ج.م)</Label>
                  <Input id="maxFee" type="number" min="0" value={formData.maxFee} onChange={(e) => setFormData({ ...formData, maxFee: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Input id="priority" type="number" min="0" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="enabled" checked={formData.enabled} onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })} />
                <Label htmlFor="enabled">مفعّلة</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {editingRule ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف قاعدة الرسوم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه القاعدة؟ ({getMethodName(deletingRule?.fromMethodId)} → {getMethodName(deletingRule?.toMethodId)})
            </AlertDialogDescription>
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
