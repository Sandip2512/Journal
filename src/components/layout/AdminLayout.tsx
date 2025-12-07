import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    Users,
    TrendingUp,
    FileText,
    Bell,
    Settings,
    LogOut,
    Menu,
    ShieldAlert,
    BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
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

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
        { icon: Users, label: "User Management", path: "/admin/users" },
        { icon: TrendingUp, label: "Trade Management", path: "/admin/trades" },
        { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
        { icon: ShieldAlert, label: "System Logs", path: "/admin/logs" },
        { icon: Bell, label: "Announcements", path: "/admin/announcements" },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? "w-64" : "w-16"
                    } bg-card border-r transition-all duration-300 flex flex-col fixed h-full z-20`}
            >
                <div className="h-16 flex items-center justify-between px-4 border-b bg-primary/5">
                    {isSidebarOpen && (
                        <div className="font-bold text-xl tracking-tight text-primary flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground p-1 rounded">TJ</span>
                            Admin
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={!isSidebarOpen ? "mx-auto" : ""}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link to={item.path} key={item.path}>
                                <Button
                                    variant={isActive ? "default" : "ghost"}
                                    className={`w-full justify-start ${!isSidebarOpen ? "px-0 justify-center" : ""}`}
                                >
                                    <item.icon className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : ""}`} />
                                    {isSidebarOpen && item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t space-y-2">
                    <div className={`flex items-center justify-between ${!isSidebarOpen && "flex-col gap-2"}`}>
                        <ThemeToggle />
                        {isSidebarOpen && <span className="text-xs text-muted-foreground">v1.0.0</span>}
                    </div>

                    <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                className={`w-full justify-start ${!isSidebarOpen ? "px-0 justify-center" : ""}`}
                            >
                                <LogOut className={`h-5 w-5 ${isSidebarOpen ? "mr-2" : ""}`} />
                                {isSidebarOpen && "Logout"}
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
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"
                    }`}
            >
                <header className="h-16 border-b bg-background/50 backdrop-blur sticky top-0 z-10 flex items-center justify-between px-6">
                    <h2 className="text-lg font-semibold capitalize">
                        {location.pathname.split("/").pop() || "Dashboard"}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.first_name?.[0]}
                        </div>
                    </div>
                </header>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
