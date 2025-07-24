'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  MessageSquare,
  Calendar,
  Users
} from "lucide-react";

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    facilityType: "turf-owner",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent Successfully!",
      description: "We'll get back to you within 24 hours.",
    });
    
    setFormData({
      name: "",
      email: "",
      phone: "",
      facilityType: "turf-owner",
      message: ""
    });
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Get In Touch
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Ready to Transform
            <span className="block text-primary">Your Sports Business?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're a turf owner looking to maximize bookings or a player seeking the perfect facility, we're here to help you succeed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="p-6 border-l-4 border-l-primary hover:shadow-elegant transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Visit Our Office</h3>
                  <p className="text-muted-foreground">
                  Palakkad - Coimbatore Rd, BK Pudur,<br />
                    Coimbatore, Kuniyamuthur,<br />
                    Tamil Nadu 641008
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-secondary hover:shadow-elegant transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-secondary/10 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Call Us</h3>
                  <p className="text-muted-foreground">
                    Business: <span className="font-medium">+91 9655781671</span><br />
                    Support: <span className="font-medium">+91 959728928</span>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-accent hover:shadow-elegant transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Email Us</h3>
                  <p className="text-muted-foreground">
                    General: <span className="font-medium">hello@turfbooker.com</span><br />
                    Support: <span className="font-medium">support@turfbooker.com</span>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-primary hover:shadow-elegant transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Business Hours</h3>
                  <p className="text-muted-foreground">
                    Monday - Sunday: Open 24 hours <br />
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
           
          </div>

          {/* Contact Form */}
          <Card className="p-8 shadow-elegant">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 p-3 rounded-full">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Send Us a Message</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium mb-2 block">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                    className="focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-2 block">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                    className="focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="text-sm font-medium mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="facilityType" className="text-sm font-medium mb-2 block">
                    I am a *
                  </label>
                  <select
                    id="facilityType"
                    name="facilityType"
                    value={formData.facilityType}
                    onChange={handleInputChange}
                    required
                    className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:border-primary"
                  >
                    <option value="turf-owner">Turf Owner</option>
                    <option value="player">Player/Customer</option>
                    <option value="business-partner">Business Partner</option>
                    <option value="investor">Investor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="text-sm font-medium mb-2 block">
                  Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about your requirements, questions, or how we can help you..."
                  rows={5}
                  required
                  className="focus:border-primary resize-none"
                />
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              By submitting this form, you agree to our privacy policy and terms of service.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;