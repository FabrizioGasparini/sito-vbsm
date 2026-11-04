import React, { useState, useEffect } from "react";

interface VideoThumbnailProps {
    url: string;
    captureTime?: number;
    width?: number;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
    url,
    captureTime = 1,
    width = 400,
}) => {
    const [thumbnail, setThumbnail] = useState<string | null>(null);

    useEffect(() => {
        const video = document.createElement("video");
        video.src = url;
        video.crossOrigin = "anonymous";

        const handleLoadedMetadata = () => {
            video.currentTime = Math.min(captureTime, video.duration / 2);
        };

        const handleSeeked = () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setThumbnail(canvas.toDataURL("image/png"));
            }
        };

        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("seeked", handleSeeked);

        return () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("seeked", handleSeeked);
        };
    }, [url, captureTime]);

    return (
        <div
            style={{
                width,
                height: width * 0.5625,
                position: "relative",
            }}
        >
            {thumbnail ? (
                <img loading="lazy" decoding="async"
                    src={thumbnail}
                    alt="Miniatura video"
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 8,
                        objectFit: "cover",
                    }}
                />
            ) : (
                <div className="bg-gray-300 animate-pulse w-full h-full rounded-md flex items-center justify-center">
                    Generazione miniatura...
                </div>
            )}
        </div>
    );
};

export default VideoThumbnail;
