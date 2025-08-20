import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
// import { motion } from "framer-motion";
import ThemeToggle from '@/contexts/ThemeToggle';

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className='border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900'>
      <div className='container mx-auto flex items-center justify-between py-4 px-6'>
        <div className='flex items-center'>
          <Link to='/' className='text-2xl font-bold text-bojj-primary'>
            Bojj
          </Link>
          <nav className='ml-8 hidden md:block'>
            <ul className='flex space-x-6'>
              <li>
                <Link
                  to='/about'
                  aria-current={
                    location.pathname === '/about' ? 'page' : undefined
                  }
                  className={`text-gray-600 dark:text-gray-300 hover:text-bojj-primary dark:hover:text-bojj-primary transition-colors ${
                    location.pathname === '/about' ? 'text-bojj-primary' : ''
                  }`}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to='/faq'
                  className={`text-gray-600 dark:text-gray-300 hover:text-bojj-primary dark:hover:text-bojj-primary transition-colors ${
                    location.pathname === '/faq' ? 'text-bojj-primary' : ''
                  }`}
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to='/contact'
                  className={`text-gray-600 dark:text-gray-300 hover:text-bojj-primary dark:hover:text-bojj-primary transition-colors ${
                    location.pathname === '/contact' ? 'text-bojj-primary' : ''
                  }`}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to='/support'
                  className={`text-gray-600 dark:text-gray-300 hover:text-bojj-primary dark:hover:text-bojj-primary transition-colors ${
                    location.pathname === '/support' ? 'text-bojj-primary' : ''
                  }`}
                >
                  Support
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className='flex items-center space-x-4'>
          {/* Theme Toggle */}
          <ThemeToggle />

          {isAuthenticated ? (
            <div className='flex items-center space-x-4'>
              {user?.role === 'VENDOR' ? (
                <Link to='/vendor-dashboard'>
                  <Button
                    variant='outline'
                    className='dark:border-gray-700 dark:text-white dark:hover:bg-gray-800'
                  >
                    Vendor Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to='/customer'>
                  <Button
                    variant='outline'
                    className='dark:border-gray-700 dark:text-white dark:hover:bg-gray-800'
                  >
                    Customer Dashboard
                  </Button>
                </Link>
              )}
              <Button
                variant='outline'
                onClick={logout}
                className='dark:border-gray-700 dark:text-white dark:hover:bg-gray-800'
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className='flex space-x-4'>
              <Link to='/login?type=vendor'>
                <Button
                  variant='outline'
                  className='border-bojj-primary text-bojj-primary dark:border-gray-700 dark:text-white dark:hover:bg-gray-800'
                >
                  Vendor Login
                </Button>
              </Link>
              <Link to='/login?type=customer'>
                <Button className='bg-bojj-primary hover:bg-bojj-primary/90 dark:bg-bojj-primary/80 dark:hover:bg-bojj-primary'>
                  Customer Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
