
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 transition-colors duration-200">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Bojj</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connecting customers with trusted service providers since 2023.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-bojj-primary dark:hover:text-bojj-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-bojj-primary dark:hover:text-bojj-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 dark:text-gray-400 hover:text-bojj-primary dark:hover:text-bojj-primary">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-bojj-primary dark:hover:text-bojj-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-600 dark:text-gray-400 hover:text-bojj-primary dark:hover:text-bojj-primary">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">For Vendors</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/signup?type=vendor" className="text-gray-600 dark:text-gray-400 hover:text-bojj-primary dark:hover:text-bojj-primary">
                  Join as Vendor
                </Link>
              </li>
              <li>
                <Link to="/login?type=vendor" className="text-gray-600 dark:text-gray-400 hover:text-bojj-primary dark:hover:text-bojj-primary">
                  Vendor Login
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">For Customers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/signup?type=customer" className="text-gray-600 dark:text-gray-400 hover:text-bojj-primary dark:hover:text-bojj-primary">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login?type=customer" className="text-gray-600 dark:text-gray-400 hover:text-bojj-primary dark:hover:text-bojj-primary">
                  Customer Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Bojj. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
