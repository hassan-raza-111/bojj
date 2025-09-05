import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/contexts/ThemeToggle';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ChatButton } from '@/components/shared/ChatButton';

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  const navigationItems = [
    { name: 'About Us', path: '/about' },
    { name: 'FAQs', path: '/faq' },
    { name: 'Contact', path: '/contact' },
    { name: 'Support', path: '/support' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link to='/' className='flex items-center space-x-2'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-bojj-primary to-bojj-secondary text-white font-bold text-xl shadow-lg'>
                B
              </div>
              <span className='hidden sm:block text-2xl font-bold bg-gradient-to-r from-bojj-primary to-bojj-secondary bg-clip-text text-transparent'>
                Bojj
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-8'>
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-bojj-primary ${
                  isActive(item.path)
                    ? 'text-bojj-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-bojj-primary to-bojj-secondary rounded-full' />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className='flex items-center space-x-4'>
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Chat Button - Only show for authenticated users */}
            {isAuthenticated && <ChatButton />}

            {/* Desktop Auth Buttons */}
            <div className='hidden md:flex items-center space-x-3'>
              {isAuthenticated ? (
                <>
                  {user?.role === 'VENDOR' ? (
                    <Link to='/vendor'>
                      <Button
                        variant='outline'
                        className='border-bojj-primary/20 text-bojj-primary hover:bg-bojj-primary/10 hover:border-bojj-primary/30 transition-all duration-200'
                      >
                        Vendor Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link to='/customer'>
                      <Button
                        variant='outline'
                        className='border-bojj-primary/20 text-bojj-primary hover:bg-bojj-primary/10 hover:border-bojj-primary/30 transition-all duration-200'
                      >
                        Customer Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant='ghost'
                    onClick={logout}
                    className='text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to='/login?type=vendor'>
                    <Button
                      variant='outline'
                      className='border-bojj-primary/20 text-bojj-primary hover:bg-bojj-primary/10 hover:border-bojj-primary/30 transition-all duration-200'
                    >
                      Vendor Login
                    </Button>
                  </Link>
                  <Link to='/login?type=customer'>
                    <Button className='bg-gradient-to-r from-bojj-primary to-bojj-secondary hover:from-bojj-primary/90 hover:to-bojj-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5'>
                      Customer Login
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors'
              aria-label='Toggle mobile menu'
            >
              {isMobileMenuOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className='md:hidden border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
            <div className='px-4 py-6 space-y-4'>
              {/* Mobile Navigation Items */}
              <nav className='space-y-3'>
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-bojj-primary/10 text-bojj-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Mobile Auth Buttons */}
              <div className='pt-4 border-t border-border/40 space-y-3'>
                {isAuthenticated ? (
                  <>
                    {user?.role === 'VENDOR' ? (
                      <Link to='/vendor' className='block w-full'>
                        <Button
                          variant='outline'
                          className='w-full border-bojj-primary/20 text-bojj-primary hover:bg-bojj-primary/10'
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Vendor Dashboard
                        </Button>
                      </Link>
                    ) : (
                      <Link to='/customer' className='block w-full'>
                        <Button
                          variant='outline'
                          className='w-full border-bojj-primary/20 text-bojj-primary hover:bg-bojj-primary/10'
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Customer Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant='ghost'
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className='w-full text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to='/login?type=vendor' className='block w-full'>
                      <Button
                        variant='outline'
                        className='w-full border-bojj-primary/20 text-bojj-primary hover:bg-bojj-primary/10'
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Vendor Login
                      </Button>
                    </Link>
                    <Link to='/login?type=customer' className='block w-full'>
                      <Button
                        className='w-full bg-gradient-to-r from-bojj-primary to-bojj-secondary hover:from-bojj-primary/90 hover:to-bojj-secondary/90 text-white'
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Customer Login
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
