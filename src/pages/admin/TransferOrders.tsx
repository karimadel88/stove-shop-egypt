import { useEffect, useState } from 'react';
import { adminTransferApi } from '@/lib/api';
import { TransferOrder, TransferOrderStatus, PaginatedResponse } from '@/types/admin';
import TransferStatusBadge from '@/components/transfer/TransferStatusBadge';
import WhatsAppButton from '@/components/transfer/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeftRight, Search, Loader2, Copy, ChevronLeft, ChevronRight, Pencil, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const statusOptions: { value: string; label: string }[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'SUBMITTED', label: 'تم الإرسال' },
  { value: 'IN_PROGRESS', label: 'قيد التنفيذ' },
  { value: 'COMPLETED', label: 'مكتمل' },
  { value: 'CANCELLED', label: 'ملغي' },
  { value: 'REJECTED', label: 'مرفوض' },
];

const allowedTransitions: Record<string, string[]> = {
  SUBMITTED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'REJECTED'],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

function getMethodName(method: any): string {
  if (typeof method === 'object' && method?.name) return method.name;
  return String(method);
}

export default function AdminTransferOrders() {
  const [orders, setOrders] = useState<TransferOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail / notes dialog
  const [selectedOrder, setSelectedOrder] = useState<TransferOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappData, setWhatsappData] = useState<any>(null);

  const fetchOrders = async (pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const params: any = { page: pageNum, limit: 15 };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      const res = await adminTransferApi.listOrders(params);
      const data: PaginatedResponse<TransferOrder> = res.data;
      setOrders(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحميل التحويلات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearch = () => {
    fetchOrders(1);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await adminTransferApi.updateOrderStatus(orderId, newStatus);
      toast.success('تم تحديث الحالة بنجاح');
      fetchOrders(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحديث الحالة');
    }
  };

  const openDetail = async (order: TransferOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
    try {
      const res = await adminTransferApi.getOrder(order._id);
      setSelectedOrder(res.data.order || res.data);
      setWhatsappData(res.data.whatsapp || null);
    } catch {
      // keep the original order data
    }
  };

  const openNotes = (order: TransferOrder) => {
    setSelectedOrder(order);
    setAdminNotes(order.adminNotes || '');
    setIsNotesOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    setIsSubmitting(true);
    try {
      await adminTransferApi.updateOrderNotes(selectedOrder._id, adminNotes);
      toast.success('تم حفظ الملاحظات');
      setIsNotesOpen(false);
      fetchOrders(page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في حفظ الملاحظات');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyWhatsappMessage = async (order: TransferOrder) => {
    try {
      const res = await adminTransferApi.getOrder(order._id);
      const wa = res.data.whatsapp;
      if (wa?.messageText) {
        await navigator.clipboard.writeText(wa.messageText);
        toast.success('تم نسخ رسالة واتساب');
      } else {
        toast.error('لا توجد رسالة واتساب متاحة');
      }
    } catch {
      toast.error('فشل في نسخ الرسالة');
    }
  };

  const openWhatsapp = async (order: TransferOrder) => {
    try {
      const res = await adminTransferApi.getOrder(order._id);
      const wa = res.data.whatsapp;
      if (wa?.whatsappUrl) {
        window.open(wa.whatsappUrl, '_blank');
      }
    } catch {
      toast.error('فشل في فتح واتساب');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ArrowLeftRight className="h-8 w-8" />
          طلبات التحويل
        </h1>
        <p className="text-muted-foreground">إدارة ومتابعة جميع طلبات التحويل</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="text-base">الطلبات ({total})</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex gap-2 flex-1 sm:flex-initial">
                <Input
                  placeholder="بحث برقم الطلب أو الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full sm:w-56"
                />
                <Button variant="outline" size="icon" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد طلبات تحويل</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الطلب</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">التحويل</TableHead>
                      <TableHead className="text-right">المبلغ</TableHead>
                      <TableHead className="text-right">الرسوم</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: ar })}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {getMethodName(order.fromMethodId)} → {getMethodName(order.toMethodId)}
                        </TableCell>
                        <TableCell className="text-sm">{order.amount.toLocaleString('ar-EG')}</TableCell>
                        <TableCell className="text-sm">{order.fee.toLocaleString('ar-EG')}</TableCell>
                        <TableCell className="text-sm font-medium">{order.total.toLocaleString('ar-EG')}</TableCell>
                        <TableCell className="text-center">
                          {allowedTransitions[order.status]?.length > 0 ? (
                            <Select
                              value={order.status}
                              onValueChange={(val) => handleStatusUpdate(order._id, val)}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <TransferStatusBadge status={order.status} />
                              </SelectTrigger>
                              <SelectContent>
                                {allowedTransitions[order.status]?.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    <TransferStatusBadge status={s as TransferOrderStatus} />
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <TransferStatusBadge status={order.status} />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(order)} title="التفاصيل">
                              <Search className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openNotes(order)} title="ملاحظات">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyWhatsappMessage(order)} title="نسخ رسالة واتساب">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => openWhatsapp(order)} title="فتح واتساب">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchOrders(page - 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchOrders(page + 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-3 py-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم الطلب</span>
                <span className="font-bold text-primary">{selectedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الحالة</span>
                <TransferStatusBadge status={selectedOrder.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">من</span>
                <span>{getMethodName(selectedOrder.fromMethodId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">إلى</span>
                <span>{getMethodName(selectedOrder.toMethodId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ</span>
                <span>{selectedOrder.amount.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الرسوم</span>
                <span>{selectedOrder.fee.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>الإجمالي</span>
                <span className="text-primary">{selectedOrder.total.toLocaleString('ar-EG')} ج.م</span>
              </div>
              {selectedOrder.customerName && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الاسم</span>
                  <span>{selectedOrder.customerName}</span>
                </div>
              )}
              {selectedOrder.customerPhone && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الهاتف</span>
                  <span dir="ltr">{selectedOrder.customerPhone}</span>
                </div>
              )}
              {selectedOrder.adminNotes && (
                <div className="text-sm border-t pt-2">
                  <span className="text-muted-foreground block mb-1">ملاحظات الإدارة</span>
                  <p className="bg-muted p-2 rounded text-sm">{selectedOrder.adminNotes}</p>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">التاريخ</span>
                <span>{format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}</span>
              </div>
              {whatsappData?.whatsappUrl && (
                <WhatsAppButton
                  whatsappUrl={whatsappData.whatsappUrl}
                  label="فتح واتساب"
                  className="w-full mt-2"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ملاحظات الإدارة - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label htmlFor="adminNotes">الملاحظات</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                placeholder="أضف ملاحظات حول هذا الطلب..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesOpen(false)}>إلغاء</Button>
            <Button onClick={handleSaveNotes} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
