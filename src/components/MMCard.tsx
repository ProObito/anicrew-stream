import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { MMItem } from "@/lib/multimovies";

interface Props {
  item: MMItem;
  kind: "movie" | "tv";
}

const MMCard = ({ item, kind }: Props) => {
  const to = kind === "movie" ? `/movies/${item.slug}` : `/series/${item.slug}`;
  return (
    <Link to={to} className="block flex-shrink-0">
      <motion.div
        whileHover={{ scale: 1.04, y: -4 }}
        transition={{ duration: 0.25 }}
        className="relative cursor-pointer group overflow-hidden bg-card/50 border border-border/50 hover:border-primary/40 rounded-xl w-40 md:w-44"
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-secondary">
          {item.poster ? (
            <img
              src={item.poster}
              alt={item.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No image
            </div>
          )}
          {item.rating && (
            <div className="absolute top-2 left-2 z-10 bg-background/70 backdrop-blur-md text-primary text-[10px] font-bold px-2 py-0.5 rounded-md border border-primary/20 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> {item.rating}
            </div>
          )}
          {item.quality && (
            <div className="absolute top-2 right-2 z-10 bg-primary/80 text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
              {item.quality}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/20 backdrop-blur-[2px]">
            <div className="w-11 h-11 rounded-xl bg-primary/90 flex items-center justify-center shadow-neon">
              <Play size={18} className="fill-primary-foreground text-primary-foreground ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-card to-transparent pointer-events-none" />
        </div>
        <div className="p-2.5">
          <h3 className="font-semibold text-foreground truncate text-xs mb-1">{item.title}</h3>
          <div className="flex items-center justify-between text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
            <span>{kind === "movie" ? "Movie" : "Series"}</span>
            {item.year && <span>{item.year}</span>}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default MMCard;
