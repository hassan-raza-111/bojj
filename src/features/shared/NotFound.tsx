import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <main className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 bg-white dark:bg-gray-950">
      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      > */}
      <>
        <h1 className="text-7xl font-bold text-bojj-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="bg-bojj-primary hover:bg-bojj-primary/90">
              Return to Home
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline">Contact Support</Button>
          </Link>
        </div>
      </>
      {/* </motion.div> */}
    </main>
  );
};

export default NotFound;
