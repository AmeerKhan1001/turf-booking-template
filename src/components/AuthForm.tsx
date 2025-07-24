'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { loginAction, registerAction } from '@/lib/actions';

export default function AuthForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get redirect URL from search params, default to home
  const redirectTo = searchParams.get('redirect') || '/';

  const handleLogin = async (formData: FormData) => {
    startTransition(async () => {
      setError('');
      setSuccess('');
      setFieldErrors({});

      const result = await loginAction(formData);
      
      if (result.success) {
        setSuccess(result.message);
        // Redirect after successful login
        setTimeout(() => {
          router.push(redirectTo);
        }, 1000);
      } else {
        setError(result.message);
        if (result.errors) {
          setFieldErrors(result.errors);
        }
      }
    });
  };

  const handleRegister = async (formData: FormData) => {
    startTransition(async () => {
      setError('');
      setSuccess('');
      setFieldErrors({});

      const result = await registerAction(formData);
      
      if (result.success) {
        setSuccess(result.message);
        // Redirect after successful registration
        setTimeout(() => {
          router.push(redirectTo);
        }, 1000);
      } else {
        setError(result.message);
        if (result.errors) {
          setFieldErrors(result.errors);
        }
      }
    });
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>

      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>
              Please login with your administrator credentials to manage bookings
            </CardDescription>
          </CardHeader>
          <form action={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                />
                {fieldErrors.username && (
                  <p className="text-sm text-red-600">{fieldErrors.username[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
                {fieldErrors.password && (
                  <p className="text-sm text-red-600">{fieldErrors.password[0]}</p>
                )}
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                This login is for turf administrators only. Users can book directly without logging in.
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login as Admin'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="register">
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Create a new administrator account
            </CardDescription>
          </CardHeader>
          <form action={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username">Username</Label>
                <Input
                  id="signup-username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  required
                />
                {fieldErrors.username && (
                  <p className="text-sm text-red-600">{fieldErrors.username[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-fullname">Full Name</Label>
                <Input
                  id="signup-fullname"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  required
                />
                {fieldErrors.fullName && (
                  <p className="text-sm text-red-600">{fieldErrors.fullName[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="Choose a password"
                  required
                />
                {fieldErrors.password && (
                  <p className="text-sm text-red-600">{fieldErrors.password[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  required
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{fieldErrors.confirmPassword[0]}</p>
                )}
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}