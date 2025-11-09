import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axiosInstance";
import { useDBUser } from "@/context/UserContext";
import { PrimaryButton, SecondaryButton, RazorpayPayment } from "@/components";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import { BsCalendar, BsCreditCard, BsExclamationTriangle } from "react-icons/bs";

interface Booking {
    id: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    property: {
        id: string;
        title: string;
        location: string;
        imageUrls: string[];
        currency?: string;
        pricePerNight: number;
        host: {
            name: string;
            email: string;
            photoURL?: string;
        };
    };
    payment?: {
        status: string;
        transactionDate: string;
    };
}

const fetchBooking = async (bookingId: string, userId: string): Promise<Booking> => {
    const response = await axiosInstance.post("/guest/get-user-bookings", { userId });
    const booking = response.data.bookings.find((b: Booking) => b.id === bookingId);

    if (!booking) {
        throw new Error("Booking not found");
    }

    return booking;
};

const PayForBooking = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const { dbUser } = useDBUser();
    const queryClient = useQueryClient();
    const [showPayment, setShowPayment] = useState(false);

    const {
        data: booking,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["booking", bookingId, dbUser?.id],
        queryFn: () => fetchBooking(bookingId!, dbUser?.id!),
        enabled: !!bookingId && !!dbUser?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Check if user is a guest
    useEffect(() => {
        if (dbUser && dbUser.role !== "GUEST") {
            toast.error("Only guests can access this page");
            navigate("/profile");
        }
    }, [dbUser, navigate]);

    // Calculate nights
    const calculateNights = () => {
        if (!booking) return 0;

        const startDate = new Date(booking.startDate);
        const endDate = new Date(booking.endDate);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return Math.max(0, nights);
    };

    const nights = calculateNights();

    const handlePaymentSuccess = () => {
        // Invalidate user bookings cache
        queryClient.invalidateQueries({ queryKey: ["userBookings", dbUser?.id] });
        queryClient.invalidateQueries({ queryKey: ["booking", bookingId, dbUser?.id] });

        // Also invalidate property queries to update availability
        queryClient.invalidateQueries({ queryKey: ["property", booking?.property.id] });
        queryClient.invalidateQueries({ queryKey: ["properties"] });

        toast.success("Payment successful! Your booking is now confirmed.");
        navigate("/profile");
    };

    const handlePaymentFailure = () => {
        setShowPayment(false);
        toast.error("Payment failed. Please try again.");
    };

    // Check if booking can be paid for
    const canPayForBooking = () => {
        if (!booking) return false;

        // Only allow payment for PENDING bookings with PENDING or FAILED payment
        if (booking.status !== "PENDING") return false;

        const paymentStatus = booking.payment?.status;
        if (paymentStatus !== "PENDING" && paymentStatus !== "FAILED") return false;

        // Check if booking hasn't started yet
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = new Date(booking.startDate);
        startDate.setHours(0, 0, 0, 0);

        return startDate > today;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (isError || !booking) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="text-center p-6 text-red-500 bg-red-50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
                    <p className="mb-4">{error?.message || "The booking you're looking for doesn't exist."}</p>
                    <Link to="/profile">
                        <SecondaryButton text="Back to Profile" />
                    </Link>
                </div>
            </div>
        );
    }

    if (!canPayForBooking()) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="text-center p-6 text-yellow-700 bg-yellow-50 rounded-lg border border-yellow-200">
                    <BsExclamationTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                    <h2 className="text-xl font-semibold mb-2">Payment Not Available</h2>
                    <p className="mb-4">
                        {booking.status !== "PENDING"
                            ? "This booking is no longer pending and cannot be paid for."
                            : "This booking has already started or is in the past."}
                    </p>
                    <Link to="/profile">
                        <SecondaryButton text="Back to Profile" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/profile"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Profile
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Payment</h1>
                <p className="text-gray-600">Finalize your booking for {booking.property.title}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Booking Details */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Booking Details</h2>

                        {/* Property Image */}
                        {booking.property.imageUrls.length > 0 && (
                            <img
                                src={booking.property.imageUrls[0]}
                                alt={booking.property.title}
                                className="w-full h-48 object-cover rounded-lg mb-6"
                            />
                        )}

                        {/* Property Info */}
                        <div className="space-y-4">
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

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-gray-500 flex items-center text-sm mb-1">
                                        <BsCalendar className="w-3 h-3 mr-1" />
                                        Check-in
                                    </p>
                                    <p className="font-medium">
                                        {dayjs(booking.startDate).format('DD/MM/YYYY')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 flex items-center text-sm mb-1">
                                        <BsCalendar className="w-3 h-3 mr-1" />
                                        Check-out
                                    </p>
                                    <p className="font-medium">
                                        {dayjs(booking.endDate).format('DD/MM/YYYY')}
                                    </p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                    Booking: {booking.status}
                                </span>
                                {booking.payment && (
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${booking.payment.status === 'FAILED'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        <BsCreditCard className="w-3 h-3" />
                                        Payment: {booking.payment.status}
                                    </span>
                                )}
                            </div>

                            {/* Host Info */}
                            <div className="border-t pt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Hosted by</h4>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden mr-3 flex-shrink-0">
                                        {booking.property.host?.photoURL ? (
                                            <img
                                                src={booking.property.host.photoURL}
                                                alt={booking.property.host.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                                                {booking.property.host?.name?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">
                                            {booking.property.host?.name || "Unknown"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {booking.property.host?.email || ""}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    {showPayment ? (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Complete Payment</h2>
                            <RazorpayPayment
                                bookingId={booking.id}
                                amount={booking.totalAmount}
                                currency={booking.property.currency || "USD"}
                                propertyTitle={booking.property.title}
                                onSuccess={handlePaymentSuccess}
                                onFailure={handlePaymentFailure}
                            />
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <BsExclamationTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-yellow-800 mb-1">Payment Required</h3>
                                        <p className="text-sm text-yellow-700">
                                            Your booking is pending payment. Complete the payment to confirm your reservation.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <PrimaryButton
                                text="Proceed to Payment"
                                onClick={() => setShowPayment(true)}
                                className="w-full py-3 text-lg"
                            />
                        </div>
                    )}
                </div>

                {/* Payment Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>

                        <div className="space-y-3 text-sm">
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
                                <span className="text-gray-600">Nights:</span>
                                <span className="font-medium">{nights}</span>
                            </div>

                            <hr className="my-3" />

                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    {booking.property.currency || "USD"} {booking.property.pricePerNight} × {nights} nights
                                </span>
                                <span className="font-medium">
                                    {booking.property.currency || "USD"} {booking.totalAmount.toFixed(2)}
                                </span>
                            </div>

                            <hr className="my-3" />

                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total:</span>
                                <span>{booking.property.currency || "USD"} {booking.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <div className="text-xs text-gray-500 space-y-2">
                                <p>✓ Secure payment processing</p>
                                <p>✓ Instant booking confirmation</p>
                                <p>✓ 24/7 customer support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayForBooking;
