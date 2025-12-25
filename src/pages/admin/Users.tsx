import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import { User } from '@/types/admin';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, UserCog, Loader2, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

const roleLabels: Record<string, string> = { admin: 'مدير', manager: 'مشرف', staff: 'موظف' };
const roleIcons: Record<string, any> = { admin: ShieldAlert, manager: ShieldCheck, staff: Shield };

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'staff' as 'admin' | 'manager' | 'staff' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await usersApi.list();
      setUsers(response.data || []);
    } catch {
      toast.error('فشل في تحميل المستخدمين');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'staff' });
    setIsFormOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ email: user.email, password: '', firstName: user.firstName, lastName: user.lastName, role: user.role });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data: any = { ...formData };
      if (editingUser && !data.password) delete data.password;
      if (editingUser) {
        await usersApi.update(editingUser._id, data);
        toast.success('تم تحديث المستخدم');
      } else {
        await usersApi.create(data);
        toast.success('تم إضافة المستخدم');
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ المستخدم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await usersApi.delete(deletingUser._id);
      toast.success('تم حذف المستخدم');
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف المستخدم');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><UserCog className="h-8 w-8" />المستخدمين</h1>
          <p className="text-muted-foreground">إدارة مستخدمي لوحة التحكم</p>
        </div>
        <Button onClick={openCreate} className="shadow-sm">
          <Plus className="ml-2 h-4 w-4" />
          إضافة مستخدم جديد
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>المستخدمين ({users.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : users.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">لا يوجد مستخدمين</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const RoleIcon = roleIcons[user.role] || Shield;
                  const isSelf = user._id === currentUser?._id;
                  return (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-medium text-primary">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            {isSelf && <Badge variant="outline" className="text-xs">أنت</Badge>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className="flex items-center gap-1 w-fit">
                          <RoleIcon className="h-3 w-3" />
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => openEdit(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => { setDeletingUser(user); setIsDeleteOpen(true); }}
                            disabled={isSelf}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم'}</DialogTitle>
            <DialogDescription>إدارة بيانات المستخدم</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الاسم الأول *</Label>
                  <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>الاسم الأخير *</Label>
                  <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني *</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور {editingUser && '(اتركه فارغاً للإبقاء)'}</Label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingUser} />
              </div>
              <div className="space-y-2">
                <Label>الدور</Label>
                <Select value={formData.role} onValueChange={(v: any) => setFormData({ ...formData, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير</SelectItem>
                    <SelectItem value="manager">مشرف</SelectItem>
                    <SelectItem value="staff">موظف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>إلغاء</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {editingUser ? 'تحديث' : 'إضافة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المستخدم</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف "{deletingUser?.firstName}"؟</AlertDialogDescription>
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
