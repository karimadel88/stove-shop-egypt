import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { categoriesApi } from '@/lib/api';
import { Category, Media } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Layers, Loader2, ChevronDown, ChevronLeft, FolderOpen, Folder, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/utils';
import ImageUpload from '@/components/admin/ImageUpload';

interface CategoryFormData {
  name: string;
  description: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
  imageId: string | Media;
}

const defaultFormData: CategoryFormData = {
  name: '',
  description: '',
  parentId: '',
  sortOrder: 0,
  isActive: true,
  imageId: '',
};

interface CategoryTreeItemProps {
  category: Category;
  categories: Category[];
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryTreeItem = memo(({
  category,
  categories,
  level,
  onEdit,
  onDelete,
}: Omit<CategoryTreeItemProps, 'expandedIds' | 'onToggle'>) => {
  const [isOpen, setIsOpen] = useState(false);
  const children = categories.filter((c) => c.parentId === category._id);
  const hasChildren = children.length > 0;

  const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <div>
      <div
        className={cn(
          'flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors',
          level > 0 && 'mr-6 border-r-2 border-muted'
        )}
        style={{ marginRight: level * 24 }}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleOpen}>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}
          <div className="h-8 w-8 rounded bg-muted flex-shrink-0 flex items-center justify-center border overflow-hidden">
            {(() => {
              const img = category.image || (typeof category.imageId === 'object' ? category.imageId : null);
              if (img?.url) {
                return (
                  <img
                    src={getMediaUrl(img.url)}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                );
              }
              return hasChildren ? (
                <FolderOpen className="h-4 w-4 text-primary" />
              ) : (
                <Folder className="h-4 w-4 text-muted-foreground" />
              );
            })()}
          </div>
          <span className="font-medium">{category.name}</span>
          {!category.isActive && (
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded">غير نشط</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(category)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {hasChildren && isOpen && (
        <div>
          {children.map((child) => (
            <CategoryTreeItem
              key={child._id}
              category={child}
              categories={categories}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await categoriesApi.list();
      setCategories(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحميل التصنيفات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateDialog = useCallback(() => {
    setEditingCategory(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  }, []);

  const openEditDialog = useCallback((category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      imageId: category.imageId || '',
    });
    setIsFormOpen(true);
  }, []);

  const openDeleteDialog = useCallback((category: Category) => {
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data: any = { 
        ...formData,
        imageId: typeof formData.imageId === 'object' ? (formData.imageId as Media)._id : formData.imageId
      };
      if (!data.parentId || data.parentId === 'none') {
        delete data.parentId;
      }

      if (editingCategory) {
        await categoriesApi.update(editingCategory._id, data);
        toast.success('تم تحديث التصنيف بنجاح');
      } else {
        await categoriesApi.create(data);
        toast.success('تم إنشاء التصنيف بنجاح');
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ التصنيف');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      await categoriesApi.delete(deletingCategory._id);
      toast.success('تم حذف التصنيف بنجاح');
      setIsDeleteOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف التصنيف');
    }
  };

  const rootCategories = useMemo(() => categories.filter((c) => {
    if (!c.parentId || c.parentId === 'none') return true;
    return !categories.some((parent) => parent._id === c.parentId);
  }), [categories]);

  const getPossibleParents = (): Category[] => {
    if (!editingCategory) return categories;
    const descendants = new Set<string>();
    const findDescendants = (parentId: string) => {
      categories.forEach((c) => {
        if (c.parentId === parentId) {
          descendants.add(c._id);
          findDescendants(c._id);
        }
      });
    };
    descendants.add(editingCategory._id);
    findDescendants(editingCategory._id);
    return categories.filter((c) => !descendants.has(c._id));
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Layers className="h-7 w-7 sm:h-8 sm:w-8" />
            التصنيفات
          </h1>
          <p className="text-muted-foreground text-sm">إدارة تصنيفات المنتجات</p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-sm w-full sm:w-auto">
          <Plus className="ml-2 h-4 w-4" />
          إضافة تصنيف جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>هيكل التصنيفات ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لم يتم العثور على تصنيفات</p>
            </div>
          ) : (
            <div className="space-y-1">
              {rootCategories.map((category) => (
                <CategoryTreeItem
                  key={category._id}
                  category={category}
                  categories={categories}
                  level={0}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] sm:w-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</DialogTitle>
            <DialogDescription>
              {editingCategory ? 'تحديث بيانات التصنيف' : 'إضافة تصنيف جديد للمنتجات'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>صورة التصنيف</Label>
                <ImageUpload
                  value={formData.imageId ? [formData.imageId] : []}
                  onChange={(ids) => setFormData({ ...formData, imageId: ids[0] || '' })}
                  multiple={false}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">اسم التصنيف *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="parentId">التصنيف الرئيسي</Label>
                <Select
                  value={formData.parentId || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="بدون تصنيف رئيسي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون تصنيف رئيسي</SelectItem>
                    {getPossibleParents().map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">ترتيب العرض</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="0"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
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
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {editingCategory ? 'تحديث' : 'إنشاء'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف التصنيف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{deletingCategory?.name}"؟ لا يمكن حذف التصنيفات التي تحتوي على تصنيفات فرعية.
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
