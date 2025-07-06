'use client';

import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";

const Avatar = ({ src, size = 40 }: { src?: string; size?: number }) => {
    const [imageError, setImageError] = useState(false);

    // Check if src is a valid, non-empty string before rendering the Image
    // and if there hasn't been a loading error.
    if (src && src.trim() !== "" && !imageError) {
    return ( 
        <Image
            src={src}
            alt="Avatar"
            width={size}
            height={size}
            className="rounded-full"
            style={{ objectFit: 'cover' }}
            onError={() => setImageError(true)} // If image fails to load, set error state
            />
     );
}
 // Render a fallback icon if no src is provided or if the image failed to load
 return <FaUserCircle size={size * 0.8} />;
};

export default Avatar;