import BookingForm from "@/components/BookingForm";
import Cart from "@/components/Cart";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function Book() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">Book Your Turf</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Reserve your spot for an amazing sports experience. Choose your activity, time, and get ready to play!
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
            {/* Booking Form Section */}
            <div className="xl:col-span-7">
              <ErrorBoundary>
                <BookingForm
                  turfName={`${process.env.NEXT_PUBLIC_BUSINESS_NAME}`}
                  turfLocation="Multi Sports Turf"
                />
              </ErrorBoundary>
            </div>

            {/* Cart Section */}
            <div className="xl:col-span-5">
              <div className="xl:sticky xl:top-24">
                <ErrorBoundary>
                  <Cart />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}