import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BsBell } from "react-icons/bs";
import { axiosInstance } from "@/utils/axiosInstance";
import { useDBUser } from "@/context/UserContext";

const fetchUnreadCount = async (userId: string) => {
    const response = await axiosInstance.post("/guest/get-unread-notification-count", { userId });
    return response.data;
};

const NotificationBell = () => {
    const { dbUser } = useDBUser();

    const { data } = useQuery({
        queryKey: ["unreadCount", dbUser?.id],
        queryFn: () => fetchUnreadCount(dbUser?.id!),
        enabled: !!dbUser?.id,
        staleTime: 1000 * 60 * 1, // 1 minute
        refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
    });

    const unreadCount = data?.unreadCount || 0;

    if (!dbUser) {
        return null;
    }

    return (
        <Link
            to="/notifications"
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
            title="Notifications"
        >
            <div className="relative inline-block">
                <BsBell className="w-5 h-5" />

                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 shadow-sm border border-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </div>
        </Link>
    );
};

export default NotificationBell;