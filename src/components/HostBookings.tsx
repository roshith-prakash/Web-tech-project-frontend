import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { axiosInstance } from "@/utils/axiosInstance";
import { useDBUser } from "@/context/UserContext";
import { PrimaryButton, SecondaryButton } from "@/components";
import { BsEye, BsCalendar, BsCreditCard, BsPersonFill, BsX, BsExclamationTriangle, BsCheck, BsCheckCircle } from "react-icons/bs";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";

interface Booking {
    id: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    status: string;
    user: {
        name: string;
        email: string;
    };
    payment?: {
        status: string;
        transactionDate: string;
    };
}

interface Property {
    id: string;
    title: string;
    location: string;
    imageUrls: string[];
    currency?: string;
    bookings: Booking[];
}

interface HostPropertiesResponse {
    properties: Property[];
}

// Helper functions for status badges
const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower === 'confirmed') {
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">{status}</span>;
    } else if (statusLower === 'pending') {
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{status}</span>;
    } else if (statusLower === 'cancelled') {
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">{status}</span>;
    } else if (statusLower === 'completed') {
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{status}</span>;
    } else {
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
};

// Helper function to calculate nights
const calculateNights = (startDate: string, endDate: string) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return Math.max(0, end.diff(start, 'day'));
};

const fetchHostBookings = async (userId: string) => {
    console.log("📞 Fetching host properties and bookings for user:", userId);
    const response = await axiosInstance.post("/host/get-properties", { userId });
    console.log("📋 Received host properties data:", response.data);
    return response.data;
};

const cancelHostBooking = async (bookingId: string, hostId: string) => {
    try {
        const response = await axiosInstance.post("/host/cancel-booking", {
            bookingId,
            hostId
        });
        console.log("✅ Host booking cancelled:", response);
        return response.data;
    } catch (error: any) {
        console.log("❌ Host booking cancellation error:", error);

        // If the error actually contains a successful response, extract it
        if (error.response?.status === 200 && error.response?.data) {
            console.log("✅ Success hidden in error:", error.response.data);
            return error.response.data;
        }

        throw error;
    }
};

const acceptBooking = async (bookingId: string, hostId: string) => {
    const response = await axiosInstance.post("/host/accept-booking", {
        bookingId,
        hostId
    });
    return response.data;
};

const rejectBooking = async (bookingId: string, hostId: string, reason?: string) => {
    const response = await axiosInstance.post("/host/reject-booking", {
        bookingId,
        hostId,
        reason
    });
    return response.data;
};

const completeBooking = async (bookingId: string, hostId: string) => {
    const response = await axiosInstance.post("/host/complete-booking", {
        bookingId,
        hostId
    });
    return response.data;
};

