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
        {/* Auth Form Section */}
        <div className="flex items-center justify-center w-full p-10">
          <div className="w-full max-w-md flex justify-center">
            <AuthForm />
          </div>
        </div>
      </div>
    </main>
  );
}