import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  CheckCircle2, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  BrickWall,
  Search,
  Settings2,
  Users,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthGuard';
import { RefreshCw } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
}

export default function Layout({ children, user }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { signOut } = useAuth();
  const location = useLocation();

  const isPublicRoute = location.pathname === '/portal' || location.pathname.startsWith('/project/');

  const handleLogout = async () => {
    await signOut();
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all demo data? This will clear your local storage.')) {
      localStorage.removeItem('brick_store_demo_data');
      window.location.reload();
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects Portal', href: '/portal', icon: Search },
    { name: 'Submit Project', href: '/submit', icon: PlusCircle },
  ];

  if (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') {
    navItems.push({ name: 'Admin Approval', href: '/admin', icon: CheckCircle2 });
    navItems.push({ name: 'Configuration', href: '/config', icon: Settings2 });
    navItems.push({ name: 'User Management', href: '/users', icon: Users });
  }

  if (user?.role === 'SUPERADMIN') {
    navItems.push({ name: 'Superadmin Approval', href: '/superadmin', icon: ShieldCheck });
  }

  // Public Layout (for customers)
  if (isPublicRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 md:px-8 h-20 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            {!location.pathname.startsWith('/project/') ? (
              <div className="flex items-center gap-4">
                <img 
                  src="https://jjbricks.com/dashdesk/files/configuration//logo_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/logo-main%20-%20Copy.png" 
                  alt="Jay Jalaram Brick Works" 
                  className="h-12 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="h-8 w-px bg-gray-200" />
                <img 
                  src="https://jjbricks.com/dashdesk/files/configuration//footer_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/bric_logo.png" 
                  alt="Brick Logo" 
                  className="h-12 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Portal
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <Link to="/">
                <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="outline-none">
                  <Avatar className="h-8 w-8 border border-slate-200">
                    <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                    <AvatarFallback className="bg-orange-50 text-orange-600 text-xs font-bold">
                      {user?.displayName?.charAt(0) || 'G'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              } />
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuItem onClick={() => window.location.href = '/'}>Dashboard</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">Log out</DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => window.location.reload()}>Login</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 py-12 px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-gray-500 text-sm">
            <div className="flex items-center gap-4">
              <img 
                src="https://jjbricks.com/dashdesk/files/configuration//footer_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/bric_logo.png" 
                alt="Brick Logo" 
                className="h-16 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-bold text-gray-900 text-lg uppercase tracking-tight">THE BRICK STORE</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Jay Jalaram Brick Works</p>
              </div>
            </div>
            <div className="text-right">
              <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
              <p className="text-[9px] mt-1 uppercase tracking-widest font-bold opacity-60">Quality Architectural Bricks</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col bg-white border-r border-gray-200 sticky top-0 h-screen z-50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className={cn(
          "p-6 flex items-center border-b border-gray-50 relative",
          isCollapsed ? "justify-center" : "gap-4"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3 animate-in fade-in duration-500">
              <img 
                src="https://jjbricks.com/dashdesk/files/configuration//logo_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/logo-main%20-%20Copy.png" 
                alt="Jay Jalaram Brick Works" 
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="h-6 w-px bg-gray-200" />
              <img 
                src="https://jjbricks.com/dashdesk/files/configuration//footer_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/bric_logo.png" 
                alt="Brick Logo" 
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20 shrink-0">
              <BrickWall className="h-6 w-6 text-white" />
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 transition-colors z-10"
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/10"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-colors shrink-0",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                )} />
                {!isCollapsed && (
                  <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.name}
                  </span>
                )}
                
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className={cn(
                "w-full flex items-center rounded-xl hover:bg-slate-50 transition-colors text-left outline-none",
                isCollapsed ? "justify-center p-2" : "gap-3 p-3"
              )}>
                <Avatar className="h-10 w-10 border-2 border-white shadow-sm shrink-0">
                  <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                  </div>
                )}
              </button>
            }>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side={isCollapsed ? "right" : "bottom"} sideOffset={10}>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleResetData} className="cursor-pointer">
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Reset Demo Data</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://jjbricks.com/dashdesk/files/configuration//logo_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/logo-main%20-%20Copy.png" 
            alt="Logo" 
            className="h-8 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="h-5 w-px bg-gray-200" />
          <img 
            src="https://jjbricks.com/dashdesk/files/configuration//footer_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/bric_logo.png" 
            alt="Brick Logo" 
            className="h-8 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </button>
            } />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleResetData}>Reset Demo Data</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://jjbricks.com/dashdesk/files/configuration//logo_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/logo-main%20-%20Copy.png" 
                alt="Logo" 
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="h-6 w-px bg-gray-200" />
              <img 
                src="https://jjbricks.com/dashdesk/files/configuration//footer_file/5c2a7cd1-e61c-4110-835d-0d8cbf642048/bric_logo.png" 
                alt="Brick Logo" 
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-8 w-8 text-slate-400" />
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Brick Store IPMS. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase tracking-wider">
                {user?.role} Mode
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
