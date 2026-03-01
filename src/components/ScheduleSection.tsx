import { useState } from "react";
import { Calendar, Clock, Tv } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWeeklySchedule } from "@/hooks/useScheduleData";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ScheduleSection = () => {
  const { data, isLoading } = useWeeklySchedule();
  const todayIdx = new Date().getDay();
  const today = DAYS[todayIdx === 0 ? 6 : todayIdx - 1];
  const [activeDay, setActiveDay] = useState(today);

  const animes = data?.[activeDay] ?? [];

  // Get date string for selected day
  const getDateForDay = (dayName: string) => {
    const now = new Date();
    const currentDayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const targetIdx = DAYS.indexOf(dayName);
    const diff = targetIdx - currentDayIdx;
    const date = new Date(now);
    date.setDate(date.getDate() + (diff < 0 ? diff + 7 : diff));
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <section className="mb-8 px-8 md:px-16 lg:px-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="section-title border-l-4 border-primary pl-4">Airing Schedule</h2>
        </div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider hidden md:block">
          Powered by AniList
        </span>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-6">
        {DAYS.map((day) => {
          const isActive = activeDay === day;
          const isToday = day === today;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex flex-col items-center min-w-[72px] px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-neon"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <span className="text-[10px] mb-0.5">{getDateForDay(day)}</span>
              <span>{day.slice(0, 3)}</span>
              {isToday && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse flex gap-4 bg-card rounded-xl p-4 border border-border">
              <div className="w-16 h-24 bg-muted rounded-lg shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : animes.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {animes.map((anime, idx) => {
              const airTime = new Date(anime.airingAt * 1000);
              const timeStr = airTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const hoursLeft = Math.max(0, Math.floor(anime.timeUntilAiring / 3600));
              const isAiringSoon = hoursLeft <= 3 && hoursLeft > 0;
              const hasAired = anime.timeUntilAiring <= 0;

              return (
                <motion.div
                  key={`${anime.id}-${anime.episode}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-4 bg-card rounded-xl p-4 border border-border hover:border-primary/40 transition-all group cursor-pointer"
                >
                  {/* Cover */}
                  <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 relative">
                    <img
                      src={anime.image}
                      alt={anime.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[8px] font-bold px-1 py-0.5 rounded">
                      EP {anime.episode}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                        {anime.title}
                      </h3>
                      {anime.genres.length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1 truncate">
                          {anime.genres.slice(0, 3).join(" • ")}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{timeStr}</span>
                      </div>
                      {hasAired ? (
                        <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                          AIRED
                        </span>
                      ) : isAiringSoon ? (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                          {hoursLeft}h LEFT
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          {hoursLeft}h
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Tv className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-sm">No anime airing on {activeDay}.</p>
          <p className="text-muted-foreground/50 text-xs mt-1">Try checking other days</p>
        </div>
      )}
    </section>
  );
};

export default ScheduleSection;
