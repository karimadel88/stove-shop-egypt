import { useState } from 'react';
import { Link } from 'react-router-dom';
import { transferApi } from '@/lib/api';
import { TransferOrder, TransferOrderStatus, PaginatedResponse } from '@/types/admin';
import TransferStatusBadge from '@/components/transfer/TransferStatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ClipboardList, Search, Loader2, ArrowLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
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

function getMethodName(method: any): string {
  if (typeof method === 'object' && method?.name) return method.name;
  return String(method);
}

export default function TransferOrders() {
  const [phone, setPhone] = useState('');
  const [searchedPhone, setSearchedPhone] = useState('');
  const [orders, setOrders] = useState<TransferOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<TransferOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchOrders = async (phoneNum: string, pageNum: number, status?: string) => {
    if (!phoneNum) {
      toast.error('يرجى إدخال رقم الهاتف');
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const params: any = { phone: phoneNum, page: pageNum, limit: 10 };
      if (status && status !== 'ALL') params.status = status;
      const res = await transferApi.getOrders(params);
      const data: PaginatedResponse<TransferOrder> = res.data;
      setOrders(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحميل الطلبات');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchedPhone(phone);
    fetchOrders(phone, 1, statusFilter);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    if (searchedPhone) {
      fetchOrders(searchedPhone, 1, value);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders(searchedPhone, newPage, statusFilter);
  };

  const openDetail = (order: TransferOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-8 w-8" />
            طلباتي
          </h1>
          <p className="text-muted-foreground mt-1">تتبع حالة طلبات التحويل</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/transfer">
            <ArrowLeftRight className="ml-2 h-4 w-4" />
            تحويل جديد
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                placeholder="01012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading || !phone}>
              {isLoading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Search className="ml-2 h-4 w-4" />}
              بحث
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">
              الطلبات ({total})
            </CardTitle>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
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
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد طلبات</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">التحويل</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                        <TableHead className="text-right">الرسوم</TableHead>
                        <TableHead className="text-right">الإجمالي</TableHead>
                        <TableHead className="text-center">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow
                          key={order._id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openDetail(order)}
                        >
                          <TableCell className="text-sm whitespace-nowrap">
                            {format(new Date(order.createdAt), 'dd/MM/yyyy', { locale: ar })}
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {getMethodName(order.fromMethodId)} → {getMethodName(order.toMethodId)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {order.amount.toLocaleString('ar-EG')} ج.م
                          </TableCell>
                          <TableCell className="text-sm">
                            {order.fee.toLocaleString('ar-EG')} ج.م
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {order.total.toLocaleString('ar-EG')} ج.م
                          </TableCell>
                          <TableCell className="text-center">
                            <TransferStatusBadge status={order.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => handlePageChange(page - 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      صفحة {page} من {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
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
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">التاريخ</span>
                <span>{format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm', { locale: ar })}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
