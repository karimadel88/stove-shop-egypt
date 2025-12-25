import { useEffect, useState } from 'react';
import { reviewsApi } from '@/lib/api';
import { Review } from '@/types/admin';
import { Button } from '@/components/ui/button';
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
import { Star, Check, X, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await reviewsApi.list();
      setReviews(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحميل التقييمات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (review: Review) => {
    try {
      await reviewsApi.approve(review._id);
      toast.success('تم قبول التقييم');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في قبول التقييم');
    }
  };

  const handleReject = async (review: Review) => {
    try {
      await reviewsApi.reject(review._id);
      toast.success('تم رفض التقييم');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في رفض التقييم');
    }
  };

  const handleDelete = async () => {
    if (!deletingReview) return;
    try {
      await reviewsApi.delete(deletingReview._id);
      toast.success('تم حذف التقييم');
      setIsDeleteOpen(false);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حذف التقييم');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const pendingReviews = reviews.filter((r) => !r.isApproved);
  const approvedReviews = reviews.filter((r) => r.isApproved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Star className="h-8 w-8" />
          التقييمات
        </h1>
        <p className="text-muted-foreground">إدارة تقييمات العملاء</p>
      </div>

      {/* Pending Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            بانتظار الموافقة
            {pendingReviews.length > 0 && (
              <Badge variant="destructive">{pendingReviews.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : pendingReviews.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">لا توجد تقييمات معلقة</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المنتج</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">التقييم</TableHead>
                  <TableHead className="text-right">المراجعة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell className="text-right py-4 font-bold text-primary">
                        {review.product?.name || 'منتج غير معروف'}
                      </TableCell>
                      <TableCell className="text-right">
                        {review.customer?.firstName} {review.customer?.lastName}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-start">
                          {renderStars(review.rating)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-right">
                        {review.title || review.comment || '-'}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {format(new Date(review.createdAt), 'd MMM', { locale: ar })}
                      </TableCell>
                      <TableCell className="text-left py-4 px-4">
                        <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => { setSelectedReview(review); setIsDetailsOpen(true); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleApprove(review)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleReject(review)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => { setDeletingReview(review); setIsDeleteOpen(true); }}
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

      {/* Approved Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>التقييمات المقبولة ({approvedReviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : approvedReviews.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">لا توجد تقييمات مقبولة</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المنتج</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">التقييم</TableHead>
                  <TableHead className="text-right">المراجعة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedReviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell className="font-medium">
                      {review.product?.name || 'منتج غير معروف'}
                    </TableCell>
                    <TableCell>
                      {review.customer?.firstName} {review.customer?.lastName}
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {review.title || review.comment || '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(review.createdAt), 'd MMM yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => { setSelectedReview(review); setIsDetailsOpen(true); }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => { setDeletingReview(review); setIsDeleteOpen(true); }}
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

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل التقييم</DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">المنتج</p>
                <p className="font-medium">{selectedReview.product?.name || 'غير معروف'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">العميل</p>
                <p className="font-medium">
                  {selectedReview.customer?.firstName} {selectedReview.customer?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">التقييم</p>
                {renderStars(selectedReview.rating)}
              </div>
              {selectedReview.title && (
                <div>
                  <p className="text-sm text-muted-foreground">العنوان</p>
                  <p className="font-medium">{selectedReview.title}</p>
                </div>
              )}
              {selectedReview.comment && (
                <div>
                  <p className="text-sm text-muted-foreground">التعليق</p>
                  <p>{selectedReview.comment}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge variant={selectedReview.isApproved ? 'default' : 'secondary'}>
                  {selectedReview.isApproved ? 'مقبول' : 'معلق'}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف التقييم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا التقييم؟
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
