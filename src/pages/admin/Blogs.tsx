import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Loader2, Plus, Pencil, Trash2, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/admin/ImageUpload";
import { getMediaUrl } from "@/lib/utils";

interface Media {
  _id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface Blog {
  _id: string;
  title: string;
  description: string;
  imageId?: string | Media;
  image?: Media;
  isActive: boolean;
  sortOrder: number;
}

interface BlogFormData {
  title: string;
  description: string;
  imageId: string;
  isActive: boolean;
  sortOrder: number;
}

const defaultFormData: BlogFormData = {
  title: "",
  description: "",
  imageId: "",
  isActive: true,
  sortOrder: 0,
};

export default function Blogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(defaultFormData);

  const { data, isLoading } = useQuery({
    queryKey: ["adminBlogs"],
    queryFn: async () => {
      const response = await blogsApi.list();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: BlogFormData) => blogsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      toast({ title: "تم التحديث", description: "تم إنشاء المدونة بنجاح" });
      setIsFormOpen(false);
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الإنشاء", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BlogFormData }) => blogsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      toast({ title: "تم التحديث", description: "تم تحديث المدونة بنجاح" });
      setIsFormOpen(false);
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء التحديث", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBlogs"] });
      toast({ title: "تم التحديث", description: "تم حذف المدونة بنجاح" });
      setIsDeleteOpen(false);
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الحذف", variant: "destructive" });
    },
  });

  const openCreateDialog = () => {
    setEditingBlog(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditDialog = (blog: Blog) => {
    setEditingBlog(blog);
    const imageId = typeof blog.imageId === 'object' ? blog.imageId._id : 
                   (blog.imageId || (blog.image ? blog.image._id : ""));
    setFormData({
      title: blog.title,
      description: blog.description || "",
      imageId: imageId,
      isActive: blog.isActive,
      sortOrder: blog.sortOrder,
    });
    setIsFormOpen(true);
  };

  const openDeleteDialog = (blog: Blog) => {
    setDeletingBlog(blog);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (deletingBlog) {
      deleteMutation.mutate(deletingBlog._id);
    }
  };

  const filteredBlogs =
    data?.blogs?.filter((blog: Blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 tracking-tight">
            <Newspaper className="h-8 w-8" />
            المدونات
          </h1>
          <p className="text-muted-foreground">إدارة المدونات والمقالات المعروضة في الموقع</p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-sm">
          <Plus className="ml-2 h-4 w-4" />
          إضافة مدونة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>قائمة المدونات</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المدونات..."
                className="pr-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">صورة المدونة</TableHead>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">الترتيب</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        لا توجد مدونات
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBlogs.map((blog: Blog) => {
                      const image = blog.image || (typeof blog.imageId === 'object' ? blog.imageId : null);
                      
                      return (
                      <TableRow key={blog._id}>
                        <TableCell>
                          <div className="h-10 w-10 rounded overflow-hidden bg-muted border flex items-center justify-center">
                            {image?.url ? (
                              <img src={getMediaUrl(image.url)} alt={blog.title} className="h-full w-full object-cover" />
                            ) : (
                              <Newspaper className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{blog.title}</TableCell>
                        <TableCell>{blog.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant={blog.isActive ? "default" : "secondary"}>
                            {blog.isActive ? "نشط" : "غير نشط"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(blog)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(blog)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )})
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingBlog ? "تعديل المدونة" : "إضافة مدونة جديدة"}</DialogTitle>
            <DialogDescription>
              {editingBlog ? "تحديث تفاصيل المدونة" : "إضافة مدونة جديدة، يمكنك إضافة صورة للمدونة."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-1">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>صورة المدونة</Label>
                <ImageUpload
                  value={formData.imageId ? [formData.imageId] : []}
                  onChange={(ids) => setFormData({ ...formData, imageId: ids[0] || '' })}
                  multiple={false}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">العنوان *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">محتوى المدونة *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">ترتيب العرض</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min="0"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">نشط (ظاهر في الموقع)</Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBlog ? "تحديث" : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المدونة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{deletingBlog?.title}"؟ لا يمكن التراجع عن هذا الإجراء وسيتم إخفاء المدونة من الموقع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
