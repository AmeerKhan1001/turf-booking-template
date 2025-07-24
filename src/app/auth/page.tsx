import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AuthForm from '@/components/AuthForm';

export default async function AuthPage() {
  // Check if user is already authenticated
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  return (
    <main className="main-content">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Hero Section */}
        <div className="flex-1 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-8">
          <div className="max-w-md text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to TurfBooker
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Book your favorite sports courts with ease. Join thousands of players who trust us for their game time.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>✅ Instant booking confirmation</p>
              <p>✅ Real-time availability</p>
              <p>✅ Secure payment options</p>
              <p>✅ 24/7 customer support</p>
            </div>
          </div>
        </div>

        {/* Auth Form Section */}
        <div className="flex items-center justify-center w-full lg:w-1/2 p-8">
          <div className="w-full max-w-md">
            <AuthForm />
          </div>
        </div>
      </div>
    </main>
  );
}