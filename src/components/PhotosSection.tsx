'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MapPin, Clock, Users } from "lucide-react";

const facilities = [
  {
    id: 1,
    title: "Multi-Sport Courts",
    description: "Professional courts for football, basketball, and tennis with premium artificial turf surfaces",
    image: "/gallery-courts.jpg",
    features: ["Football", "Basketball", "Tennis"],
    capacity: "22 players",
    available: true
  },
  {
    id: 2,
    title: "Indoor Facilities",
    description: "Climate-controlled indoor courts perfect for badminton, futsal, and basketball year-round",
    image: "/gallery-indoor.jpg",
    features: ["Badminton", "Futsal", "Basketball"],
    capacity: "16 players",
    available: true
  },
  {
    id: 3,
    title: "Night Gaming",
    description: "Floodlit courts with professional LED lighting for extended playing hours and evening matches",
    image: "/gallery-night.jpg",
    features: ["LED Lighting", "Evening Play", "Pro Quality"],
    capacity: "22 players",
    available: false
  }
];

const PhotosSection = () => {
  const [selectedFacility, setSelectedFacility] = useState(facilities[0]);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Our Facilities
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            World-Class Sports
            <span className="block text-primary">Infrastructure</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience premium sports facilities designed for peak performance. Our state-of-the-art courts and equipment ensure every game is exceptional.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Facility Selector */}
          <div className="space-y-6">
            {facilities.map((facility) => (
              <Card 
                key={facility.id}
                className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-elegant ${
                  selectedFacility.id === facility.id 
                    ? 'border-primary shadow-sport bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedFacility(facility)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">{facility.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={facility.available ? "default" : "secondary"}
                      className={facility.available ? "bg-primary" : ""}
                    >
                      {facility.available ? "Available" : "Booking Soon"}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  {facility.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {facility.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {facility.capacity}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Selected Facility Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-elegant group">
              <img 
                src={selectedFacility.image} 
                alt={selectedFacility.title}
                className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h4 className="text-2xl font-bold mb-2">{selectedFacility.title}</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Indoor/Outdoor
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          6 AM - 12 AM
                        </div>
                      </div>
                    </div>
                    <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-6 left-6 right-6">
              <Card className="p-4 bg-white/95 backdrop-blur-sm border-primary/20 shadow-elegant">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">15+</div>
                    <div className="text-xs text-muted-foreground">Courts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">4.9</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhotosSection;