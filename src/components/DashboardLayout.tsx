import { Navigate, Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { Package, LogOut, LayoutDashboard, ClipboardList, Building2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartPanel from "@/components/CartPanel";

const DashboardLayout = () => {
  const { user, isLoading, isAdmin, signOut } = useAuthStore();
  const location = useLocation();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const navItems = [
    { to: "/dashboard", label: "Catalogus", icon: LayoutDashboard },
    { to: "/orders", label: "Bestellingen", icon: ClipboardList },
    { to: "/profile", label: "Bedrijf", icon: Building2 },
    ...(isAdmin ? [{ to: "/admin/orders", label: "Orderbeheer", icon: ShieldCheck }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg wholesale-gradient flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground hidden sm:inline">Wholesale Portal</span>
          </div>

          <nav className="flex items-center gap-1 ml-4">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <CartPanel />
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
