import { useState } from "react";

interface CompactMapEmbedProps {
    latitude?: number;
    longitude?: number;
    location?: string;
    className?: string;
}

const CompactMapEmbed = ({
    latitude,
    longitude,
    location,
    className = "",
}: CompactMapEmbedProps) => {
    const [mapError, setMapError] = useState(false);

    // Create map source URL using basic Google Maps embed (no API key required)
    const getMapSrc = () => {
        if (latitude && longitude) {
            // Use coordinates for precise location with higher zoom for compact view
            return `https://maps.google.com/maps?q=${latitude},${longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
        } else if (location) {
            // Use location string for search
            const encodedLocation = encodeURIComponent(location);
            return `https://maps.google.com/maps?q=${encodedLocation}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
        }

        return null;
    };

    const mapSrc = getMapSrc();

    // Create Google Maps link
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
            <div className={`h-32 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
                <div className="text-center text-gray-400">
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-xs">No map</p>
                </div>
            </div>
        );
    }

    // Error fallback
    if (mapError) {
        return (
            <div className={`h-32 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
                <a
                    href={getGoogleMapsLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-xs">View Map</p>
                </a>
            </div>
        );
    }

    return (
        <div className={`relative h-32 rounded-lg overflow-hidden ${className}`}>
            <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={mapSrc}
                title="Property location"
                onError={() => setMapError(true)}
                className="rounded-lg pointer-events-none"
            />

            {/* Overlay to make the map clickable and open in Google Maps */}
            <a
                href={getGoogleMapsLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
                title="Open in Google Maps"
            >
                <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-700">
                    View in Maps
                </div>
            </a>
        </div>
    );
};

export default CompactMapEmbed;