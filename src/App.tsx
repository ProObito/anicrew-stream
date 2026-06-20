import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const Index = lazy(() => import("./pages/Index"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const AnimeDetailPage = lazy(() => import("./pages/AnimeDetailPage"));
const AnilistDetailPage = lazy(() => import("./pages/AnilistDetailPage"));
const WatchPage = lazy(() => import("./pages/WatchPage"));
const WatchlistPage = lazy(() => import("./pages/WatchlistPage"));
const RoomPage = lazy(() => import("./pages/RoomPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const MoviesPage = lazy(() => import("./pages/MoviesPage"));
const SeriesPage = lazy(() => import("./pages/SeriesPage"));
const MovieDetailPage = lazy(() => import("./pages/MovieDetailPage"));
const SeriesDetailPage = lazy(() => import("./pages/SeriesDetailPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const AnimePage = lazy(() => import("./pages/AnimePage"));
const MMDetailPage = lazy(() => import("./pages/MMDetailPage"));
const BrowsePage = lazy(() => import("./pages/BrowsePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/anime" element={<AnimePage />} />
            <Route path="/mm/:type/:slug" element={<MMDetailPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:slug" element={<MovieDetailPage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/series/:slug" element={<SeriesDetailPage />} />
            <Route path="/anime/anilist/:id" element={<AnilistDetailPage />} />
            <Route path="/anime/:id" element={<AnimeDetailPage />} />
            <Route path="/watch/:id" element={<WatchPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/room" element={<RoomPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
