import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminOffersApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Search, Loader2, Plus, Pencil, Trash2, Tags } from "lucide-react";
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

interface Offer {
  _id: string;
  title: string;
  offer: string;
  imageId?: string | Media;
  image?: Media;
  isActive: boolean;
  sortOrder: number;
}

interface OfferFormData {
  title: string;
  offer: string;
  imageId: string;
  isActive: boolean;
  sortOrder: number;
}

const defaultFormData: OfferFormData = {
  title: "",
  offer: "",
  imageId: "",
  isActive: true,
  sortOrder: 0,
};

export default function AdminOffers() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deletingOffer, setDeletingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>(defaultFormData);

  const { data, isLoading } = useQuery({
    queryKey: ["adminOffers"],
    queryFn: async () => {
      const response = await adminOffersApi.list();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: OfferFormData) => adminOffersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOffers"] });
      toast({ title: "تم التحديث", description: "تم إنشاء العرض بنجاح" });
      setIsFormOpen(false);
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الإنشاء", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: OfferFormData }) => adminOffersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOffers"] });
      toast({ title: "تم التحديث", description: "تم تحديث العرض بنجاح" });
      setIsFormOpen(false);
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء التحديث", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminOffersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOffers"] });
      toast({ title: "تم التحديث", description: "تم حذف العرض بنجاح" });
      setIsDeleteOpen(false);
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الحذف", variant: "destructive" });
    },
  });

  const openCreateDialog = () => {
    setEditingOffer(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditDialog = (offer: Offer) => {
    setEditingOffer(offer);
    const imageId = typeof offer.imageId === 'object' ? offer.imageId._id : 
                   (offer.imageId || (offer.image ? offer.image._id : ""));
    setFormData({
      title: offer.title,
      offer: offer.offer || "",
      imageId: imageId,
      isActive: offer.isActive,
      sortOrder: offer.sortOrder,
    });
    setIsFormOpen(true);
  };

  const openDeleteDialog = (offer: Offer) => {
    setDeletingOffer(offer);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (deletingOffer) {
      deleteMutation.mutate(deletingOffer._id);
    }
  };

  const offersList = Array.isArray(data) ? data : (data?.offers || []);
  const filteredOffers = offersList.filter((offer: Offer) =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 tracking-tight">
            <Tags className="h-7 w-7 sm:h-8 sm:w-8" />
            العروض
          </h1>
          <p className="text-muted-foreground text-sm">إدارة العروض الترويجية والخصومات المعروضة في الموقع</p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-sm w-full sm:w-auto">
          <Plus className="ml-2 h-4 w-4" />
          إضافة عرض جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>قائمة العروض</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في العروض..."
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
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">صورة العرض</TableHead>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">العرض (نسبة/وصف)</TableHead>
                    <TableHead className="text-right">الترتيب</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        لا توجد عروض
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOffers.map((offer: Offer) => {
                      const image = offer.image || (typeof offer.imageId === 'object' ? offer.imageId : null);
                      
                      return (
                      <TableRow key={offer._id}>
                        <TableCell>
                          <div className="h-10 w-16 rounded overflow-hidden bg-muted border flex items-center justify-center">
                            {image?.url ? (
                              <img src={getMediaUrl(image.url)} alt={offer.title} className="h-full w-full object-cover" />
                            ) : (
                              <Tags className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{offer.title}</TableCell>
                        <TableCell>{offer.offer}</TableCell>
                        <TableCell>{offer.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant={offer.isActive ? "default" : "secondary"}>
                            {offer.isActive ? "نشط" : "غير نشط"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(offer)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(offer)}
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
        <DialogContent className="max-w-xl w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>{editingOffer ? "تعديل العرض" : "إضافة عرض جديد"}</DialogTitle>
            <DialogDescription>
              {editingOffer ? "تحديث تفاصيل العرض" : "إضافة عرض جديد، يمكنك إضافة صورة خاصة بالعرض."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-1">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>صورة العرض (تظهر في البانر)</Label>
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
                  placeholder="مثال: خصومات الصيف"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="offer">نص العرض *</Label>
                <Input
                  id="offer"
                  placeholder="مثال: خصم 20% على الثلاجات"
                  value={formData.offer}
                  onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {editingOffer ? "تحديث" : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف العرض</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{deletingOffer?.title}"؟ لا يمكن التراجع عن هذا الإجراء وسيتم إخفاء العرض من الموقع.
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
