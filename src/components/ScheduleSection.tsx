import { useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { useWeeklySchedule } from "@/hooks/useScheduleData";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ScheduleSection = () => {
  const { data, isLoading } = useWeeklySchedule();
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const [activeDay, setActiveDay] = useState(today);

  const animes = data?.[activeDay] ?? [];

  return (
    <section className="mb-8 px-8 md:px-16 lg:px-24">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="section-title border-l-4 border-primary pl-4">Airing Schedule</h2>
      </div>

      {/* Day pills */}
      <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-4 mb-6">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeDay === day
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground border border-border hover:bg-secondary/80"
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-muted rounded-md mb-2" />
              <div className="h-3 bg-muted rounded w-3/4 mb-1" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : animes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animes.map((anime) => {
            const airTime = new Date(anime.airingAt * 1000);
            const timeStr = airTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div key={`${anime.id}-${anime.episode}`} className="group cursor-pointer">
                <div className="relative aspect-[2/3] rounded-md overflow-hidden mb-2 bg-card border border-border">
                  <img
                    src={anime.image}
                    alt={anime.title}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                    EP {anime.episode}
                  </div>
                </div>
                <h3 className="font-bold text-sm truncate text-foreground">{anime.title}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{timeStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No anime airing on {activeDay}.</p>
      )}
    </section>
  );
};

export default ScheduleSection;
