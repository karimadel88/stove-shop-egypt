import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminTransferApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface TransferCustomer {
  _id: string;
  name: string;
  phone: string;
  whatsapp: string;
  isActive: boolean;
  totalOrders: number;
  totalTransferred: number;
  createdAt: string;
}

export default function TransferCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["adminTransferCustomers"],
    queryFn: async () => {
      const response = await adminTransferApi.listCustomers();
      return response.data;
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminTransferApi.toggleCustomerActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTransferCustomers"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة العميل بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة العميل",
        variant: "destructive"
      });
    }
  });

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !currentStatus });
  };

  const customersList = Array.isArray(data) ? data : (data?.customers || []);
  const filteredCustomers = customersList.filter((customer: TransferCustomer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">عملاء التحويل</h1>
          <p className="text-muted-foreground">
            إدارة عملاء خدمة تحويل الأموال
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالاسم أو رقم الهاتف..."
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
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">رقم الهاتف</TableHead>
                    <TableHead className="text-right">واتس آب</TableHead>
                    <TableHead className="text-right">تاريخ التسجيل</TableHead>
                    <TableHead className="text-right">إجمالي الطلبات</TableHead>
                    <TableHead className="text-right">إجمالي التحويلات</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإيقاف / التفعيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24">
                        لا يوجد عملاء
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer: TransferCustomer) => (
                      <TableRow key={customer._id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell dir="ltr" className="text-right">{customer.phone}</TableCell>
                        <TableCell dir="ltr" className="text-right">{customer.whatsapp}</TableCell>
                        <TableCell>
                          {format(new Date(customer.createdAt), 'dd MMMM yyyy', { locale: ar })}
                        </TableCell>
                        <TableCell>{customer.totalOrders || 0}</TableCell>
                        <TableCell>
                          {(customer.totalTransferred || 0).toLocaleString()} ج.م
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.isActive ? "default" : "destructive"}>
                            {customer.isActive ? "نشط" : "موقوف"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={customer.isActive}
                              onCheckedChange={() => handleToggleActive(customer._id, customer.isActive)}
                              disabled={toggleActiveMutation.isPending}
                            />
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
    </div>
  );
}
