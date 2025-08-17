import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";
import ThemeToggle from "@/contexts/ThemeToggle";

const Navbar = () => {
  const location = useLocation();
  
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-bojj-primary">
            Bojj
          </Link>
          <nav className="ml-8 hidden md:block">
            <ul className="flex space-x-6">
              <li>
                <Link
                  to="/about"
                  aria-current={location.pathname === "/about" ? "page" : undefined}
                  className={`text-gray-600 dark:text-gray-300 hover:text-bojj-primary dark:hover:text-bojj-primary transition-colors ${
                    location.pathname === "/about" ? "text-bojj-primary" : ""
                  }`}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className={`text-gray-600 dark:text-gray-300 hover:text-bojj-primary dark:hover:text-bojj-primary transition-colors ${
                    location.pathname === "/faq" ? "text-bojj-primary" : ""
                  }`}
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={`text-gray-600 dark:text-gray-300 hover:text-bojj-primary dark:hover:text-bojj-primary transition-colors ${
                    location.pathname === "/contact" ? "text-bojj-primary" : ""
                  }`}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className={`text-gray-600 dark:text-gray-300 hover:text-bojj-primary dark:hover:text-bojj-primary transition-colors ${
                    location.pathname === "/support" ? "text-bojj-primary" : ""
                  }`}
                >
                  Support
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          <SignedIn>
            <div className="flex items-center space-x-4">
              <Link to="/customer">
                <Button variant="outline" className="dark:border-gray-700 dark:text-white dark:hover:bg-gray-800">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          
          <SignedOut>
            {/* <motion.div
              className="flex space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            > */}
              <Link to="/login?type=vendor">
                <Button 
                  variant="outline" 
                  className="border-bojj-primary text-bojj-primary dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                >
                  Vendor Login
                </Button>
              </Link>
              <Link to="/login?type=customer">
                <Button className="bg-bojj-primary hover:bg-bojj-primary/90 dark:bg-bojj-primary/80 dark:hover:bg-bojj-primary">
                  Customer Login
                </Button>
              </Link>
            {/* </motion.div> */}
          </SignedOut>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
