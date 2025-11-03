import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { axiosInstance } from "@/utils/axiosInstance";
import { useDBUser } from "@/context/UserContext";
import { toast } from "react-hot-toast";

interface FavoriteButtonProps {
    propertyId: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

const FavoriteButton = ({ propertyId, className = "", size = "md" }: FavoriteButtonProps) => {
    const { dbUser } = useDBUser();
    const queryClient = useQueryClient();
    const [isAnimating, setIsAnimating] = useState(false);

    // Check if property is favorited
    const { data: favoriteStatus } = useQuery({
        queryKey: ["favoriteStatus", propertyId, dbUser?.id],
        queryFn: async () => {
            if (!dbUser?.id) return { isFavorite: false };
            const response = await axiosInstance.post("/guest/check-favorite-status", {
                propertyId,
                userId: dbUser.id,
            });
            return response.data;
        },
        enabled: !!dbUser?.id && !!propertyId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Add to favorites mutation
    const addToFavoritesMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post("/guest/add-to-favorites", {
                propertyId,
                userId: dbUser?.id,
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success("Added to favorites!");
            // Invalidate queries to update UI
            queryClient.invalidateQueries({ queryKey: ["favoriteStatus", propertyId, dbUser?.id] });
            queryClient.invalidateQueries({ queryKey: ["userFavorites", dbUser?.id] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Failed to add to favorites";
            toast.error(message);
        },
    });

    // Remove from favorites mutation
    const removeFromFavoritesMutation = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post("/guest/remove-from-favorites", {
                propertyId,
                userId: dbUser?.id,
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success("Removed from favorites!");
            // Invalidate queries to update UI
            queryClient.invalidateQueries({ queryKey: ["favoriteStatus", propertyId, dbUser?.id] });
            queryClient.invalidateQueries({ queryKey: ["userFavorites", dbUser?.id] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || "Failed to remove from favorites";
            toast.error(message);
        },
    });

    const handleToggleFavorite = async () => {
        if (!dbUser) {
            toast.error("Please sign in to add favorites");
            return;
        }

        if (dbUser.role !== "GUEST") {
            toast.error("Only guests can add properties to favorites");
            return;
        }

        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        if (favoriteStatus?.isFavorite) {
            removeFromFavoritesMutation.mutate();
        } else {
            addToFavoritesMutation.mutate();
        }
    };

    const isLoading = addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending;
    const isFavorite = favoriteStatus?.isFavorite || false;

    // Size classes
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    const buttonSizeClasses = {
        sm: "p-1.5",
        md: "p-2",
        lg: "p-2.5",
    };

    return (
        <button
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`
        ${buttonSizeClasses[size]}
        ${className}
        rounded-full 
        bg-white/90 
        backdrop-blur-sm 
        border 
        border-gray-200 
        hover:bg-white 
        hover:scale-110 
        transition-all 
        duration-200 
        disabled:opacity-50 
        disabled:cursor-not-allowed
        ${isAnimating ? "animate-pulse scale-125" : ""}
        shadow-sm
        hover:shadow-md
      `}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            {isFavorite ? (
                <BsHeartFill
                    className={`${sizeClasses[size]} text-red-500 transition-colors duration-200`}
                />
            ) : (
                <BsHeart
                    className={`${sizeClasses[size]} text-gray-600 hover:text-red-500 transition-colors duration-200`}
                />
            )}
        </button>
    );
};

export default FavoriteButton;