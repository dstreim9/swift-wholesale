import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Package, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartPanel from "@/components/CartPanel";

const DashboardLayout = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Nav */}
      <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg wholesale-gradient flex items-center justify-center">
            <Package className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Wholesale Portal</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">|</span>
          <div className="items-center gap-1.5 text-muted-foreground hidden sm:flex">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="text-xs">Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user?.company}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </div>

      {/* Cart slide-out */}
      <CartPanel />
    </div>
  );
};

export default DashboardLayout;
