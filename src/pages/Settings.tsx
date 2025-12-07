import { Header } from "@/components/layout/Header";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/context/ThemeContext";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="space-y-2 mb-8 opacity-0 animate-fade-up">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <div className="glass-card p-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Profile Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="Sandip" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Salunkhe" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="sandip@example.com" className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="bg-muted/50" />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="glass-card p-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              {[
                { id: "email-trades", label: "Trade Notifications", desc: "Get notified when trades are executed" },
                { id: "email-daily", label: "Daily Summary", desc: "Receive daily performance summary" },
                { id: "email-weekly", label: "Weekly Report", desc: "Weekly trading analytics report" },
                { id: "push-alerts", label: "Push Notifications", desc: "Browser push notifications for alerts" },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.id !== "push-alerts"} />
                </div>
              ))}
            </div>
          </div>


          {/* Preferences Section */}
          <div className="glass-card p-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Preferences</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex bg-muted/50 p-1 rounded-lg">
                  <Button
                    variant={theme === "light" ? "default" : "ghost"}
                    className="flex-1 h-8 rounded-md"
                    onClick={() => setTheme("light")}
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "ghost"}
                    className="flex-1 h-8 rounded-md"
                    onClick={() => setTheme("dark")}
                  >
                    Dark
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="inr">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select defaultValue="ist">
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                    <SelectItem value="est">EST (UTC-5)</SelectItem>
                    <SelectItem value="pst">PST (UTC-8)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select defaultValue="dmy">
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="ymd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="glass-card p-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Security</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your password regularly</p>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button variant="outline">Cancel</Button>
            <Button variant="hero" className="gap-2" onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </main >
    </div >
  );
};

export default Settings;
