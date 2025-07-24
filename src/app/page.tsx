import BookingForm from "@/components/BookingForm";
import Cart from "@/components/Cart";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-100 to-primary/5">
      <main className="flex-grow container mx-auto px-4 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row lg:gap-8 gap-6 max-w-[1400px] mx-auto">
          {/* Main Booking Section */}
          <div className="flex-1 w-full max-w-3xl mx-auto lg:mx-0">
            <ErrorBoundary>
              <BookingForm
                turfName={`${process.env.NEXT_PUBLIC_BUSINESS_NAME}`}
                turfLocation="Multi Sports Turf"
              />
            </ErrorBoundary>
          </div>

          {/* Cart Section */}
          <div className="w-full lg:w-[500px] mx-auto lg:mx-0">
            <div className="lg:sticky lg:top-16">
              <ErrorBoundary>
                <Cart />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}