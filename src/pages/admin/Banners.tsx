import { useEffect, useState } from 'react';
import { bannersApi } from '@/lib/api';
import { ShopBanner, ShopMedia } from '@/types/shop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  Loader2,
  Images,
} from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { getMediaUrl } from '@/lib/utils';

interface BannerFormData {
  title: string;
  subtitle: string;
  link: string;
  buttonText: string;
  sortOrder: number;
  isActive: boolean;
  imageId: string;
}

const defaultFormData: BannerFormData = {
  title: '',
  subtitle: '',
  link: '',
  buttonText: 'تسوق الآن',
  sortOrder: 0,
  isActive: true,
  imageId: '',
};

export default function Banners() {
  const [banners, setBanners] = useState<ShopBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<ShopBanner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<ShopBanner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const response = await bannersApi.list();
      setBanners(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحميل اللافتات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateDialog = () => {
    setEditingBanner(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditDialog = (banner: ShopBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      link: banner.link || '',
      buttonText: banner.buttonText || '',
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
      imageId: typeof banner.imageId === 'object' ? banner.imageId._id : banner.imageId,
    });
    setIsFormOpen(true);
  };

  const openDeleteDialog = (banner: ShopBanner) => {
    setDeletingBanner(banner);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Sending Form Data:', formData);
      if (editingBanner) {
        await bannersApi.update(editingBanner._id, formData);
        toast.success('تم تحديث اللافتة بنجاح');
      } else {
        await bannersApi.create(formData);
        toast.success('تم إنشاء اللافتة بنجاح');
      }
      setIsFormOpen(false);
      fetchBanners();
    } catch (error: any) {
      console.error('Submit Error:', error);
      toast.error(error.response?.data?.message || 'فشل في حفظ اللافتة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBanner) return;

    try {
      await bannersApi.delete(deletingBanner._id);
      toast.success('تم حذف اللافتة بنجاح');
      setIsDeleteOpen(false);
      fetchBanners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف اللافتة');
    }
  };

  const getImageUrl = (banner: ShopBanner) => {
    if (banner.image?.url) return banner.image.url;
    if (typeof banner.imageId === 'object' && banner.imageId?.url) return banner.imageId.url;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Images className="h-7 w-7 sm:h-8 sm:w-8" />
            اللافتات الإعلانية
          </h1>
          <p className="text-muted-foreground text-sm">إدارة صور السلايدر في الصفحة الرئيسية</p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-sm w-full sm:w-auto">
          <Plus className="ml-2 h-4 w-4" />
          إضافة لافتة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اللافتات ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لم يتم العثور على لافتات</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right w-[100px]">الصورة</TableHead>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">الرابط</TableHead>
                  <TableHead className="text-center w-[100px]">الترتيب</TableHead>
                  <TableHead className="text-center w-[100px]">الحالة</TableHead>
                  <TableHead className="text-left w-[120px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner._id}>
                    <TableCell>
                      <div className="h-12 w-20 rounded-md bg-muted overflow-hidden border">
                        {getImageUrl(banner) ? (
                            <img src={getMediaUrl(getImageUrl(banner)!)} alt={banner.title} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                <ImageIcon className="h-5 w-5" />
                            </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        {banner.title}
                        {banner.subtitle && <p className="text-xs text-muted-foreground">{banner.subtitle}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground dir-ltr text-right">{banner.link || '-'}</TableCell>
                    <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">{banner.sortOrder}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={banner.isActive ? 'default' : 'secondary'}
                        className={banner.isActive ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' : ''}
                      >
                        {banner.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openEditDialog(banner)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => openDeleteDialog(banner)}
                        >
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

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'تعديل اللافتة' : 'إضافة لافتة جديدة'}</DialogTitle>
            <DialogDescription>
              {editingBanner ? 'تحديث بيانات اللافتة الإعلانية' : 'إضافة لافتة جديدة للصفحة الرئيسية'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>صورة الإعلان (مطلوب)</Label>
                <div className="border rounded-md p-4 bg-muted/10">
                    <ImageUpload
                    value={formData.imageId ? [formData.imageId] : []}
                    onChange={(ids) => {
                        const id = ids[0];
                        if (id) {
                            setFormData({ 
                                ...formData, 
                                imageId: typeof id === 'object' ? (id as ShopMedia)._id : (id as string) 
                            })
                        } else {
                            setFormData({ ...formData, imageId: '' })
                        }
                    }}
                    maxFiles={1}
                    />
                    {!formData.imageId && (
                         <p className="text-xs text-destructive mt-2">يرجى اختيار صورة للافتة</p>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">العنوان الرئيسي</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: خصومات الجمعة البيضاء (اختياري)"
                  />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subtitle">العنوان الفرعي</Label>
                    <Input
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        placeholder="مثال: خصومات تصل إلى 50%"
                    />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="link">رابط التوجيه</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="/products"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="buttonText">نص الزر</Label>
                    <Input
                        id="buttonText"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        placeholder="تسوق الآن"
                    />
                </div>
              </div>

              <div className="flex items-center gap-8 pt-4">
                 <div className="space-y-2 w-32">
                    <Label htmlFor="sortOrder">الترتيب</Label>
                    <Input
                        id="sortOrder"
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive" className="text-base cursor-pointer">تفعيل اللافتة</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.imageId}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {editingBanner ? 'تحديث' : 'إنشاء'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف اللافتة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه اللافتة؟ لا يمكن التراجع عن هذا الإجراء.
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
