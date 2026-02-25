interface VideoPlayerProps {
  sources: any;
  title?: string;
}

const VideoPlayer = ({ sources, title }: VideoPlayerProps) => {
  if (!sources) {
    return (
      <div className="w-full aspect-video glass-card flex items-center justify-center">
        <p className="text-muted-foreground">Select an episode to start watching</p>
      </div>
    );
  }

  // Try to get an iframe/embed source or direct HLS
  const iframeUrl = sources?.sources?.[0]?.url;

  if (!iframeUrl) {
    return (
      <div className="w-full aspect-video glass-card flex items-center justify-center">
        <p className="text-muted-foreground">No source available for this episode</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden neon-border">
      <iframe
        src={iframeUrl}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        title={title || "Video Player"}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
};

export default VideoPlayer;
