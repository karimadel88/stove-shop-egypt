import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '@/lib/api';
import { DashboardStats, Order } from '@/types/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  Clock,
  AlertTriangle,
  ArrowLeft,
  TrendingUp,
  Activity,
  CreditCard,
  Target
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for the chart (since API doesn't provide history yet)
const mockRevenueData = [
  { name: 'يناير', total: 4500 },
  { name: 'فبراير', total: 5200 },
  { name: 'مارس', total: 4800 },
  { name: 'أبريل', total: 6100 },
  { name: 'مايو', total: 5500 },
  { name: 'يونيو', total: 7500 },
  { name: 'يوليو', total: 7200 },
];

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80',
  confirmed: 'bg-blue-100 text-blue-700 hover:bg-blue-100/80',
  processing: 'bg-purple-100 text-purple-700 hover:bg-purple-100/80',
  shipped: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-100/80',
  delivered: 'bg-green-100 text-green-700 hover:bg-green-100/80',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-100/80',
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          dashboardApi.stats(),
          dashboardApi.recentOrders(5),
          dashboardApi.topProducts(5),
        ]);
        
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data || []);
        setTopProducts(productsRes.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'فشل في تحميل بيانات لوحة التحكم');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'إجمالي الإيرادات',
      value: stats?.totalRevenue ?? 0,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100',
      format: (v: number) => `${v.toLocaleString('ar-EG')} ج.م`,
      desc: '+20.1% من الشهر الماضي'
    },
    {
      title: 'إجمالي الطلبات',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      desc: '+180 طلب جديد'
    },
    {
      title: 'العملاء النشطين',
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      desc: '+19 عميل جديد'
    },
    {
      title: 'إجمالي المنتجات',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      desc: '12 منتج نفد مخزونها'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">نظرة عامة</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">مرحباً بك مرة أخرى، إليك ما يحدث في متجرك اليوم.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">آخر 30 يوم</span>
          </Button>
          <Button className="gap-2 text-sm">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">تقرير مفصل</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card key={i} className="hover:shadow-lg transition-all duration-300 border-none shadow-soft group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {card.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl ${card.bg} transition-transform group-hover:scale-110 shadow-sm`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mb-2" />
              ) : (
                <>
                  <div className="text-2xl font-bold mb-1 text-foreground">
                    {card.format ? card.format(card.value) : card.value.toLocaleString('ar-EG')}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {card.desc}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        {/* Chart Section */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>نظرة عامة على الإيرادات</CardTitle>
            <CardDescription>
              عرض الإيرادات الشهرية للسنة الحالية
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
            <CardDescription>
              المنتجات الأكثر طلباً هذا الشهر
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground h-[350px]">
                <Package className="h-10 w-10 mb-2 opacity-20" />
                <p>لا توجد بيانات مبيعات بعد</p>
              </div>
            ) : (
              <div className="space-y-6">
                {topProducts
                  .filter(p => (p.totalSold || 0) > 0)
                  .map((product, index, filteredArray) => {
                  // Calculate percentage relative to top product (or arbitrary max)
                  const maxSold = Math.max(...filteredArray.map(p => p.totalSold || 0), 1);
                  const sales = product.totalSold || 0;
                  const percentage = (sales / maxSold) * 100;
                  
                  return (
                    <div key={product.productId || product._id || index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ring-2 ring-white shadow-sm
                            ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                              index === 1 ? 'bg-slate-100 text-slate-700' : 
                              index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-muted text-muted-foreground'
                            }`}>
                            {index + 1}
                           </div>
                           <div className="font-medium text-sm">{product.productName || product.name}</div>
                        </div>
                        <div className="font-medium text-sm">
                          {sales.toLocaleString()} مبيعات
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
                {topProducts.filter(p => (p.totalSold || 0) > 0).length === 0 && (
                   <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <p>لا توجد مبيعات مسجلة حتى الآن</p>
                   </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>الطلبات الحديثة</CardTitle>
              <CardDescription>
                آخر الطلبات المسجلة في المتجر
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/orders">
                عرض كل الطلبات <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                لا توجد طلبات بعد
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order._id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium font-mono text-primary">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shadow-sm">
                            {order.customerDetails.firstName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{order.customerDetails.firstName} {order.customerDetails.lastName}</p>
                            <p className="text-xs text-muted-foreground">{order.customerDetails.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`font-normal px-2.5 py-0.5 ${statusColors[order.status]}`}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left font-bold text-foreground">
                        {(order.total || 0).toLocaleString('ar-EG')} ج.م
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

       {/* Alerts & Quick Stats */}
       <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
         <Card className="bg-orange-50 border-orange-100">
           <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">تنبيهات المخزون</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{stats?.lowStockProducts || 0}</p>
                <p className="text-xs text-orange-600 mt-1">منتجات قاربت على النفاذ</p>
              </div>
              <div className="p-3 bg-white rounded-full">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
           </CardContent>
         </Card>
         
         <Card className="bg-blue-50 border-blue-100">
           <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">طلبات قيد الانتظار</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats?.pendingOrders || 0}</p>
                <p className="text-xs text-blue-600 mt-1">بحاجة إلى اتخاذ إجراء</p>
              </div>
              <div className="p-3 bg-white rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
           </CardContent>
         </Card>

         <Card className="bg-purple-50 border-purple-100">
           <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">متوسط قيمة الطلب</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                   {stats && stats.totalOrders > 0 
                     ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() 
                     : 0} ج.م
                </p>
                <p className="text-xs text-purple-600 mt-1">لكل عملية بيع ناجحة</p>
              </div>
              <div className="p-3 bg-white rounded-full">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
           </CardContent>
         </Card>

         <Card className="bg-green-50 border-green-100">
           <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">معدل التحويل</p>
                <p className="text-2xl font-bold text-green-900 mt-1">2.4%</p>
                <p className="text-xs text-green-600 mt-1">زيادة بنسبة 0.4%</p>
              </div>
              <div className="p-3 bg-white rounded-full">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
           </CardContent>
         </Card>
       </div>
    </div>
  );
}
