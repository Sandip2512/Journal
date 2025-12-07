import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Megaphone, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Announcement {
    id: number;
    title: string;
    content: string;
    is_active: boolean;
    created_at: string;
}

const Announcements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get("/api/admin/system/announcements");
            setAnnouncements(response.data);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch announcements",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await api.post("/api/admin/system/announcements", { title, content });
            toast({ title: "Success", description: "Announcement sent successfully (will auto-delete in 24 hours)" });
            setTitle("");
            setContent("");
            fetchAnnouncements();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to create announcement" });
        } finally {
            setSending(false);
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/api/admin/system/announcements/${id}`);
            toast({ title: "Success", description: "Announcement deleted successfully" });
            fetchAnnouncements();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete announcement" });
        }
    }

    const getTimeRemaining = (createdAt: string) => {
        const created = new Date(createdAt);
        const now = new Date();
        const expiresAt = new Date(created.getTime() + 24 * 60 * 60 * 1000);
        const remaining = expiresAt.getTime() - now.getTime();

        if (remaining <= 0) return "Expired";

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m remaining`;
    }

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Announcements</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">New Announcement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <Input
                                        placeholder="Title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Textarea
                                        placeholder="Message content..."
                                        className="min-h-[150px]"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button className="w-full" type="submit" disabled={sending}>
                                    {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Post Announcement
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Megaphone className="h-5 w-5" />
                                Recent Announcements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : announcements.length === 0 ? (
                                    <p className="text-center text-muted-foreground p-8">No announcements yet.</p>
                                ) : (
                                    announcements.map((item) => (
                                        <div key={item.id} className="p-4 rounded-lg border bg-muted/30">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold">{item.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={item.is_active ? "default" : "secondary"}>
                                                        {item.is_active ? "Active" : "Archived"}
                                                    </Badge>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">{item.content}</p>
                                            <div className="flex justify-between items-center border-t pt-2 mt-2">
                                                <p className="text-xs text-muted-foreground">
                                                    Posted on {new Date(item.created_at).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-orange-500 font-medium">
                                                    {getTimeRemaining(item.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Announcements;
