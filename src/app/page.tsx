import HeroSection from "@/components/HeroSection";
import PhotosSection from "@/components/PhotosSection";
import VisionMissionSection from "@/components/VisionMissionSection";
import ContactSection from "@/components/ContactSection";

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PhotosSection />
      <VisionMissionSection />
      <ContactSection />
    </div>
  );
};

export default Home;