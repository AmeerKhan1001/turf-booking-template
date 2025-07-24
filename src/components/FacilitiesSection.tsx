'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight,
  Zap,
  Users,
  Car,
  Wifi,
  Shield,
  CreditCard,
  MapPin,
  Clock,
  Heart,
  Accessibility,
  ParkingCircle
} from "lucide-react";
import Link from "next/link";

interface FacilitiesDialogProps {
  children: React.ReactNode;
}

const FacilitiesDialog = ({ children }: FacilitiesDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sports = [
    { name: "Football", icon: "⚽", description: "Professional 11v11 and 7v7 pitches" },
    { name: "Cricket", icon: "🏏", description: "Indoor and outdoor cricket nets" },
    { name: "Basketball", icon: "🏀", description: "Full court and half court options" },
    { name: "Badminton", icon: "🏸", description: "Premium wooden flooring courts" },
    { name: "Tennis", icon: "🎾", description: "Hard court and clay court surfaces" },
    { name: "Volleyball", icon: "🏐", description: "Indoor and beach volleyball" }
  ];

  const amenities = [
    { 
      icon: <Accessibility className="h-5 w-5" />, 
      title: "Gender-Neutral Toilets", 
      description: "Clean, accessible facilities for everyone",
      category: "Accessibility"
    },
    { 
      icon: <Heart className="h-5 w-5" />, 
      title: "LGBTQ+ Friendly", 
      description: "Welcoming and inclusive environment",
      category: "Inclusivity"
    },
    { 
      icon: <Car className="h-5 w-5" />, 
      title: "Free Parking", 
      description: "Ample parking space at no extra cost",
      category: "Parking"
    },
    { 
      icon: <ParkingCircle className="h-5 w-5" />, 
      title: "Garage Parking", 
      description: "Covered parking for premium protection",
      category: "Parking"
    },
    { 
      icon: <MapPin className="h-5 w-5" />, 
      title: "On-Site Parking", 
      description: "Convenient parking right at the facility",
      category: "Parking"
    },
    { 
      icon: <CreditCard className="h-5 w-5" />, 
      title: "UPI Payments", 
      description: "Quick and secure digital payments",
      category: "Payment"
    },
    { 
      icon: <Wifi className="h-5 w-5" />, 
      title: "Free WiFi", 
      description: "High-speed internet throughout the facility",
      category: "Connectivity"
    },
    { 
      icon: <Shield className="h-5 w-5" />, 
      title: "24/7 Security", 
      description: "Round-the-clock security and CCTV monitoring",
      category: "Safety"
    },
  ];

  const groupedAmenities = amenities.reduce((acc, amenity) => {
    if (!acc[amenity.category]) {
      acc[amenity.category] = [];
    }
    acc[amenity.category].push(amenity);
    return acc;
  }, {} as Record<string, typeof amenities>);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Our Sports & Facilities
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Sports Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-primary border-primary">
                Sports Available
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sports.map((sport, index) => (
                <Card key={index} className="p-4 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{sport.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{sport.name}</h3>
                      <p className="text-sm text-muted-foreground">{sport.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Amenities Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="outline" className="text-secondary border-secondary">
                Amenities & Services
              </Badge>
            </div>
            
            <div className="space-y-6">
              {Object.entries(groupedAmenities).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold mb-3 text-primary">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((amenity, index) => (
                      <Card key={index} className="p-4 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full text-primary">
                            {amenity.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{amenity.title}</h4>
                            <p className="text-sm text-muted-foreground">{amenity.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">Ready to Book?</h3>
            <p className="text-muted-foreground mb-4">
              Experience our world-class facilities and inclusive environment
            </p>
            <Link href="/book">
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => setIsOpen(false)}
              >
                Book Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FacilitiesDialog;