import React from 'react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title }) => {
  return (
    <div className="w-full overflow-hidden bg-black rounded-xl shadow-lg ring-1 ring-gray-900/5 aspect-video relative">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;