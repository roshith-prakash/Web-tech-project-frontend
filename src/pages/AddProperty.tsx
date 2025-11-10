import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDBUser } from "@/context/UserContext";
import { axiosInstance } from "@/utils/axiosInstance";
import { PrimaryButton, SecondaryButton, GoogleMapEmbed } from "@/components";
import { toast } from "react-hot-toast";
import { BsTrash, BsPlus } from "react-icons/bs";

const AddProperty = () => {
  const { dbUser } = useDBUser();
  const navigate = useNavigate();
  const isHost = dbUser?.role === "HOST";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    pricePerNight: "",
    latitude: "",
    longitude: "",
    currency: "USD",
  });

  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [blockedDates, setBlockedDates] = useState<
    { startDate: string; endDate: string }[]
  >([]);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(files);

      // Create previews
      const previews: string[] = [];
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
          previews.push(URL.createObjectURL(file));
        } else {
          toast.error(`Invalid file: ${file.name}. Must be an image under 5MB.`);
        }
      });
      setImagePreviews(previews);
    }
  };

  const handleRemoveImage = (index: number) => {
    if (selectedFiles) {
      const filesArray = Array.from(selectedFiles);
      filesArray.splice(index, 1);

      // Create new FileList
      const dt = new DataTransfer();
      filesArray.forEach(file => dt.items.add(file));
      setSelectedFiles(dt.files);

      // Update previews
      const newPreviews = [...imagePreviews];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      setImagePreviews(newPreviews);
    }
  };

  const handleAddBlockedDate = () => {
    if (newStartDate && newEndDate && newStartDate < newEndDate) {
      setBlockedDates([
        ...blockedDates,
        { startDate: newStartDate, endDate: newEndDate },
      ]);
      setNewStartDate("");
      setNewEndDate("");
    } else {
      toast.error("Invalid date range. Ensure start date is before end date.");
    }
  };

  const handleRemoveBlockedDate = (index: number) => {
    setBlockedDates(blockedDates.filter((_, i) => i !== index));
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
      formDataToSend.append("userId", dbUser?.id!);

      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      formDataToSend.append("blockedDates", JSON.stringify(blockedDates));

      if (selectedFiles) {
        Array.from(selectedFiles).forEach((file) => {
          formDataToSend.append("files", file);
        });
      }

      await axiosInstance.post("/host/add-property", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Property added successfully!");
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add property");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHost) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center p-6 text-red-500 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="mb-4">Only hosts can add properties.</p>
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Property</h1>
        <p className="text-gray-600">Create a new property listing for guests to book</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 min-w-0">
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
                placeholder="Enter property title"
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
                placeholder="e.g., Paris, France"
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
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
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
                Property Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Select multiple images for your property (max 5MB each)
              </p>
            </div>

            {/* Blocked Dates Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blocked Dates (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Add date ranges when the property is unavailable
              </p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <SecondaryButton
                text="Add Blocked Range"
                onClick={handleAddBlockedDate}
                className="mb-3"
                disabled={!newStartDate || !newEndDate}
              />

              {blockedDates.length > 0 && (
                <div className="space-y-2">
                  {blockedDates.map((range, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-sm">
                        {range.startDate} to {range.endDate}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlockedDate(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <BsTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <PrimaryButton
                text={isSubmitting ? "Adding Property..." : "Add Property"}
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
        <div className="space-y-6 min-w-0">
          {/* Image Previews */}
          <div className="bg-white rounded-lg shadow-md p-6 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Image Previews</h3>
            {imagePreviews.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
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
                <p>No images selected yet</p>
                <p className="text-sm">Upload images to see previews here</p>
              </div>
            )}
          </div>

          {/* Map Preview */}
          <div className="bg-white rounded-lg shadow-md p-6 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Preview</h3>
            {(formData.latitude && formData.longitude) || formData.location ? (
              <GoogleMapEmbed
                latitude={parseFloat(formData.latitude) || undefined}
                longitude={parseFloat(formData.longitude) || undefined}
                location={formData.location}
                title={`Map showing location of ${formData.title || "new property"}`}
                height="h-48"
                zoom={15}
              />
            ) : (
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm">Enter location or coordinates</p>
                  <p className="text-xs">to see map preview</p>
                </div>
              </div>
            )}
          </div>

          {/* Property Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 min-w-0 overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2 items-start">
                <span className="text-gray-600">Title:</span>
                <span className="font-medium col-span-2 break-words">{formData.title || "Not set"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-start">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium col-span-2 break-words">{formData.location || "Not set"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-start">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium col-span-2 break-words">
                  {formData.pricePerNight
                    ? `${formData.currency} ${formData.pricePerNight}/night`
                    : "Not set"
                  }
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-start">
                <span className="text-gray-600">Images:</span>
                <span className="font-medium col-span-2">{imagePreviews.length} selected</span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-start">
                <span className="text-gray-600">Blocked Dates:</span>
                <span className="font-medium col-span-2">{blockedDates.length} ranges</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;