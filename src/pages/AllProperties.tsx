import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { axiosInstance } from "@/utils/axiosInstance";
import { Input } from "@/components/ui/input";
import { PrimaryButton, CompactMapEmbed, FavoriteButton } from "@/components";
import dayjs from "dayjs";

// Property type based on schema.prisma
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
  host: {
    id: string;
    name: string;
    email: string;
    photoURL: string;
  };
}

interface PropertyResponse {
  properties: Property[];
  hasMore: boolean;
  total: number;
}

const PROPERTIES_PER_PAGE = 12;

const fetchProperties = async (
  page: number,
  search: string = "",
  checkIn: string = "",
  checkOut: string = ""
): Promise<PropertyResponse> => {
  const requestData: any = {
    page,
    limit: PROPERTIES_PER_PAGE,
    search,
  };

  if (checkIn && checkOut) {
    requestData.checkIn = checkIn;
    requestData.checkOut = checkOut;
  }

  console.log('🔍 Fetching properties with params:', requestData);
  const response = await axiosInstance.post("/guest/get-all-properties", requestData);
  return response.data;
};

const PropertyCard = ({ property, showMap = false }: { property: Property; showMap?: boolean }) => {
  return (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden">
        <Link to={`/property/${property.id}`} className="block w-full h-full">
          {property.imageUrls && property.imageUrls.length > 0 ? (
            <img
              src={property.imageUrls[0]}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </Link>

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
          <span className="text-sm font-semibold text-gray-800">
            {property.currency || "USD"} {property.pricePerNight}/night
          </span>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
          <FavoriteButton propertyId={property.id} size="md" />
        </div>
      </div>

      <Link to={`/property/${property.id}`} className="block">
        {/* Property Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
            {property.title}
          </h3>

          <p className="text-gray-600 flex items-center mb-2">
            <svg
              className="w-4 h-4 mr-1 flex-shrink-0"
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
            <span className="line-clamp-1">{property.location}</span>
          </p>

          {property.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {property.description}
            </p>
          )}

          {/* Host Info */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden mr-2 flex-shrink-0">
              {property.host?.photoURL ? (
                <img
                  src={property.host.photoURL}
                  alt={property.host.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                  {property.host?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600 line-clamp-1">
              Hosted by {property.host?.name || "Unknown"}
            </span>
          </div>
        </div>
      </Link>

      {/* Compact Map (if enabled) */}
      {showMap && (
        <div className="p-4 pt-0">
          <CompactMapEmbed
            latitude={property.latitude}
            longitude={property.longitude}
            location={property.location}
          />
        </div>
      )}
    </div>
  );
};

const AllProperties = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCheckIn = searchParams.get('checkIn') || '';
  const initialCheckOut = searchParams.get('checkOut') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [checkInDate, setCheckInDate] = useState(initialCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(initialCheckOut);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showMaps, setShowMaps] = useState(false);

  // Intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle URL parameter changes (only on mount and searchParams change)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCheckIn = searchParams.get('checkIn') || '';
    const urlCheckOut = searchParams.get('checkOut') || '';

    console.log('🔍 AllProperties received URL parameters:', {
      search: urlSearch,
      checkIn: urlCheckIn,
      checkOut: urlCheckOut
    });

    setSearchTerm(urlSearch);
    setCheckInDate(urlCheckIn);
    setCheckOutDate(urlCheckOut);
  }, [searchParams]);

  // Reset when search or dates change
  useEffect(() => {
    setAllProperties([]);
    setCurrentPage(1);
    setHasMore(true);
  }, [debouncedSearch, checkInDate, checkOutDate]);

  // Fetch properties
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["properties", currentPage, debouncedSearch, checkInDate, checkOutDate],
    queryFn: () => fetchProperties(currentPage, debouncedSearch, checkInDate, checkOutDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: hasMore || currentPage === 1,
  });

  // Update properties when data changes
  useEffect(() => {
    if (data) {
      if (currentPage === 1) {
        setAllProperties(data.properties);
      } else {
        setAllProperties(prev => [...prev, ...data.properties]);
      }
      setHasMore(data.hasMore);
    }
  }, [data, currentPage]);

  // Load more when in view
  useEffect(() => {
    if (inView && hasMore && !isLoading && data) {
      setCurrentPage(prev => prev + 1);
    }
  }, [inView, hasMore, isLoading, data]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCheckInChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckInDate(e.target.value);
  }, []);

  const handleCheckOutChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckOutDate(e.target.value);
  }, []);

  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearDates = () => {
    setCheckInDate("");
    setCheckOutDate("");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
            Discover Amazing Properties
          </h1>

          {/* Map Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMaps(!showMaps)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${showMaps
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {showMaps ? "Hide Maps" : "Show Maps"}
          </button>
        </div>

        {/* Search and Date Filters */}
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl md:items-end">
          {/* Search Bar */}
          <div className="relative flex-1">
            <label className="block text-sm text-gray-600 mb-2 font-medium">Search Properties</label>
            <Input
              type="text"
              placeholder="Search by property name, location, or host..."
              value={searchTerm}
              onChange={handleSearch}
              className="pr-20 h-12"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Date Filters */}
          <div className="flex gap-2 items-end">
            <div className="relative">
              <label className="block text-sm text-gray-600 mb-2 font-medium">Check-in</label>
              <input
                type="date"
                value={checkInDate}
                onChange={handleCheckInChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-40 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-12"
              />
            </div>
            <div className="relative">
              <label className="block text-sm text-gray-600 mb-2 font-medium">Check-out</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={handleCheckOutChange}
                min={checkInDate || new Date().toISOString().split('T')[0]}
                className="w-40 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-12"
              />
            </div>
            {(checkInDate || checkOutDate) && (
              <button
                type="button"
                onClick={clearDates}
                className="px-3 py-2 text-gray-400 hover:text-gray-600 transition-colors h-12 flex items-center"
                title="Clear dates"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || checkInDate || checkOutDate) && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                Location: {searchTerm}
                <button type="button" onClick={clearSearch} className="ml-1 hover:text-blue-900">×</button>
              </span>
            )}
            {checkInDate && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Check-in: {dayjs(checkInDate).format('DD/MM/YYYY')}
              </span>
            )}
            {checkOutDate && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Check-out: {dayjs(checkOutDate).format('DD/MM/YYYY')}
              </span>
            )}
            {(checkInDate || checkOutDate) && (
              <button
                type="button"
                onClick={clearDates}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                Clear dates
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State for Initial Load */}
      {isLoading && currentPage === 1 && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center p-6 text-red-500 bg-red-50 rounded-lg max-w-md mx-auto">
          <p className="mb-4">{error?.message || "Failed to load properties"}</p>
          <PrimaryButton
            text="Try Again"
            onClick={() => window.location.reload()}
          />
        </div>
      )}

      {/* Properties Grid */}
      {!isLoading || currentPage > 1 ? (
        <>
          {allProperties.length > 0 ? (
            <>
              {/* Results Count */}
              <div className="mb-6">
                <p className="text-gray-600">
                  {debouncedSearch ? (
                    <>Showing results for "{debouncedSearch}"</>
                  ) : (
                    <>Showing all properties</>
                  )}
                  {data?.total && (
                    <span className="ml-2 text-gray-500">
                      ({data.total} total)
                    </span>
                  )}
                </p>
              </div>

              {/* Properties Grid */}
              <div className={`grid gap-6 mb-8 ${showMaps
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }`}>
                {allProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} showMap={showMaps} />
                ))}
              </div>

              {/* Loading More Indicator */}
              {hasMore && (
                <div ref={ref} className="flex justify-center py-8">
                  {isLoading && (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
                  )}
                </div>
              )}

              {/* End of Results */}
              {!hasMore && allProperties.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>You've reached the end of the results</p>
                </div>
              )}
            </>
          ) : (
            !isLoading && (
              <div className="text-center py-16">
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
                  {debouncedSearch ? "No properties found" : "No properties available"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {debouncedSearch
                    ? `Try adjusting your search term "${debouncedSearch}"`
                    : "Check back later for new listings"}
                </p>
                {debouncedSearch && (
                  <PrimaryButton
                    text="Clear Search"
                    onClick={clearSearch}
                  />
                )}
              </div>
            )
          )}
        </>
      ) : null}
    </div>
  );
};

export default AllProperties;