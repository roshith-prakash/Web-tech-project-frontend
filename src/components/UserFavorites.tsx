import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { axiosInstance } from "@/utils/axiosInstance";
import { useDBUser } from "@/context/UserContext";
import { PrimaryButton } from "@/components";
import { BsHeart, BsEye } from "react-icons/bs";
import FavoriteButton from "./FavoriteButton";

interface Property {
    id: string;
    title: string;
    description?: string;
    location: string;
    pricePerNight: number;
    imageUrls: string[];
    currency?: string;
    host: {
        id: string;
        name: string;
        email: string;
        photoURL?: string;
    };
}

const fetchUserFavorites = async (userId: string) => {
    console.log("📞 Fetching user favorites for:", userId);
    const response = await axiosInstance.post("/guest/get-user-favorites", { userId });
    console.log("📋 Received favorites data:", response.data);
    return response.data;
};

const UserFavorites = () => {
    const { dbUser } = useDBUser();

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["userFavorites", dbUser?.id],
        queryFn: () => fetchUserFavorites(dbUser?.id!),
        enabled: !!dbUser?.id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const favorites: Property[] = data?.favorites || [];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-500"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center p-6 text-red-500 bg-red-50 rounded-lg">
                <p className="mb-4">{error?.message || "Failed to load favorites"}</p>
                <PrimaryButton text="Try Again" onClick={() => refetch()} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">My Favorites</h2>
                    <p className="text-gray-600">
                        Properties you've saved for later
                    </p>
                </div>
                <Link to="/properties">
                    <PrimaryButton
                        text="Browse More Properties"
                        className="mt-4 sm:mt-0"
                    />
                </Link>
            </div>

            {/* Favorites List */}
            {favorites.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                        <BsHeart className="w-16 h-16 text-gray-300 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        No favorites yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Start exploring properties and save the ones you love
                    </p>
                    <Link to="/properties">
                        <PrimaryButton text="Browse Properties" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            )}
        </div>
    );
};

const PropertyCard = ({ property }: { property: Property }) => {
    return (
        <div className="bg-white rounded-lg shadow-md border overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image */}
            <div className="relative h-48">
                {property.imageUrls.length > 0 ? (
                    <img
                        src={property.imageUrls[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                    </div>
                )}

                {/* Favorite Button */}
                <div className="absolute top-3 right-3">
                    <FavoriteButton propertyId={property.id} size="md" />
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
                        {property.title}
                    </h3>
                    <p className="text-gray-600 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {property.location}
                    </p>
                </div>

                {property.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {property.description}
                    </p>
                )}

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xl font-bold text-gray-800">
                            {property.currency || "USD"} {property.pricePerNight}
                        </p>
                        <p className="text-gray-500 text-sm">per night</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Hosted by</p>
                        <p className="font-medium text-gray-800">{property.host.name}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link to={`/property/${property.id}`} className="flex-1">
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                            <BsEye className="w-4 h-4" />
                            View Details
                        </button>
                    </Link>
                    <Link to={`/property/${property.id}/book`} className="flex-1">
                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                            Book Now
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserFavorites;