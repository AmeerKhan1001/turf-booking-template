import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="main-content">
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-neutral-100 to-primary/5">
        <div className="flex-grow container mx-auto px-4 py-6 lg:py-10">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardHeader>
                <CardTitle className="text-6xl mb-4">404</CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Page Not Found
                </h2>
                <p className="text-gray-600 mb-6">
                  The page you're looking for doesn't exist or has been moved.
                </p>
                <Button asChild>
                  <Link href="/">Go Back Home</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}