import { Link } from "react-router-dom";
import { SecondaryButton } from "@/components";

const NotFound = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-200">404</h1>
                <h2 className="text-3xl font-semibold text-gray-800 mt-4 mb-2">
                    Page Not Found
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Sorry, the page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <img
                        src="https://res.cloudinary.com/do8rpl9l4/image/upload/v1736738810/notfound_eqfykw.svg"
                        alt="Page not found"
                        className="max-w-[300px] pointer-events-none"
                    />
                </div>
                <div className="mt-8 flex gap-4 justify-center">
                    <Link to="/">
                        <SecondaryButton text="Back to Home" />
                    </Link>
                    <Link to="/properties">
                        <SecondaryButton text="Browse Properties" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
