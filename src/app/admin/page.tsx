import { requireAdmin } from "@/lib/auth";
import AdminPanel from "@/components/AdminPanel";
import { Toaster } from "@/components/ui/toaster";
import { format } from "date-fns";

interface Booking {
  id: string;
  customerName: string;
  sport: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  isApproved?: boolean | null;
  peopleCount: number;
}

async function getBookings(date?: string, status?: string): Promise<Booking[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    let url = `${baseUrl}/api/bookings`;
    const params = [];
    
    if (date) {
      params.push(`dates=${JSON.stringify([date])}`);
    }
    if (status && status !== 'all') {
      params.push(`status=${status}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const response = await fetch(url, {
      cache: 'no-store', // Always fetch fresh data for admin
    });

    if (!response.ok) {
      console.error('Failed to fetch bookings:', response.statusText);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    // This will throw if user is not authenticated or not an admin
    const user = await requireAdmin();
    
    // Get search params
    const params = await searchParams;
    const dateParam = typeof params.date === 'string' ? params.date : undefined;
    const statusParam = typeof params.status === 'string' ? params.status : 'pending';
    
    // Set default date to today if no date is provided
    const selectedDate = dateParam || format(new Date(), 'yyyy-MM-dd');
    
    // Fetch bookings based on filters
    const bookings = await getBookings(selectedDate, statusParam);
    
    return (
      <main className="main-content">
        <div className="flex flex-col min-h-screen bg-neutral-50">
          <AdminPanel 
            initialBookings={bookings}
            initialDate={selectedDate}
            initialStatus={statusParam}
          />
          <Toaster />
        </div>
      </main>
    );
  } catch (error) {
    // This should be handled by middleware, but just in case
    return (
      <main className="main-content">
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-100 to-primary/5">
          <div className="flex-grow container mx-auto px-4 py-6 lg:py-10">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Access Denied</h2>
                <p className="text-gray-600 mb-4">
                  You need admin privileges to access this page.
                </p>
                <a 
                  href="/auth"
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}