import { memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
  'banners': 'اللافتات',
  'messages': 'الرسائل',
  'reviews': 'التقييمات',
  'settings': 'الإعدادات',
  'users': 'المستخدمين',
};

// Isolated component for breadcrumb - only this re-renders on navigation
function BreadcrumbNav() {
  const location = useLocation();
  const pathSegments = location.pathname.replace('/admin', '').split('/').filter(Boolean);
  const currentPage = pathTitles[pathSegments[0] || ''] || 'لوحة التحكم';

  return (
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
  );
}

// Memoized sidebar wrapper
const MemoizedSidebar = memo(AdminSidebar);

function AdminLayoutComponent() {
  return (
    <SidebarProvider>
      <MemoizedSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-mr-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <BreadcrumbNav />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const AdminLayout = memo(AdminLayoutComponent);

export default AdminLayout;

