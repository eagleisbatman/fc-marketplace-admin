import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Building2,
  Package,
  MapPin,
  Upload,
  LogOut,
  LayoutDashboard,
  Store,
  Tag,
  FileDown,
  ChevronDown,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/upload", label: "Data Upload", icon: Upload },
  { path: "/dashboard/templates", label: "Templates", icon: FileDown },
  { path: "/dashboard/users", label: "Users", icon: Users },
  { path: "/dashboard/fpos", label: "FPOs", icon: Building2 },
  { path: "/dashboard/providers", label: "Service Providers", icon: Store },
  { path: "/dashboard/brands", label: "Brands", icon: Tag },
  { path: "/dashboard/products", label: "Products", icon: Package },
  { path: "/dashboard/locations", label: "Locations", icon: MapPin },
];

const getRoleBadge = (user: { role: string; countryName?: string; stateName?: string }) => {
  if (user.role === "super_admin") return "Super Admin";
  if (user.role === "country_admin") return user.countryName || "Country Admin";
  if (user.role === "state_admin") return `${user.stateName || "State"}, ${user.countryName || ""}`;
  return "Admin";
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { selectedCountry, countries, setSelectedCountry } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isSuperAdmin = user?.role === "super_admin";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span className="hidden md:inline">FC Marketplace Admin</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            {/* Country Selector for Super Admin */}
            {isSuperAdmin && selectedCountry && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <span className="text-base">{selectedCountry.flag}</span>
                    <span className="hidden sm:inline">{selectedCountry.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Switch Country
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {countries.map((country) => (
                    <DropdownMenuItem
                      key={country.id}
                      onClick={() => setSelectedCountry(country)}
                      className={cn(
                        "gap-2 cursor-pointer",
                        selectedCountry.id === country.id && "bg-accent"
                      )}
                    >
                      <span className="text-base">{country.flag}</span>
                      {country.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Country indicator for country/state admin */}
            {!isSuperAdmin && user?.countryName && (
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" />
                {user.countryName}
              </Badge>
            )}

            {user && (
              <div className="flex items-center gap-2">
                <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                  {getRoleBadge(user)}
                </Badge>
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {user.email}
                </span>
              </div>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r min-h-[calc(100vh-3.5rem)]">
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-start", isActive && "bg-secondary")}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background p-2 z-50">
          <div className="flex justify-around">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="icon"
                    className={cn(isActive && "bg-secondary")}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
