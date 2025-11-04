import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDBUser } from "@/context/UserContext";
import { axiosInstance } from "@/utils/axiosInstance";
import { PrimaryButton, SecondaryButton, GoogleMapEmbed, FavoriteButton, ReviewSection } from "@/components";
import dayjs from "dayjs";

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
  host: {
    id: string;
    name: string;
    email: string;
    photoURL: string;
  };
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
      name: string;
      photoURL: string;
    };
  }>;
  averageRating?: number;
  totalReviews?: number;
}

const fetchProperty = async (id: string): Promise<Property> => {
  const response = await axiosInstance.post(`/guest/get-property-by-id`, { id });
  return response.data.property;
};

const PropertyDetail = () => {
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
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back Button */}
      <Link
        to="/properties"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Properties
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Image Gallery */}
        <div className="lg:col-span-2">
          {property.imageUrls && property.imageUrls.length > 0 ? (
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <img
                  src={property.imageUrls[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Gallery */}
              {property.imageUrls.length > 1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {property.imageUrls.slice(1, 5).map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-md">
                      <img
                        src={url}
                        alt={`${property.title} ${index + 2}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Show More Images Button */}
              {property.imageUrls.length > 5 && (
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  + {property.imageUrls.length - 5} more photos
                </button>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-gray-200 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-500">No Images Available</span>
              </div>
            </div>
          )}

          {/* Property Description */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About this property</h2>
            {property.description ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            ) : (
              <p className="text-gray-500 italic">No description available.</p>
            )}
          </div>

          {/* Location */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Location</h2>
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-lg">{property.location}</span>
            </div>

            {/* Google Maps Integration */}
            <div className="mt-4">
              <GoogleMapEmbed
                latitude={property.latitude}
                longitude={property.longitude}
                location={property.location}
                title={`Map showing location of ${property.title}`}
                height="h-64"
                zoom={15}
              />
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg border sticky top-8">
            {/* Property Title */}
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-800 flex-1">
                {property.title}
              </h1>
              {dbUser?.role === "GUEST" && (
                <FavoriteButton propertyId={property.id} size="lg" className="ml-3" />
              )}
            </div>

            {/* Host Information */}
            <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden mr-3 flex-shrink-0">
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

            {/* Pricing */}
            <div className="border-t border-b py-4 mb-6">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-3xl font-bold text-gray-800">
                    {property.currency || "USD"} {property.pricePerNight}
                  </span>
                  <span className="text-gray-500 ml-2">per night</span>
                </div>
              </div>
            </div>

            {/* Booking Actions */}
            <div className="space-y-3">
              {isGuest ? (
                <>
                  <Link to={`/property/${property.id}/book`} className="block">
                    <PrimaryButton
                      text="Book Now"
                      className="w-full py-3 text-lg"
                    />
                  </Link>
                  <p className="text-xs text-gray-500 text-center">
                    You won't be charged yet
                  </p>
                </>
              ) : (
                <div>
                  <PrimaryButton
                    text="Book Now (Guests only)"
                    disabled
                    className="w-full py-3 text-lg"
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {dbUser?.role === "HOST"
                      ? "Hosts cannot book properties"
                      : "Please sign in as a guest to book"
                    }
                  </p>
                </div>
              )}

              <SecondaryButton
                text="Contact Host"
                className="w-full py-3"
                onClick={() => {
                  window.location.href = `mailto:${property.host?.email}?subject=Inquiry about ${property.title}`;
                }}
              />
            </div>

            {/* Property Stats */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Property ID</p>
                  <p className="font-medium text-gray-800">{property.id.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Listed</p>
                  <p className="font-medium text-gray-800">
                    {dayjs(property.createdAt).format('DD/MM/YYYY')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Notice */}
          {property.blockedDates && property.blockedDates.length > 0 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Availability Notice</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Some dates may be unavailable due to existing bookings or host restrictions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <ReviewSection
          propertyId={property.id}
          initialReviews={property.reviews || []}
          averageRating={property.averageRating}
          totalReviews={property.totalReviews}
        />
      </div>
    </div>
  );
};

export default PropertyDetail;