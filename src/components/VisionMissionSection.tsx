import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Heart, Zap, Shield, Users, Trophy } from "lucide-react";

const VisionMissionSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Our Purpose
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Empowering Sports
            <span className="block text-primary">Communities</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Vision */}
          <Card className="p-8 hover:shadow-elegant transition-all duration-300 border-l-4 border-l-primary">
            <div className="flex items-center mb-6">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Our Vision</h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              To be the leading platform that revolutionizes sports facility management, making premium turf experiences accessible to every athlete and sports enthusiast.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Democratizing access to premium sports facilities</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Building stronger sporting communities</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Promoting healthy and active lifestyles</span>
              </div>
            </div>
          </Card>

          {/* Mission */}
          <Card className="p-8 hover:shadow-elegant transition-all duration-300 border-l-4 border-l-secondary">
            <div className="flex items-center mb-6">
              <div className="bg-secondary/10 p-3 rounded-full mr-4">
                <Heart className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold">Our Mission</h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              We simplify sports facility booking through innovative technology, ensuring seamless experiences for players while maximizing facility utilization for owners.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm">Seamless booking and payment processing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm">Real-time availability and smart pricing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm">Exceptional customer service and support</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center hover:shadow-sport transition-all duration-300 group hover:-translate-y-1">
            <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-primary group-hover:animate-pulse-glow transition-all duration-300">
              <Zap className="h-8 w-8 text-primary group-hover:text-white" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Innovation</h4>
            <p className="text-sm text-muted-foreground">
              Cutting-edge technology for modern sports facility management
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-sport transition-all duration-300 group hover:-translate-y-1">
            <div className="bg-accent/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-accent group-hover:animate-pulse-glow transition-all duration-300">
              <Shield className="h-8 w-8 text-accent group-hover:text-white" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Trust</h4>
            <p className="text-sm text-muted-foreground">
              Secure transactions and reliable service you can count on
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-sport transition-all duration-300 group hover:-translate-y-1">
            <div className="bg-secondary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-secondary group-hover:animate-pulse-glow transition-all duration-300">
              <Users className="h-8 w-8 text-secondary group-hover:text-white" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Community</h4>
            <p className="text-sm text-muted-foreground">
              Building connections through sports and shared experiences
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-sport transition-all duration-300 group hover:-translate-y-1">
            <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-primary group-hover:animate-pulse-glow transition-all duration-300">
              <Trophy className="h-8 w-8 text-primary group-hover:text-white" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Excellence</h4>
            <p className="text-sm text-muted-foreground">
              Delivering exceptional quality in every interaction
            </p>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-hero rounded-2xl p-8 lg:p-12 text-white text-center">
          <h3 className="text-3xl font-bold mb-8">Making Sports Accessible</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="animate-float">
              <div className="text-4xl lg:text-5xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Active Players</div>
            </div>
            <div className="animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="text-4xl lg:text-5xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">Partner Facilities</div>
            </div>
            <div className="animate-float" style={{ animationDelay: '1s' }}>
              <div className="text-4xl lg:text-5xl font-bold mb-2">10k+</div>
              <div className="text-lg opacity-90">Bookings Completed</div>
            </div>
            <div className="animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="text-4xl lg:text-5xl font-bold mb-2">4.9</div>
              <div className="text-lg opacity-90">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionMissionSection;