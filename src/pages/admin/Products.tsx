import { useEffect, useState } from 'react';
import { productsApi, categoriesApi } from '@/lib/api';
import { Product, Category, Media, PaginatedResponse } from '@/types/admin';
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
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Package,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { getMediaUrl } from '@/lib/utils';

interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  price: number;
  compareAtPrice: number;
  quantity: number;
  lowStockThreshold: number;
  categoryId: string;
  isFeatured: boolean;
  isActive: boolean;
  imageIds: (string | Media)[];
}

const defaultFormData: ProductFormData = {
  name: '',
  description: '',
  sku: '',
  price: 0,
  compareAtPrice: 0,
  quantity: 0,
  lowStockThreshold: 5,
  categoryId: '',
  isFeatured: false,
  isActive: true,
  imageIds: [],
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productsApi.list({ page, limit: 10, search: search || undefined });
      const data: PaginatedResponse<Product> = response.data;
      setProducts(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحميل المنتجات');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.list();
      setCategories(response.data || []);
    } catch (error: any) {
      console.error('فشل في تحميل التصنيفات');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };


  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku,
      price: product.price,
      compareAtPrice: product.compareAtPrice || 0,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
      categoryId: typeof product.categoryId === 'object' ? product.categoryId._id : (product.categoryId || ''),
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      imageIds: product.imageIds || [],
    });
    setIsFormOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = { 
        ...formData,
        imageIds: formData.imageIds.map(img => typeof img === 'object' ? (img as Media)._id : (img as string))
      };
      if (!data.categoryId || data.categoryId === 'none') {
        delete (data as any).categoryId;
      }

      if (editingProduct) {
        await productsApi.update(editingProduct._id, data);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await productsApi.create(data);
        toast.success('تم إنشاء المنتج بنجاح');
      }
      setIsFormOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ المنتج');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      await productsApi.delete(deletingProduct._id);
      toast.success('تم حذف المنتج بنجاح');
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف المنتج');
    }
  };
  const getCategoryName = (categoryId?: string | Category) => {
    if (!categoryId) return '-';
    if (typeof categoryId === 'object') return categoryId.name;
    const category = categories.find((c) => c._id === categoryId);
    return category?.name || '-';
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Package className="h-7 w-7 sm:h-8 sm:w-8" />
            المنتجات
          </h1>
          <p className="text-muted-foreground text-sm">إدارة منتجات المتجر</p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-sm w-full sm:w-auto">
          <Plus className="ml-2 h-4 w-4" />
          إضافة منتج جديد
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث بالاسم أو SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>المنتجات ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لم يتم العثور على منتجات</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المنتج</TableHead>
                    <TableHead className="text-right">SKU</TableHead>
                    <TableHead className="text-right">التصنيف</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">المخزون</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-left py-3 px-4">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const isLowStock = product.quantity <= product.lowStockThreshold;
                    return (
                      <TableRow key={product._id}>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-md bg-muted flex-shrink-0 flex items-center justify-center border shadow-sm overflow-hidden">
                              {(() => {
                                const mainImage = product.images?.[0] || 
                                  (typeof product.imageIds?.[0] === 'object' ? product.imageIds[0] : null);
                                
                                if (mainImage?.url) {
                                  return (
                                    <img
                                      src={getMediaUrl(mainImage.url)}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  );
                                }
                                return <ImageIcon className="h-5 w-5 text-muted-foreground" />;
                              })()}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.isFeatured && (
                                <Badge variant="secondary" className="text-xs">مميز</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-right">{product.sku}</TableCell>
                        <TableCell className="text-right">{getCategoryName(product.categoryId)}</TableCell>
                        <TableCell className="text-right">
                          <div className="whitespace-nowrap">
                            <p className="font-bold text-primary">{product.price.toLocaleString('ar-EG')} ج.م</p>
                            {product.compareAtPrice && product.compareAtPrice > product.price && (
                              <p className="text-xs text-muted-foreground line-through opacity-70">
                                {product.compareAtPrice.toLocaleString('ar-EG')} ج.م
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-1.5 justify-start">
                            <span className={isLowStock ? 'text-destructive font-bold' : 'font-medium'}>
                              {product.quantity}
                            </span>
                            {isLowStock && <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={product.isActive ? 'default' : 'secondary'}
                            className={product.isActive ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' : ''}
                          >
                            {product.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left py-4 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => openEditDialog(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => openDeleteDialog(product)}
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
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    الصفحة {page} من {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                      التالي
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      السابق
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'تحديث بيانات المنتج' : 'إضافة منتج جديد إلى المتجر'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>صور المنتج</Label>
                <ImageUpload
                  value={formData.imageIds || []}
                  onChange={(ids) => setFormData({ ...formData, imageIds: ids })}
                  multiple
                  maxFiles={10}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المنتج *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">التصنيف</Label>
                  <Select
                    value={formData.categoryId || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون تصنيف</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">السعر (ج.م) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">السعر قبل الخصم</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">الكمية *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">حد التنبيه للمخزون</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">نشط</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  />
                  <Label htmlFor="isFeatured">مميز</Label>
                </div>
              </div>
            </div>

            <DialogFooter className="sm:space-x-0 gap-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {editingProduct ? 'تحديث' : 'إنشاء'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنتج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{deletingProduct?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
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
