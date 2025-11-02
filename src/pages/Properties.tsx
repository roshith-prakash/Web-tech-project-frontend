import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDBUser } from "@/context/UserContext";
import { axiosInstance } from "@/utils/axiosInstance";

const fetchProperty = async (id: string) => {
  const response = await axiosInstance.post(`/guest/get-property-by-id`, { id });
  return response.data.property;
};

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { dbUser } = useDBUser();
  const isGuest = dbUser?.role === "GUEST";

  const {
    data: property,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["property", id],
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="text-center p-6 text-red-500 bg-red-50 rounded-lg max-w-md mx-auto">
        {error?.message || "Property not found"}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <Link
        to="/properties"
        className="inline-flex items-center text-blue-600 hover:underline mb-6"
      >
        Back to Properties
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Image Gallery */}
        <div className="md:col-span-2">
          {property.imageUrls && property.imageUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {/* Main Image */}
              <div className="col-span-2">
                <img
                  src={property.imageUrls[0]}
                  alt={property.title}
                  className="w-full h-96 object-cover rounded-lg shadow-md"
                />
              </div>
              {/* Thumbnails */}
              {property.imageUrls.slice(1, 5).map((url: any, index: number) => (
                <img
                  key={index}
                  src={url}
                  alt={`${property.title} ${index + 2}`}
                  className="w-full h-32 object-cover rounded-lg shadow-sm"
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 flex items-center justify-center">
              <span className="text-gray-500">No Images</span>
            </div>
          )}
        </div>

        {/* Details Card */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {property.title}
          </h1>

          <p className="text-gray-600 flex items-center mb-4">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {property.location}
          </p>

          {property.description && (
            <p className="text-gray-700 mb-6 leading-relaxed">
              {property.description}
            </p>
          )}

          {/* Host */}
          <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden mr-3">
              {property.host?.photoURL ? (
                <img
                  src={property.host.photoURL}
                  alt={property.host.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-bold">
                  {property.host?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                Hosted by {property.host?.name || "Unknown"}
              </p>
              <p className="text-sm text-gray-500">
                {property.host?.email || ""}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-3xl font-bold text-gray-800">
                {property.currency || "USD"} {property.pricePerNight}
              </span>
              <span className="text-gray-500">per night</span>
            </div>

            {/* Book Button */}
            {isGuest ? (
              <Link
                to={`/properties/${property.id}/book`}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition text-center font-medium block"
              >
                Book Now
              </Link>
            ) : (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-600 py-3 px-6 rounded-lg cursor-not-allowed text-center font-medium"
              >
                Book Now (Guests only)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Availability Note */}
      {property.unavailableDates && property.unavailableDates.length > 0 && (
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Note: Some dates are unavailable due to bookings or host blocks.
          </p>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailPage;
