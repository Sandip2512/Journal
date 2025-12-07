import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import api from '@/lib/api';

interface Announcement {
    id: number;
    title: string;
    content: string;
}

export const AnnouncementBanner = () => {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        fetchAnnouncement();
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const response = await api.get('/api/announcements/active');
            if (response.data) {
                setAnnouncement(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch announcement", error);
        }
    };

    if (!announcement || !isVisible) return null;

    return (
        <div className="relative w-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-indigo-500/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex-1 flex items-center min-w-0">
                        <span className="flex p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                            <Megaphone className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="ml-3 font-medium text-foreground truncate">
                            <span className="md:hidden">{announcement.title}</span>
                            <span className="hidden md:inline">
                                <span className="font-bold mr-2">{announcement.title}:</span>
                                {announcement.content}
                            </span>
                        </div>
                        {/* Mobile View Content expansion could go here if needed, but for bar keep it simple */}
                    </div>
                    <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                        <button
                            type="button"
                            className="-mr-1 flex p-2 rounded-md hover:bg-white/10 focus:outline-none sm:-mr-2"
                            onClick={() => setIsVisible(false)}
                        >
                            <span className="sr-only">Dismiss</span>
                            <X className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
