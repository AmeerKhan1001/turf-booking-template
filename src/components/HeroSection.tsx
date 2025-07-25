import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import FacilitiesDialog from "@/components/FacilitiesSection";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-turf.jpg"
          alt="Professional turf facility"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Book Your Perfect
            <span className="block bg-gradient-energy bg-clip-text text-transparent">
              Turf Experience
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
            Premium sports facilities with real-time booking, dynamic pricing, and seamless payment processing.
            Your game, your time, your turf.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/book">
              <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                Book Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <FacilitiesDialog>
              <Button variant="hero" size="lg" className="text-lg px-8 py-4">
                View Facilities
              </Button>
            </FacilitiesDialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-primary-glow" />
              </div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-gray-300">Happy Players</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MapPin className="h-6 w-6 text-primary-glow" />
              </div>
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-gray-300">Courts Available</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-primary-glow" />
              </div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-gray-300">Online Booking</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;