import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axiosInstance";
import { useDBUser } from "@/context/UserContext";
import { PrimaryButton, SecondaryButton, DatePicker } from "@/components";
import { toast } from "react-hot-toast";

interface Property {
    id: string;
    title: string;
    description?: string;
    location: string;
    pricePerNight: number;
    imageUrls: string[];
    latitude?: number;
    longitude?: number;
    currency?: string;
    createdAt: string;
    updatedAt: string;
    blockedDates: any[];
    unavailableDates?: Array<{
        startDate: string;
        endDate: string;
    }>;
    host: {
        id: string;
        name: string;
        email: string;
        photoURL: string;
    };
}

const fetchProperty = async (id: string): Promise<Property> => {
    const response = await axiosInstance.post(`/guest/get-property-by-id`, { id });
    return response.data.property;
};

const BookProperty = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { dbUser } = useDBUser();

    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [guests, setGuests] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        data: property,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["property", id],
        queryFn: () => fetchProperty(id!),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Check if user is a guest
    useEffect(() => {
        if (dbUser && dbUser.role !== "GUEST") {
            toast.error("Only guests can book properties");
            navigate(`/property/${id}`);
        }
    }, [dbUser, id, navigate]);

    // Calculate total price and nights
    const calculateBookingDetails = () => {
        if (!checkInDate || !checkOutDate || !property) {
            return { nights: 0, totalAmount: 0 };
        }

        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (nights <= 0) {
            return { nights: 0, totalAmount: 0 };
        }

        const totalAmount = nights * property.pricePerNight;
        return { nights, totalAmount };
    };

    const { nights, totalAmount } = calculateBookingDetails();



    // Check if selected dates are available
    const isDateRangeAvailable = () => {
        if (!checkInDate || !checkOutDate || !property?.unavailableDates) {
            return true;
        }

        const selectedStart = new Date(checkInDate);
        const selectedEnd = new Date(checkOutDate);

        return !property.unavailableDates.some((unavailable) => {
            const unavailableStart = new Date(unavailable.startDate);
            const unavailableEnd = new Date(unavailable.endDate);

            // Check for overlap
            return selectedStart <= unavailableEnd && selectedEnd >= unavailableStart;
        });
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!checkInDate || !checkOutDate) {
            toast.error("Please select check-in and check-out dates");
            return;
        }

        if (new Date(checkInDate) >= new Date(checkOutDate)) {
            toast.error("Check-out date must be after check-in date");
            return;
        }

        // Check if dates are in the past
        if (new Date(checkInDate) < new Date().setHours(0, 0, 0, 0)) {
            toast.error("Check-in date cannot be in the past.");
            return;
        }

        if (!isDateRangeAvailable()) {
            toast.error("Selected date range overlaps with unavailable dates. Please choose different dates.");
            return;
        }

        if (nights <= 0) {
            toast.error("Invalid date range");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axiosInstance.post("/guest/create-booking", {
                propertyId: id,
                startDate: checkInDate,
                endDate: checkOutDate,
                userId: dbUser?.id,
            });

            toast.success("Booking created successfully!");
            navigate("/profile"); // Redirect to profile to see bookings
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to create booking");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get minimum date (today)
    const getMinDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Get minimum checkout date (day after checkin)
    const getMinCheckoutDate = () => {
        if (!checkInDate) return getMinDate();
        const checkIn = new Date(checkInDate);
        checkIn.setDate(checkIn.getDate() + 1);
        return checkIn.toISOString().split('T')[0];
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (isError || !property) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="text-center p-6 text-red-500 bg-red-50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
                    <p className="mb-4">{error?.message || "The property you're looking for doesn't exist."}</p>
                    <Link to="/properties">
                        <SecondaryButton text="Back to Properties" />
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
                    to={`/property/${id}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Property
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Book Your Stay</h1>
                <p className="text-gray-600">Complete your reservation for {property.title}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Booking Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Reservation Details</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <DatePicker
                                    label="Check-in Date"
                                    value={checkInDate}
                                    onChange={setCheckInDate}
                                    minDate={getMinDate()}
                                    blockedDates={property?.unavailableDates || []}
                                    placeholder="Select check-in date"
                                    required
                                />
                                <DatePicker
                                    label="Check-out Date"
                                    value={checkOutDate}
                                    onChange={setCheckOutDate}
                                    minDate={getMinCheckoutDate()}
                                    blockedDates={property?.unavailableDates || []}
                                    placeholder="Select check-out date"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Guests
                                </label>
                                <select
                                    value={guests}
                                    onChange={(e) => setGuests(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                        <option key={num} value={num}>
                                            {num} {num === 1 ? 'Guest' : 'Guests'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Availability Check */}
                            {checkInDate && checkOutDate && (
                                <div className={`p-4 rounded-lg ${isDateRangeAvailable()
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-red-50 border border-red-200'
                                    }`}>
                                    <div className="flex items-center">
                                        <svg
                                            className={`w-5 h-5 mr-2 ${isDateRangeAvailable() ? 'text-green-600' : 'text-red-600'
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            {isDateRangeAvailable() ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            )}
                                        </svg>
                                        <span className={`text-sm font-medium ${isDateRangeAvailable() ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                            {isDateRangeAvailable()
                                                ? 'Selected dates are available!'
                                                : 'Selected dates are not available. Please choose different dates.'
                                            }
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <PrimaryButton
                                    text={isSubmitting ? "Creating Booking..." : "Confirm Booking"}
                                    disabled={isSubmitting || !isDateRangeAvailable() || nights <= 0}
                                    className="flex-1 py-3 text-lg"
                                />
                                <Link to={`/property/${id}`}>
                                    <SecondaryButton text="Cancel" disabled={isSubmitting} />
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Booking Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                        {/* Property Info */}
                        <div className="mb-6">
                            {property.imageUrls.length > 0 && (
                                <img
                                    src={property.imageUrls[0]}
                                    alt={property.title}
                                    className="w-full h-32 object-cover rounded-lg mb-4"
                                />
                            )}
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {property.title}
                            </h3>
                            <p className="text-gray-600 flex items-center text-sm">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {property.location}
                            </p>
                        </div>

                        {/* Booking Summary */}
                        <div className="border-t pt-4">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Booking Summary</h4>

                            {checkInDate && checkOutDate && nights > 0 ? (
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Check-in:</span>
                                        <span className="font-medium">
                                            {new Date(checkInDate + 'T00:00:00').toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Check-out:</span>
                                        <span className="font-medium">
                                            {new Date(checkOutDate + 'T00:00:00').toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nights:</span>
                                        <span className="font-medium">{nights}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Guests:</span>
                                        <span className="font-medium">{guests}</span>
                                    </div>

                                    <hr className="my-3" />

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            {property.currency || "USD"} {property.pricePerNight} × {nights} nights
                                        </span>
                                        <span className="font-medium">
                                            {property.currency || "USD"} {totalAmount.toFixed(2)}
                                        </span>
                                    </div>

                                    <hr className="my-3" />

                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total:</span>
                                        <span>{property.currency || "USD"} {totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L16 7" />
                                    </svg>
                                    <p className="text-sm">Select dates to see pricing</p>
                                </div>
                            )}
                        </div>

                        {/* Host Info */}
                        <div className="border-t pt-4 mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Hosted by</h4>
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden mr-3 flex-shrink-0">
                                    {property.host?.photoURL ? (
                                        <img
                                            src={property.host.photoURL}
                                            alt={property.host.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                                            {property.host?.name?.charAt(0).toUpperCase() || "?"}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">
                                        {property.host?.name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {property.host?.email || ""}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookProperty;