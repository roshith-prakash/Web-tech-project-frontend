/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/axiosInstance";
import { useDBUser } from "@/context/UserContext";
import { PrimaryButton, SecondaryButton, GoogleMapEmbed } from "@/components";
import DatePicker from "@/components/DatePicker";
import { toast } from "react-hot-toast";
import { BsTrash, BsPlus, BsCalendar } from "react-icons/bs";
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
    blockedDates: { startDate: string; endDate: string }[];
    bookings?: {
        startDate: string;
        endDate: string;
        status: string;
    }[];
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

const EditProperty = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { dbUser } = useDBUser();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        pricePerNight: "",
        latitude: "",
        longitude: "",
        currency: "INR",
    });
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageToRemove, setImageToRemove] = useState<string | null>(null);
    const [blockedDates, setBlockedDates] = useState<{ startDate: string; endDate: string }[]>([]);
    const [allUnavailableDates, setAllUnavailableDates] = useState<{ startDate: string; endDate: string }[]>([]);
    const [newBlockedStart, setNewBlockedStart] = useState("");
    const [newBlockedEnd, setNewBlockedEnd] = useState("");

    const {
        data: property,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["property", id],
        queryFn: () => fetchProperty(id!),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Populate form when property data is loaded
    useEffect(() => {
        if (property) {
            setFormData({
                title: property.title,
                description: property.description || "",
                location: property.location,
                pricePerNight: property.pricePerNight.toString(),
                latitude: property.latitude?.toString() || "",
                longitude: property.longitude?.toString() || "",
                currency: property.currency || "INR",
            });
            setBlockedDates(property.blockedDates || []);

            // Combine bookings and blocked dates for calendar display
            const bookingDates = (property.bookings || []).map(b => ({
                startDate: b.startDate,
                endDate: b.endDate,
            }));
            const manuallyBlocked = property.blockedDates || [];
            setAllUnavailableDates([...bookingDates, ...manuallyBlocked]);
        }
    }, [property]);

    // Check if user owns this property
    useEffect(() => {
        if (property && property.host?.id !== dbUser?.id) {
            toast.error("You don't have permission to edit this property");
            navigate("/profile");
        }
    }, [property, dbUser, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.target.files);
    };

    const handleAddBlockedDate = () => {
        if (!newBlockedStart || !newBlockedEnd) {
            toast.error("Please select both start and end dates");
            return;
        }

        if (new Date(newBlockedStart) > new Date(newBlockedEnd)) {
            toast.error("End date must be after start date");
            return;
        }

        // Check for overlapping dates with ALL unavailable dates (bookings + blocked)
        const hasOverlap = allUnavailableDates.some((blocked) => {
            const existingStart = new Date(blocked.startDate);
            const existingEnd = new Date(blocked.endDate);
            const newStart = new Date(newBlockedStart);
            const newEnd = new Date(newBlockedEnd);

            return (
                (newStart >= existingStart && newStart <= existingEnd) ||
                (newEnd >= existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd)
            );
        });

        if (hasOverlap) {
            toast.error("This date range overlaps with existing bookings or blocked dates");
            return;
        }

        const newBlockedDate = { startDate: newBlockedStart, endDate: newBlockedEnd };
        setBlockedDates([...blockedDates, newBlockedDate]);
        setAllUnavailableDates([...allUnavailableDates, newBlockedDate]);
        setNewBlockedStart("");
        setNewBlockedEnd("");
        toast.success("Blocked date added");
    };

    const handleRemoveBlockedDate = (index: number) => {
        const removedDate = blockedDates[index];
        setBlockedDates(blockedDates.filter((_, i) => i !== index));
        // Also remove from allUnavailableDates
        setAllUnavailableDates(allUnavailableDates.filter(
            date => !(date.startDate === removedDate.startDate && date.endDate === removedDate.endDate)
        ));
        toast.success("Blocked date removed");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.title.trim()) {
            toast.error("Property title is required");
            return;
        }

        if (formData.title.trim().length < 3) {
            toast.error("Property title must be at least 3 characters long");
            return;
        }

        if (!formData.location.trim()) {
            toast.error("Location is required");
            return;
        }

        if (formData.location.trim().length < 3) {
            toast.error("Location must be at least 3 characters long");
            return;
        }

        if (!formData.pricePerNight || parseFloat(formData.pricePerNight) <= 0) {
            toast.error("Price per night must be greater than 0");
            return;
        }

        if (parseFloat(formData.pricePerNight) > 1000000) {
            toast.error("Price per night seems unreasonably high. Please check the value.");
            return;
        }

        // Validate coordinates if provided
        if (formData.latitude && (parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90)) {
            toast.error("Latitude must be between -90 and 90");
            return;
        }

        if (formData.longitude && (parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180)) {
            toast.error("Longitude must be between -180 and 180");
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("propertyId", id!);
            formDataToSend.append("userId", dbUser?.id!);

            Object.entries(formData).forEach(([key, value]) => {
                formDataToSend.append(key, value);
            });

            // Add blocked dates as JSON string
            formDataToSend.append("blockedDates", JSON.stringify(blockedDates));

            if (selectedFiles) {
                Array.from(selectedFiles).forEach((file) => {
                    formDataToSend.append("files", file);
                });
            }

            await axiosInstance.post("/host/update-property", formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Property updated successfully");
            refetch();
            setSelectedFiles(null);
            // Reset file input
            const fileInput = document.getElementById("files") as HTMLInputElement;
            if (fileInput) fileInput.value = "";
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update property");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveImage = async (imageUrl: string) => {
        try {
            await axiosInstance.post("/host/remove-property-image", {
                propertyId: id,
                imageUrl,
                userId: dbUser?.id,
            });
            toast.success("Image removed successfully");
            refetch();
            setImageToRemove(null);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to remove image");
        }
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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Property</h1>
                <p className="text-gray-600">Update your property details and manage images</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Property Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                maxLength={150}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className={`text-xs ${formData.title.length >= 150 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                    {formData.title.length}/150 characters
                                </p>
                                {formData.title.length >= 150 && (
                                    <p className="text-xs text-red-500 font-medium">Maximum length reached</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                maxLength={2000}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe your property..."
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className={`text-xs ${formData.description.length >= 2000 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                    {formData.description.length}/2000 characters
                                </p>
                                {formData.description.length >= 2000 && (
                                    <p className="text-xs text-red-500 font-medium">Maximum length reached</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                maxLength={200}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <div className="flex justify-between items-center mt-1">
                                <p className={`text-xs ${formData.location.length >= 200 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                                    {formData.location.length}/200 characters
                                </p>
                                {formData.location.length >= 200 && (
                                    <p className="text-xs text-red-500 font-medium">Maximum length reached</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price per Night *
                                </label>
                                <input
                                    type="number"
                                    name="pricePerNight"
                                    value={formData.pricePerNight}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Currency
                                </label>
                                <input
                                    type="text"
                                    value="INR"
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Latitude (Optional)
                                </label>
                                <input
                                    type="number"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                    step="any"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 40.7128"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Longitude (Optional)
                                </label>
                                <input
                                    type="number"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                    step="any"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., -74.0060"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Add New Images
                            </label>
                            <input
                                type="file"
                                id="files"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Select multiple images to add to your property
                            </p>
                        </div>

                        {/* Blocked Dates Section */}
                        <div className="border-t pt-6">
                            <div className="flex items-center gap-2 mb-3">
                                <BsCalendar className="text-blue-600 text-lg" />
                                <label className="block text-sm font-medium text-gray-700">
                                    Blocked Dates (Optional)
                                </label>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Block dates when your property is unavailable for booking
                            </p>

                            {/* Add Blocked Date Form */}
                            <div className="space-y-3 mb-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <DatePicker
                                        value={newBlockedStart}
                                        onChange={setNewBlockedStart}
                                        minDate={new Date().toISOString().split('T')[0]}
                                        blockedDates={allUnavailableDates}
                                        label="Start Date"
                                        placeholder="Select start date"
                                    />
                                    <DatePicker
                                        value={newBlockedEnd}
                                        onChange={setNewBlockedEnd}
                                        minDate={newBlockedStart || new Date().toISOString().split('T')[0]}
                                        blockedDates={allUnavailableDates}
                                        label="End Date"
                                        placeholder="Select end date"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddBlockedDate}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm border border-gray-300"
                                >
                                    <BsPlus className="text-lg" />
                                    Add Blocked Date Range
                                </button>
                            </div>

                            {/* Existing Bookings (Read-only) */}
                            {property?.bookings && property.bookings.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Existing Bookings (Cannot be removed)</p>
                                    <div className="space-y-2">
                                        {property.bookings.map((booking, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 bg-blue-50 rounded-md border border-blue-200"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <BsCalendar className="text-blue-500 text-xs" />
                                                    <span className="text-xs text-gray-700">
                                                        {dayjs(booking.startDate).format('MMM DD, YYYY')} - {dayjs(booking.endDate).format('MMM DD, YYYY')}
                                                    </span>
                                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                                        {booking.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Manually Blocked Dates List */}
                            {blockedDates.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Manually Blocked Dates</p>
                                    {blockedDates.map((blocked, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
                                        >
                                            <div className="flex items-center gap-2">
                                                <BsCalendar className="text-gray-500 text-xs" />
                                                <span className="text-xs text-gray-700">
                                                    {dayjs(blocked.startDate).format('MMM DD, YYYY')} - {dayjs(blocked.endDate).format('MMM DD, YYYY')}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveBlockedDate(index)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <BsTrash className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <PrimaryButton
                                text={isSubmitting ? "Updating..." : "Update Property"}
                                disabled={isSubmitting}
                                className="flex-1"
                            />
                            <Link to="/profile">
                                <SecondaryButton text="Cancel" disabled={isSubmitting} />
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="space-y-6">
                    {/* Current Images */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Images</h3>
                        {property.imageUrls.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {property.imageUrls.map((url: string, index: number) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt={`Property ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setImageToRemove(url)}
                                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <BsTrash className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <BsPlus className="w-12 h-12 mx-auto mb-2" />
                                <p>No images uploaded yet</p>
                            </div>
                        )}
                    </div>

                    {/* Map Preview */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Preview</h3>
                        <GoogleMapEmbed
                            latitude={parseFloat(formData.latitude) || property.latitude}
                            longitude={parseFloat(formData.longitude) || property.longitude}
                            location={formData.location || property.location}
                            title={`Map showing location of ${formData.title || property.title}`}
                            height="h-48"
                            zoom={15}
                        />
                    </div>
                </div>
            </div>

            {/* Remove Image Confirmation Modal */}
            {imageToRemove && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Remove Image
                        </h3>
                        <div className="mb-4">
                            <img
                                src={imageToRemove}
                                alt="Image to remove"
                                className="w-full h-32 object-cover rounded-lg"
                            />
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to remove this image? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <SecondaryButton
                                text="Cancel"
                                onClick={() => setImageToRemove(null)}
                            />
                            <PrimaryButton
                                text="Remove"
                                onClick={() => handleRemoveImage(imageToRemove)}
                                className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProperty;