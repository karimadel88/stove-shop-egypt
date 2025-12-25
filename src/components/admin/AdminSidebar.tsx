import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Ticket,
  Truck,
  MapPin,
  Image,
  Star,
  Settings,
  UserCog,
  LogOut,
  Store,
  MessageSquare,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'لوحة التحكم', path: '/admin', icon: LayoutDashboard },
  { title: 'المنتجات', path: '/admin/products', icon: Package },
  { title: 'التصنيفات', path: '/admin/categories', icon: Layers },
  { title: 'الطلبات', path: '/admin/orders', icon: ShoppingCart },
  { title: 'العملاء', path: '/admin/customers', icon: Users },
  { title: 'الكوبونات', path: '/admin/coupons', icon: Ticket },
  { title: 'الشحن', path: '/admin/shipping', icon: Truck },
  { title: 'المواقع', path: '/admin/locations', icon: MapPin },
  { title: 'اللافتات', path: '/admin/banners', icon: Image },
  { title: 'الرسائل', path: '/admin/messages', icon: MessageSquare },
  { title: 'التقييمات', path: '/admin/reviews', icon: Star },
  { title: 'الإعدادات', path: '/admin/settings', icon: Settings },
  { title: 'المستخدمين', path: '/admin/users', icon: UserCog },
];

export function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <Sidebar side="right" className="border-l border-r-0">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">متجر الفتح الالكتروني</span>
        </div>
        <span className="text-xs text-muted-foreground">لوحة الإدارة</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      end={item.path === '/admin'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AdminSidebar;