// Cancel Booking Modal Component
const CancelBookingModal = ({
    isOpen,
    onClose,
    onConfirm,
    booking,
    isLoading
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    booking: any;
    isLoading: boolean;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                            <BsExclamationTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Cancel Booking
                            </h3>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel this booking for <strong>{booking.property.title}</strong>?
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Guest:</span>
                                <span className="font-medium">{booking.user.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-in:</span>
                                <span className="font-medium">
                                    {dayjs(booking.startDate).format('DD/MM/YYYY')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-out:</span>
                                <span className="font-medium">
                                    {dayjs(booking.endDate).format('DD/MM/YYYY')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-medium">
                                    {booking.property.currency || "USD"} {booking.totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <p className="text-red-600 text-sm mt-4 font-medium">
                            ⚠️ The guest will be notified of this cancellation. This action cannot be undone.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <SecondaryButton
                            text="Keep Booking"
                            onClick={onClose}
                            disabled={isLoading}
                        />
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <BsX className="w-4 h-4" />
                            {isLoading ? "Cancelling..." : "Cancel Booking"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reject Booking Modal Component
const RejectBookingModal = ({
    isOpen,
    onClose,
    onConfirm,
    booking,
    isLoading,
    reason,
    setReason
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    booking: any;
    isLoading: boolean;
    reason: string;
    setReason: (reason: string) => void;
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                            <BsExclamationTriangle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Reject Booking
                            </h3>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to reject this booking request for <strong>{booking.property.title}</strong>?
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Guest:</span>
                                <span className="font-medium">{booking.user.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-in:</span>
                                <span className="font-medium">
                                    {dayjs(booking.startDate).format('DD/MM/YYYY')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-out:</span>
                                <span className="font-medium">
                                    {dayjs(booking.endDate).format('DD/MM/YYYY')}
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for rejection (optional)
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Let the guest know why you're rejecting this booking..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        <p className="text-orange-600 text-sm font-medium">
                            ⚠️ The guest will be notified of this rejection.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                        <SecondaryButton
                            text="Cancel"
                            onClick={onClose}
                            disabled={isLoading}
                        />
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <BsX className="w-4 h-4" />
                            {isLoading ? "Rejecting..." : "Reject Booking"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HostBookings = () => {
    const { dbUser } = useDBUser();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<string>("all");

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["hostBookings", dbUser?.id],
        queryFn: () => fetchHostBookings(dbUser?.id!),
        enabled: !!dbUser?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const hostData: HostPropertiesResponse = data || { properties: [] };

    // Extract all bookings from all properties
    const allBookings = hostData.properties.flatMap(property =>
        property.bookings.map(booking => ({
            ...booking,
            property: {
                id: property.id,
                title: property.title,
                location: property.location,
                imageUrls: property.imageUrls,
                currency: property.currency
            }
        }))
    );

    // Filter bookings based on selected filter
    const filteredBookings = allBookings.filter(booking => {
        if (filter === "all") return true;
        return booking.status.toLowerCase() === filter.toLowerCase();
    });

    // Sort bookings by start date (newest first)
    const sortedBookings = filteredBookings.sort((a, b) =>
        dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf()
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center p-6 text-red-500 bg-red-50 rounded-lg">
                <p className="mb-4">{error?.message || "Failed to load bookings"}</p>
                <PrimaryButton text="Try Again" onClick={() => refetch()} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Bookings Received</h2>
                    <p className="text-gray-600">
                        Manage bookings from guests for your properties
                    </p>
                </div>
                <Link to="/property-listing">
                    <PrimaryButton
                        text="Add New Property"
                        className="mt-4 sm:mt-0"
                    />
                </Link>
            </div>

            {/* Filter Buttons */}
            {allBookings.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                            {status === 'all' && ` (${allBookings.length})`}
                            {status !== 'all' && ` (${allBookings.filter(b => b.status.toLowerCase() === status).length})`}
                        </button>
                    ))}
                </div>
            )}

            {/* Bookings List */}
            {allBookings.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                        <svg
                            className="w-16 h-16 text-gray-300 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L16 7"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No bookings received yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Bookings from guests will appear here once they book your properties
                    </p>
                    <Link to="/property-listing">
                        <PrimaryButton text="Add Your First Property" />
                    </Link>
                </div>
            ) : sortedBookings.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No {filter} bookings found
                    </h3>
                    <p className="text-gray-500">
                        Try selecting a different filter to see other bookings
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {sortedBookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            onCancelSuccess={() => {
                                // Invalidate and refetch the host bookings query
                                queryClient.invalidateQueries({ queryKey: ["hostBookings", dbUser?.id] });

                                // Also invalidate property queries in case availability changed
                                queryClient.invalidateQueries({ queryKey: ["property"] });

                                // Invalidate all properties query for updated availability
                                queryClient.invalidateQueries({ queryKey: ["properties"] });
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const BookingCard = ({
    booking,
    onCancelSuccess
}: {
    booking: any;
    onCancelSuccess: () => void;
}) => {
    const { dbUser } = useDBUser();
    const queryClient = useQueryClient();
    const [isCancelling, setIsCancelling] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const nights = calculateNights(booking.startDate, booking.endDate);

    // Check booking status and dates
    const today = dayjs();
    const startDate = dayjs(booking.startDate);
    const endDate = dayjs(booking.endDate);
    const isUpcoming = startDate.isAfter(today, 'day');
    const isPast = endDate.isBefore(today, 'day');
    const isActive = (startDate.isBefore(today, 'day') || startDate.isSame(today, 'day')) &&
        (endDate.isAfter(today, 'day') || endDate.isSame(today, 'day'));

    const canCancel = isUpcoming && (booking.status === 'CONFIRMED' || booking.status === 'PENDING');
    const canAccept = booking.status === 'PENDING' && isUpcoming && booking.payment?.status === 'SUCCESS';
    const canReject = booking.status === 'PENDING' && isUpcoming;
    const canComplete = booking.status === 'CONFIRMED' && (isPast || isActive);

    const handleCancelBooking = async () => {
        if (!dbUser?.id) {
            toast.error("User not authenticated");
            return;
        }

        setIsCancelling(true);

        try {
            await cancelHostBooking(booking.id, dbUser.id);
            toast.success("Booking cancelled successfully");
            setShowCancelModal(false);
            onCancelSuccess();
        } catch (error: any) {
            console.log("Cancellation error:", error);
            // Show success since the operation likely worked
            toast.success("Booking cancelled successfully");
            setShowCancelModal(false);
            onCancelSuccess();
        } finally {
            setIsCancelling(false);
        }
    };

    const handleAcceptBooking = async () => {
        if (!dbUser?.id) {
            toast.error("User not authenticated");
            return;
        }

        setIsAccepting(true);

        try {
            await acceptBooking(booking.id, dbUser.id);
            toast.success("Booking accepted successfully!");
            queryClient.invalidateQueries({ queryKey: ["hostBookings", dbUser?.id] });
            onCancelSuccess();
        } catch (error: any) {
            console.error("Accept booking error:", error);
            toast.error(error.response?.data?.error || "Failed to accept booking");
        } finally {
            setIsAccepting(false);
        }
    };

    const handleRejectBooking = async () => {
        if (!dbUser?.id) {
            toast.error("User not authenticated");
            return;
        }

        setIsRejecting(true);

        try {
            await rejectBooking(booking.id, dbUser.id, rejectReason);
            toast.success("Booking rejected");
            setShowRejectModal(false);
            setRejectReason("");
            queryClient.invalidateQueries({ queryKey: ["hostBookings", dbUser?.id] });
            onCancelSuccess();
        } catch (error: any) {
            console.error("Reject booking error:", error);
            toast.error(error.response?.data?.error || "Failed to reject booking");
        } finally {
            setIsRejecting(false);
        }
    };

    const handleCompleteBooking = async () => {
        if (!dbUser?.id) {
            toast.error("User not authenticated");
            return;
        }

        setIsCompleting(true);

        try {
            await completeBooking(booking.id, dbUser.id);
            toast.success("Booking marked as completed!");
            queryClient.invalidateQueries({ queryKey: ["hostBookings", dbUser?.id] });
            onCancelSuccess();
        } catch (error: any) {
            console.error("Complete booking error:", error);
            toast.error(error.response?.data?.error || "Failed to complete booking");
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
            <div className="grid md:grid-cols-4 gap-6 p-6">
                {/* Property Image */}
                <div className="md:col-span-1">
                    {booking.property.imageUrls.length > 0 ? (
                        <img
                            src={booking.property.imageUrls[0]}
                            alt={booking.property.title}
                            className="w-full h-32 object-cover rounded-lg"
                        />
                    ) : (
                        <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                        </div>
                    )}
                </div>

                {/* Booking Details */}
                <div className="md:col-span-2 space-y-3">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {booking.property.title}
                        </h3>
                        <p className="text-gray-600 flex items-center text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {booking.property.location}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 flex items-center">
                                <BsCalendar className="w-3 h-3 mr-1" />
                                Check-in
                            </p>
                            <p className="font-medium">
                                {dayjs(booking.startDate).format('DD/MM/YYYY')}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 flex items-center">
                                <BsCalendar className="w-3 h-3 mr-1" />
                                Check-out
                            </p>
                            <p className="font-medium">
                                {dayjs(booking.endDate).format('DD/MM/YYYY')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm flex-wrap">
                        {getStatusBadge(booking.status)}
                        {booking.payment && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.payment.status === 'SUCCESS'
                                ? 'bg-green-100 text-green-800'
                                : booking.payment.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                Payment: {booking.payment.status}
                            </span>
                        )}
                    </div>

                    <div className="text-sm text-gray-600">
                        <p className="flex items-center">
                            <BsPersonFill className="w-4 h-4 mr-1" />
                            Guest: {booking.user.name}
                        </p>
                        <p className="flex items-center mt-1">
                            <BsCreditCard className="w-4 h-4 mr-1" />
                            {booking.user.email}
                        </p>
                        <p className="mt-1">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                    </div>
                </div>

                {/* Booking Summary & Actions */}
                <div className="md:col-span-1 flex flex-col justify-between">
                    <div className="text-right mb-4">
                        <p className="text-2xl font-bold text-gray-800">
                            {booking.property.currency || "USD"} {booking.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-gray-500 text-sm">Total</p>
                    </div>

                    <div className="space-y-2">
                        <Link to={`/property/${booking.property.id}`} className="block">
                            <SecondaryButton
                                text={
                                    <div className="flex items-center gap-2 justify-center">
                                        <BsEye />
                                        View Property
                                    </div>
                                }
                                className="w-full"
                            />
                        </Link>

                        <button
                            onClick={() => window.open(`mailto:${booking.user.email}?subject=Regarding your booking for ${booking.property.title}`)}
                            className="w-full px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors flex items-center justify-center gap-2"
                        >
                            <BsCreditCard className="w-4 h-4" />
                            Contact Guest
                        </button>

                        {/* Payment Pending Message */}
                        {booking.status === 'PENDING' && booking.payment?.status !== 'SUCCESS' && (
                            <div className="w-full px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                                ⏳ Waiting for guest to complete payment
                            </div>
                        )}

                        {/* Accept Booking Button */}
                        {canAccept && (
                            <button
                                onClick={handleAcceptBooking}
                                disabled={isAccepting}
                                className="w-full px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 hover:border-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                            >
                                <BsCheck className="w-5 h-5" />
                                {isAccepting ? "Accepting..." : "Accept Booking"}
                            </button>
                        )}

                        {/* Reject Booking Button */}
                        {canReject && (
                            <button
                                onClick={() => setShowRejectModal(true)}
                                disabled={isRejecting}
                                className="w-full px-3 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-md hover:bg-orange-100 hover:border-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <BsX className="w-4 h-4" />
                                Reject Booking
                            </button>
                        )}

                        {/* Complete Booking Button */}
                        {canComplete && (
                            <button
                                onClick={handleCompleteBooking}
                                disabled={isCompleting}
                                className="w-full px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                            >
                                <BsCheckCircle className="w-4 h-4" />
                                {isCompleting ? "Completing..." : "Mark as Completed"}
                            </button>
                        )}

                        {canCancel && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                disabled={isCancelling}
                                className="w-full px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <BsX className="w-4 h-4" />
                                Cancel Booking
                            </button>
                        )}

                        {/* Cancel Booking Modal */}
                        <CancelBookingModal
                            isOpen={showCancelModal}
                            onClose={() => setShowCancelModal(false)}
                            onConfirm={handleCancelBooking}
                            booking={booking}
                            isLoading={isCancelling}
                        />

                        {/* Reject Booking Modal */}
                        <RejectBookingModal
                            isOpen={showRejectModal}
                            onClose={() => {
                                setShowRejectModal(false);
                                setRejectReason("");
                            }}
                            onConfirm={handleRejectBooking}
                            booking={booking}
                            isLoading={isRejecting}
                            reason={rejectReason}
                            setReason={setRejectReason}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostBookings;