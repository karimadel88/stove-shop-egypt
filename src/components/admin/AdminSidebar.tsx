import { memo, useCallback, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
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
  Wallet,
  Receipt,
  MessageSquare,
  ArrowLeftRight,
  HelpCircle,
  Newspaper,
  Tags,
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

interface MenuItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
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
  { title: 'طلبات التحويل', path: '/admin/transfers', icon: ArrowLeftRight },
  { title: 'طرق التحويل', path: '/admin/transfer-methods', icon: Wallet },
  { title: 'قواعد الرسوم', path: '/admin/fee-rules', icon: Receipt },
  { title: 'عملاء التحويل', path: '/admin/transfer-customers', icon: Users },
  { title: 'الأسئلة الشائعة', path: '/admin/faqs', icon: HelpCircle },
  { title: 'المدونات', path: '/admin/blogs', icon: Newspaper },
  { title: 'العروض', path: '/admin/offers', icon: Tags },
];

// Isolated menu item component - only this re-renders on navigation
interface MenuItemProps {
  item: MenuItem;
  isExact?: boolean;
}

const MenuItemLink = memo(function MenuItemLink({ item, isExact }: MenuItemProps) {
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.path}
          end={isExact}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <Icon className="h-4 w-4" />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

// Memoized menu list - renders stable list of memoized items
const MenuList = memo(function MenuList() {
  const location = useLocation();
  // Check if current path starts with item path (for active state consistency)
  // But NavLink handles this internally, so we just render the list.
  // We use useMemo for the list generation to be extra safe.
  
  const items = useMemo(() => menuItems.map((item) => (
    <MenuItemLink 
      key={item.path} 
      item={item} 
      isExact={item.path === '/admin'} 
    />
  )), []);

  return (
    <SidebarMenu>
      {items}
    </SidebarMenu>
  );
});

// Memoized sidebar header - never re-renders
const SidebarHeaderContent = memo(function SidebarHeaderContent() {
  return (
    <SidebarHeader className="border-b px-6 py-4">
      <div className="flex items-center gap-2">
        <Store className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">متجر الفتح الالكتروني</span>
      </div>
      <span className="text-xs text-muted-foreground">لوحة الإدارة</span>
    </SidebarHeader>
  );
});

// Memoized footer content - only re-renders if user changes
// Memoized footer content - independently consumes auth context
const SidebarFooterContent = memo(function SidebarFooterContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/admin/login');
  }, [logout, navigate]);

  return (
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
  );
});

function AdminSidebarComponent() {
  return (
    <Sidebar side="right" className="border-l border-r-0">
      <SidebarHeaderContent />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة</SidebarGroupLabel>
          <SidebarGroupContent>
            <MenuList />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooterContent />
    </Sidebar>
  );
}

// Main export - memoized to prevent re-renders from parent
export const AdminSidebar = memo(AdminSidebarComponent);

export default AdminSidebar;


