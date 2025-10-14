import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, MessageCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md mx-auto text-center">
        {/* 404 Number */}
        <h1 className="text-8xl font-bold text-venbid-primary mb-4">404</h1>

        {/* Main heading */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full bg-venbid-primary hover:bg-venbid-primary/90 text-white">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Link to="/contact">
            <Button variant="ghost" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
