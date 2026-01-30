import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Search from "./pages/Search";
import ParkDetail from "./pages/ParkDetail";
import Map from "./pages/Map";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import OwnerLanding from "./pages/OwnerLanding";
import OwnerAuth from "./pages/OwnerAuth";
import OwnerDashboard from "./pages/OwnerDashboard";
import LandingParkType from "./pages/LandingParkType";
import LandingProvince from "./pages/LandingProvince";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/zoeken" element={<Search />} />
            <Route path="/park/:id" element={<ParkDetail />} />
            <Route path="/kaart" element={<Map />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/eigenaar" element={<OwnerLanding />} />
            <Route path="/eigenaar/registreren" element={<OwnerAuth />} />
            <Route path="/eigenaar/login" element={<OwnerAuth />} />
            <Route path="/eigenaar/dashboard" element={<OwnerDashboard />} />
            {/* SEO Landing Pages */}
            <Route path="/camping" element={<LandingParkType />} />
            <Route path="/bungalowpark" element={<LandingParkType />} />
            <Route path="/glamping" element={<LandingParkType />} />
            <Route path="/vakantiepark" element={<LandingParkType />} />
            <Route path="/resort" element={<LandingParkType />} />
            <Route path="/provincie/:province" element={<LandingProvince />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
