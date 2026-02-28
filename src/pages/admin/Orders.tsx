import { useEffect, useState } from 'react';
import { ordersApi } from '@/lib/api';
import { Order, PaginatedResponse, OrderStatus, PaymentStatus } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

const paymentLabels: Record<PaymentStatus, string> = {
  pending: 'معلق',
  paid: 'مدفوع',
  failed: 'فشل',
  refunded: 'مسترد',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  processing: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  shipped: 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30',
  delivered: 'bg-green-500/20 text-green-600 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-600 border-red-500/30',
};

const paymentColors: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600',
  paid: 'bg-green-500/20 text-green-600',
  failed: 'bg-red-500/20 text-red-600',
  refunded: 'bg-gray-500/20 text-gray-600',
};

const orderStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatuses: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await ordersApi.list(params);
      const data: PaginatedResponse<Order> = response.data;
      setOrders(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحميل الطلبات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const openDetailsDialog = async (order: Order) => {
    try {
      const response = await ordersApi.get(order._id);
      setSelectedOrder(response.data);
      setIsDetailsOpen(true);
    } catch (error: any) {
      toast.error('فشل في تحميل تفاصيل الطلب');
    }
  };

  const handleStatusChange = async (status: OrderStatus) => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      await ordersApi.updateStatus(selectedOrder._id, status);
      toast.success('تم تحديث حالة الطلب');
      setSelectedOrder({ ...selectedOrder, status });
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحديث الحالة');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (paymentStatus: PaymentStatus) => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      await ordersApi.updatePaymentStatus(selectedOrder._id, paymentStatus);
      toast.success('تم تحديث حالة الدفع');
      setSelectedOrder({ ...selectedOrder, paymentStatus });
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحديث حالة الدفع');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddTracking = async (trackingNumber: string) => {
    if (!selectedOrder || !trackingNumber) return;
    setIsUpdating(true);
    try {
      await ordersApi.addTracking(selectedOrder._id, trackingNumber);
      toast.success('تم إضافة رقم التتبع');
      setSelectedOrder({ ...selectedOrder, trackingNumber });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في إضافة رقم التتبع');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 sm:h-8 sm:w-8" />
            الطلبات
          </h1>
          <p className="text-muted-foreground text-sm">إدارة طلبات العملاء</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>الطلبات ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لم يتم العثور على طلبات</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                    <TableHead className="text-center">الدفع</TableHead>
                    <TableHead className="text-left py-3 px-4">الإجمالي</TableHead>
                    <TableHead className="text-left py-3 px-4">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-mono font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.customerDetails.firstName} {order.customerDetails.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.customerDetails.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), 'd MMM yyyy', { locale: ar })}
                      </TableCell>
                    <TableCell className="text-center">
                        <Badge className={cn(statusColors[order.status], "whitespace-nowrap")}>
                          {statusLabels[order.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(paymentColors[order.paymentStatus], "whitespace-nowrap")}>
                          {paymentLabels[order.paymentStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left font-bold text-primary whitespace-nowrap py-4 px-4">
                        {order.total.toLocaleString('ar-EG')} ج.م
                      </TableCell>
                      <TableCell className="text-left py-4 px-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openDetailsDialog(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>طلب رقم {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              {selectedOrder && format(new Date(selectedOrder.createdAt), 'd MMMM yyyy - h:mm a', { locale: ar })}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status Updates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>حالة الطلب</Label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleStatusChange(value as OrderStatus)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>حالة الدفع</Label>
                  <Select
                    value={selectedOrder.paymentStatus}
                    onValueChange={(value) => handlePaymentStatusChange(value as PaymentStatus)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {paymentLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tracking */}
              <div className="space-y-2">
                <Label>رقم التتبع</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="أدخل رقم التتبع"
                    defaultValue={selectedOrder.trackingNumber || ''}
                    id="tracking-input"
                    dir="ltr"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('tracking-input') as HTMLInputElement;
                      handleAddTracking(input.value);
                    }}
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">العميل</h4>
                  <div className="text-sm space-y-1">
                    <p>{selectedOrder.customerDetails.firstName} {selectedOrder.customerDetails.lastName}</p>
                    <p className="text-muted-foreground">{selectedOrder.customerDetails.email}</p>
                    <p className="text-muted-foreground">{selectedOrder.customerDetails.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">عنوان الشحن</h4>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <p>{selectedOrder.shippingAddress.street}</p>
                    <p>{selectedOrder.shippingAddress.cityName}، {selectedOrder.shippingAddress.country}</p>
                    {selectedOrder.shippingAddress.postalCode && (
                      <p>{selectedOrder.shippingAddress.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">المنتجات</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package text-muted-foreground"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-10"/></svg>';
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{item.total.toLocaleString('ar-EG')} ج.م</p>
                        <p className="text-sm text-muted-foreground">
                          {item.price.toLocaleString('ar-EG')} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span>{selectedOrder.subtotal.toLocaleString('ar-EG')} ج.م</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم</span>
                    <span>-{selectedOrder.discount.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    الشحن ({selectedOrder.shippingMethodName})
                  </span>
                  <span>{selectedOrder.shippingCost.toLocaleString('ar-EG')} ج.م</span>
                </div>
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الضريبة</span>
                    <span>{selectedOrder.tax.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي</span>
                  <span>{selectedOrder.total.toLocaleString('ar-EG')} ج.م</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">ملاحظات</h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
