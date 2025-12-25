import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useLocation } from 'react-router-dom';

const pathTitles: Record<string, string> = {
  '': 'لوحة التحكم',
  'products': 'المنتجات',
  'categories': 'التصنيفات',
  'orders': 'الطلبات',
  'customers': 'العملاء',
  'coupons': 'الكوبونات',
  'shipping': 'الشحن',
  'locations': 'المواقع',
  'media': 'الوسائط',
  'reviews': 'التقييمات',
  'settings': 'الإعدادات',
  'users': 'المستخدمين',
};

export function AdminLayout() {
  const location = useLocation();
  const pathSegments = location.pathname.replace('/admin', '').split('/').filter(Boolean);
  const currentPage = pathTitles[pathSegments[0] || ''] || 'لوحة التحكم';

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-mr-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">الإدارة</BreadcrumbLink>
              </BreadcrumbItem>
              {currentPage !== 'لوحة التحكم' && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AdminLayout;
