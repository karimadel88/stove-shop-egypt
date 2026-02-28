import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { faqsApi } from "@/lib/api";
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
import { Search, Loader2, Plus, Pencil, Trash2, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
}

interface FaqFormData {
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
}

const defaultFormData: FaqFormData = {
  question: "",
  answer: "",
  isActive: true,
  sortOrder: 0,
};

export default function Faqs() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState<FaqFormData>(defaultFormData);

  const { data, isLoading } = useQuery({
    queryKey: ["adminFaqs"],
    queryFn: async () => {
      const response = await faqsApi.list();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FaqFormData) => faqsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFaqs"] });
      toast({ title: "تم التحديث", description: "تم إنشاء السؤال بنجاح" });
      setIsFormOpen(false);
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الإنشاء", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FaqFormData }) => faqsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFaqs"] });
      toast({ title: "تم التحديث", description: "تم تحديث السؤال بنجاح" });
      setIsFormOpen(false);
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء التحديث", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faqsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminFaqs"] });
      toast({ title: "تم التحديث", description: "تم حذف السؤال بنجاح" });
      setIsDeleteOpen(false);
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الحذف", variant: "destructive" });
    },
  });

  const openCreateDialog = () => {
    setEditingFaq(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditDialog = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      isActive: faq.isActive,
      sortOrder: faq.sortOrder,
    });
    setIsFormOpen(true);
  };

  const openDeleteDialog = (faq: FAQ) => {
    setDeletingFaq(faq);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaq) {
      updateMutation.mutate({ id: editingFaq._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (deletingFaq) {
      deleteMutation.mutate(deletingFaq._id);
    }
  };

  const faqsList = Array.isArray(data) ? data : (data?.faqs || []);
  const filteredFaqs = faqsList.filter((faq: FAQ) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 tracking-tight">
            <HelpCircle className="h-8 w-8" />
            الأسئلة الشائعة
          </h1>
          <p className="text-muted-foreground">إدارة الأسئلة الشائعة المعروضة في الموقع</p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-sm">
          <Plus className="ml-2 h-4 w-4" />
          إضافة سؤال جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>قائمة الأسئلة</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الأسئلة..."
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
                    <TableHead className="text-right">السؤال</TableHead>
                    <TableHead className="text-right">الترتيب</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaqs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        لا توجد أسئلة
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFaqs.map((faq: FAQ) => (
                      <TableRow key={faq._id}>
                        <TableCell className="font-medium">{faq.question}</TableCell>
                        <TableCell>{faq.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant={faq.isActive ? "default" : "secondary"}>
                            {faq.isActive ? "نشط" : "غير نشط"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(faq)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openDeleteDialog(faq)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFaq ? "تعديل السؤال" : "إضافة سؤال جديد"}</DialogTitle>
            <DialogDescription>
              {editingFaq ? "تحديث تفاصيل السؤال" : "إضافة سؤال جديد للأسئلة الشائعة"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="question">السؤال *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">الإجابة *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                  rows={4}
                />
              </div>

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
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingFaq ? "تحديث" : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف السؤال</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{deletingFaq?.question}"؟
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
