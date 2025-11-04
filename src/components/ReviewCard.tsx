import { BsStar, BsStarFill } from "react-icons/bs";
import dayjs from "dayjs";

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        name: string;
        photoURL: string;
    };
}

interface ReviewCardProps {
    review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span key={index}>
                {index < rating ? (
                    <BsStarFill className="text-yellow-400" />
                ) : (
                    <BsStar className="text-gray-300" />
                )}
            </span>
        ));
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header with user info and rating */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                        {review.user.photoURL ? (
                            <img
                                src={review.user.photoURL}
                                alt={review.user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                {review.user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* User name and date */}
                    <div>
                        <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                        <p className="text-sm text-gray-500">
                            {dayjs(review.createdAt).format('DD/MM/YYYY')}
                        </p>
                    </div>
                </div>

                {/* Rating stars */}
                <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                </div>
            </div>

            {/* Review comment */}
            {review.comment && (
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            )}
        </div>
    );
};

export default ReviewCard;