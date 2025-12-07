import React from "react";
import { TrendingUp, LayoutDashboard, ArrowRightLeft, BarChart3, AlertTriangle, Trophy, Settings, Plug, User, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ArrowRightLeft, label: "Trades", path: "/trades" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: AlertTriangle, label: "Mistakes", path: "/mistakes" },
  { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
];

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  return (
    <header className="bg-header sticky top-0 z-50 border-b border-header-foreground/10">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-header-foreground">
              Trading Journal
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  className="inline-flex items-center gap-2 h-9 px-3 text-sm text-header-foreground/80 hover:text-header-foreground hover:bg-header-foreground/10 rounded-lg transition-colors"
                  activeClassName="text-header-foreground bg-header-foreground/15 font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-header-foreground">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex items-center gap-2 mb-8">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg font-bold">Trading Journal</span>
              </div>
              <nav className="flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    {navItems.map((item) => (
                      <NavLink
                        key={item.label}
                        to={item.path}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                        activeClassName="bg-primary/10 text-primary font-medium"
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </NavLink>
                    ))}
                    <div className="border-t my-4" />
                    <NavLink
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <Settings className="w-5 h-5" />
                      Settings
                    </NavLink>
                    <NavLink
                      to="/broker-connections"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <Plug className="w-5 h-5" />
                      Broker Connections
                    </NavLink>
                    <div className="border-t my-4" />
                    <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="justify-start gap-3 w-full text-destructive">
                          Sign out
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You will be redirected to the login page.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No</AlertDialogCancel>
                          <AlertDialogAction onClick={logout}>Yes, Logout</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button className="w-full mb-2">Sign In</Button>
                    </Link>
                    <Link to="/register">
                      <Button variant="outline" className="w-full">Create Account</Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="nav" size="sm" className="gap-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline text-header-foreground">{user?.first_name || 'User'}</span>
                  <ChevronDown className="w-4 h-4 opacity-60 text-header-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/broker-connections" className="flex items-center cursor-pointer">
                    <Plug className="w-4 h-4 mr-2" />
                    Broker Connections
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive cursor-pointer" onSelect={(e) => e.preventDefault()}>
                      Sign out
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be redirected to the login page.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No</AlertDialogCancel>
                      <AlertDialogAction onClick={logout}>Yes, Logout</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden lg:flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
