import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { axiosInstance } from "@/utils/axiosInstance";
import { useDBUser } from "@/context/UserContext";
import { PrimaryButton, SecondaryButton } from "@/components";
import { BsBell, BsCheck, BsCheckAll, BsCalendar, BsHouse, BsExclamationCircle } from "react-icons/bs";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Notification {
    id: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
}

interface NotificationsResponse {
    notifications: Notification[];
    hasMore: boolean;
    total: number;
    page: number;
    limit: number;
}

const fetchNotifications = async ({ pageParam = 1, userId }: { pageParam: number; userId: string }) => {
    console.log("📞 Fetching notifications page:", pageParam);
    const response = await axiosInstance.post("/guest/get-user-notifications", {
        userId,
        page: pageParam,
        limit: 20,
    });
    return response.data;
};

const Notifications = () => {
    const { dbUser } = useDBUser();
    const queryClient = useQueryClient();
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: "100px", // Trigger 100px before the element comes into view
    });

    // Set page title
    useEffect(() => {
        document.title = "Notifications | StayFinder";
    }, []);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["notifications", dbUser?.id],
        queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
            fetchNotifications({ pageParam: pageParam as number, userId: dbUser?.id! }),
        getNextPageParam: (lastPage: NotificationsResponse) => {
            return lastPage.hasMore ? lastPage.page + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: !!dbUser?.id,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    // Auto-fetch next page when scrolling
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            console.log("🔄 Loading next page of notifications...");
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Mark notification as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (notificationId: string) => {
            const response = await axiosInstance.post("/guest/mark-notification-as-read", {
                notificationId,
                userId: dbUser?.id,
            });
            return response.data;
        },
        onSuccess: () => {
            // Invalidate queries to update UI
            queryClient.invalidateQueries({ queryKey: ["notifications", dbUser?.id] });
            queryClient.invalidateQueries({ queryKey: ["unreadCount", dbUser?.id] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to mark as read");
        },
    });

    // Mark all as read mutation
    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post("/guest/mark-all-notifications-as-read", {
                userId: dbUser?.id,
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(`Marked ${data.updatedCount} notifications as read`);
            // Invalidate queries to update UI
            queryClient.invalidateQueries({ queryKey: ["notifications", dbUser?.id] });
            queryClient.invalidateQueries({ queryKey: ["unreadCount", dbUser?.id] });
            setSelectedNotifications([]);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || "Failed to mark all as read");
        },
    });

    const allNotifications = data?.pages.flatMap(page => page.notifications) || [];
    const unreadNotifications = allNotifications.filter(n => !n.read);
    const totalCount = data?.pages[0]?.total || 0;

    const handleMarkAsRead = (notificationId: string) => {
        markAsReadMutation.mutate(notificationId);
    };

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate();
    };

    const handleSelectNotification = (notificationId: string) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const handleSelectAll = () => {
        if (selectedNotifications.length === allNotifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(allNotifications.map(n => n.id));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center p-6 text-red-500 bg-red-50 rounded-lg">
                        <p className="mb-4">{error?.message || "Failed to load notifications"}</p>
                        <PrimaryButton text="Try Again" onClick={() => refetch()} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <BsBell className="text-2xl text-blue-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                        </div>

                        {unreadNotifications.length > 0 && (
                            <SecondaryButton
                                text={
                                    <div className="flex items-center gap-2">
                                        <BsCheckAll />
                                        Mark All Read ({unreadNotifications.length})
                                    </div>
                                }
                                onClick={handleMarkAllAsRead}
                                disabled={markAllAsReadMutation.isPending}
                            />
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>Total: {totalCount}</span>
                        <span>Unread: {unreadNotifications.length}</span>
                        <span>Read: {totalCount - unreadNotifications.length}</span>
                    </div>
                </div>

                {/* Notifications List */}
                {allNotifications.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <BsBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            No notifications yet
                        </h3>
                        <p className="text-gray-500">
                            You'll see notifications about your bookings and account activity here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {allNotifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onMarkAsRead={handleMarkAsRead}
                                isLoading={markAsReadMutation.isPending}
                            />
                        ))}

                        {/* Loading indicator for infinite scroll */}
                        {hasNextPage && (
                            <div ref={ref} className="flex justify-center py-8">
                                {isFetchingNextPage ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
                                        <p className="text-sm text-gray-500">Loading more notifications...</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fetchNextPage()}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Load more notifications
                                    </button>
                                )}
                            </div>
                        )}

                        {!hasNextPage && allNotifications.length > 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <p>You've reached the end of your notifications</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const NotificationCard = ({
    notification,
    onMarkAsRead,
    isLoading,
}: {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    isLoading: boolean;
}) => {
    const getNotificationIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'booking':
                return <BsCalendar className="w-5 h-5 text-blue-600" />;
            case 'confirmed':
                return <BsCheck className="w-5 h-5 text-green-600" />;
            case 'review':
                return <BsHouse className="w-5 h-5 text-purple-600" />;
            case 'update':
                return <BsExclamationCircle className="w-5 h-5 text-orange-600" />;
            default:
                return <BsBell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'booking':
                return 'border-l-blue-500';
            case 'confirmed':
                return 'border-l-green-500';
            case 'review':
                return 'border-l-purple-500';
            case 'update':
                return 'border-l-orange-500';
            default:
                return 'border-l-gray-500';
        }
    };

    return (
        <div
            className={`
        bg-white rounded-lg shadow-sm border-l-4 p-4 transition-all duration-200
        ${getNotificationColor(notification.type)}
        ${!notification.read
                    ? 'bg-blue-50 border-blue-200 shadow-md'
                    : 'hover:shadow-md'
                }
      `}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <p className={`text-sm leading-relaxed ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                {notification.message}
                            </p>

                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-500">
                                    {dayjs(notification.createdAt).fromNow()}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${notification.type.toLowerCase() === 'booking' ? 'bg-blue-100 text-blue-800' :
                                    notification.type.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-800' :
                                        notification.type.toLowerCase() === 'review' ? 'bg-purple-100 text-purple-800' :
                                            notification.type.toLowerCase() === 'update' ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {notification.type}
                                </span>
                            </div>
                        </div>

                        {/* Mark as read button */}
                        {!notification.read && (
                            <button
                                onClick={() => onMarkAsRead(notification.id)}
                                disabled={isLoading}
                                className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
                                title="Mark as read"
                            >
                                <BsCheck className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;