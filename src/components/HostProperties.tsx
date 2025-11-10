import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { axiosInstance } from "@/utils/axiosInstance";
import { useDBUser } from "@/context/UserContext";
import { PrimaryButton, SecondaryButton } from "@/components";
import { BsPen, BsTrash, BsEye, BsPlus } from "react-icons/bs";
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
    bookings: Array<{
        id: string;
        startDate: string;
        endDate: string;
        status: string;
        totalAmount: number;
        user: {
            name: string;
            email: string;
        };
    }>;
    reviews: Array<{
        id: string;
        rating: number;
        comment?: string;
        createdAt: string;
        user: {
            name: string;
        };
    }>;
}

const fetchHostProperties = async (userId: string) => {
    const response = await axiosInstance.post("/host/get-properties", { userId });
    return response.data;
};

const HostProperties = () => {
    const { dbUser } = useDBUser();
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["hostProperties", dbUser?.id],
        queryFn: () => fetchHostProperties(dbUser?.id!),
        enabled: !!dbUser?.id && dbUser?.role === "HOST",
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const properties: Property[] = data?.properties || [];

    const handleDeleteProperty = async (propertyId: string) => {
        console.log("🗑️ Attempting to delete property:", propertyId);
        try {
            const response = await axiosInstance.post("/host/delete-property", {
                propertyId,
                userId: dbUser?.id,
            });
            console.log("✅ Delete response:", response.data);
            toast.success("Property deleted successfully");
            refetch();
            setShowDeleteModal(false);
            setSelectedProperty(null);
        } catch (error: any) {
            console.error("❌ Delete error:", error);
            toast.error(error.response?.data?.error || "Failed to delete property");
        }
    };

    if (dbUser?.role !== "HOST") {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">This section is only available for hosts.</p>
            </div>
        );
    }

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
                <p className="mb-4">{error?.message || "Failed to load properties"}</p>
                <PrimaryButton text="Try Again" onClick={() => refetch()} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">My Properties</h2>
                    <p className="text-gray-600">
                        Manage your property listings and view booking details
                    </p>
                </div>
                <Link to="/property-listing">
                    <PrimaryButton
                        text={
                            <div className="flex items-center gap-2">
                                <BsPlus className="text-lg" />
                                Add New Property
                            </div>
                        }
                        className="mt-4 sm:mt-0"
                    />
                </Link>
            </div>

            {/* Properties List */}
            {properties.length === 0 ? (
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
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No properties yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Start by adding your first property to begin hosting
                    </p>
                    <Link to="/property-listing">
                        <PrimaryButton text="Add Your First Property" />
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {properties.map((property) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            onDelete={() => {
                                console.log("🗑️ Delete button clicked for:", property.title);
                                setSelectedProperty(property);
                                setShowDeleteModal(true);
                            }}
                        />
                    ))}
                </div>
            )}



            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedProperty && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Delete Property
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{selectedProperty.title}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <SecondaryButton
                                text="Cancel"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedProperty(null);
                                }}
                            />
                            <PrimaryButton
                                text="Delete"
                                onClick={() => handleDeleteProperty(selectedProperty.id)}
                                className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PropertyCard = ({
    property,
    onDelete,
}: {
    property: Property;
    onDelete: () => void;
}) => {
    const activeBookings = property.bookings.filter(
        (booking) => booking.status === "CONFIRMED" || booking.status === "PENDING"
    );

    const averageRating = property.reviews.length > 0
        ? property.reviews.reduce((sum, review) => sum + review.rating, 0) / property.reviews.length
        : 0;

    return (
        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
            <div className="grid md:grid-cols-3 gap-6 p-6">
                {/* Property Image */}
                <div className="md:col-span-1">
                    {property.imageUrls.length > 0 ? (
                        <img
                            src={property.imageUrls[0]}
                            alt={property.title}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                        </div>
                    )}
                </div>

                {/* Property Details */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {property.title}
                            </h3>
                            <p className="text-gray-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {property.location}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800">
                                {property.currency || "USD"} {property.pricePerNight}
                            </p>
                            <p className="text-gray-500 text-sm">per night</p>
                        </div>
                    </div>

                    {property.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                            {property.description}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-lg font-semibold text-gray-800">
                                {activeBookings.length}
                            </p>
                            <p className="text-xs text-gray-500">Active Bookings</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-lg font-semibold text-gray-800">
                                {property.reviews.length}
                            </p>
                            <p className="text-xs text-gray-500">Reviews</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-lg font-semibold text-gray-800">
                                {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">Rating</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Link to={`/property/${property.id}`}>
                            <SecondaryButton
                                text={
                                    <div className="flex items-center gap-2">
                                        <BsEye />
                                        View
                                    </div>
                                }
                            />
                        </Link>
                        <Link to={`/property/${property.id}/edit`}>
                            <SecondaryButton
                                text={
                                    <div className="flex items-center gap-2">
                                        <BsPen />
                                        Edit
                                    </div>
                                }
                            />
                        </Link>
                        <SecondaryButton
                            text={
                                <div className="flex items-center gap-2">
                                    <BsTrash />
                                    Delete
                                </div>
                            }
                            onClick={onDelete}
                            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostProperties;