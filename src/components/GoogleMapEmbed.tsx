import { useState } from "react";

interface GoogleMapEmbedProps {
    latitude?: number;
    longitude?: number;
    location?: string;
    title?: string;
    className?: string;
    height?: string;
    zoom?: number;
}

const GoogleMapEmbed = ({
    latitude,
    longitude,
    location,
    title = "Property Location",
    className = "",
    height = "h-64",
    zoom = 15,
}: GoogleMapEmbedProps) => {
    const [mapError, setMapError] = useState(false);

    // Create map source URL using basic Google Maps embed (no API key required)
    const getMapSrc = () => {
        if (latitude && longitude) {
            // Use coordinates for precise location
            return `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
        } else if (location) {
            // Use location string for search
            const encodedLocation = encodeURIComponent(location);
            return `https://maps.google.com/maps?q=${encodedLocation}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
        }

        return null;
    };

    const mapSrc = getMapSrc();

    // Create Google Maps link for "Open in Maps" button
    const getGoogleMapsLink = () => {
        if (latitude && longitude) {
            return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        } else if (location) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        }
        return "https://www.google.com/maps";
    };

    // Fallback when no location data is available
    if (!mapSrc || (!latitude && !longitude && !location)) {
        return (
            <div className={`${height} bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
                <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm">Location not available</p>
                </div>
            </div>
        );
    }

    // Error fallback
    if (mapError) {
        return (
            <div className={`${height} bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
                <div className="text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm">Unable to load map</p>
                    <a
                        href={getGoogleMapsLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                    >
                        View on Google Maps
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${height} rounded-lg overflow-hidden shadow-md ${className}`}>
            <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapSrc}
                title={title}
                onError={() => setMapError(true)}
                className="rounded-lg"
            />

            {/* Overlay with link to open in Google Maps */}
            <a
                href={getGoogleMapsLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-gray-900 px-3 py-1 rounded-md text-sm font-medium transition-all shadow-sm border flex items-center gap-1"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in Maps
            </a>
        </div>
    );
};

export default GoogleMapEmbed;