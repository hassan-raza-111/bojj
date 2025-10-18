import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RoleBasedRedirectProps {
  fallbackPath?: string;
}

export const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({
  fallbackPath = '/customer/messages',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const messagesPath =
        user.role === 'CUSTOMER'
          ? '/customer/messages'
          : user.role === 'VENDOR'
          ? '/vendor/messages'
          : fallbackPath;

      navigate(messagesPath, { replace: true });
    } else {
      navigate(fallbackPath, { replace: true });
    }
  }, [user, navigate, fallbackPath]);

  return null; // This component doesn't render anything
};

export default RoleBasedRedirect;
