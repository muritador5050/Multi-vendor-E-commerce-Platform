import { useVendorProfileStatus } from '@/context/VendorContextService';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Center } from '@chakra-ui/react';

interface VendorProfileGuardProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export const VendorProfileGuard = ({
  children,
  redirectPath = '/vendors/onboarding',
}: VendorProfileGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading, isError } = useVendorProfileStatus();

  const hasVendorProfile = data?.hasVendorProfile ?? false;
  const isOnRedirectPath = location.pathname === redirectPath;

  useEffect(() => {
    if (!isLoading && !isError && !hasVendorProfile && !isOnRedirectPath) {
      navigate(redirectPath, { replace: true });
    }
  }, [
    isLoading,
    isError,
    hasVendorProfile,
    isOnRedirectPath,
    navigate,
    redirectPath,
  ]);

  if (isLoading) {
    return <Center>Checking vendor profile...</Center>;
  }

  // Handle error state
  if (isError) {
    return <Center>Error checking vendor profile. Please try again.</Center>;
  }

  if (hasVendorProfile || isOnRedirectPath) {
    return <>{children}</>;
  }

  // Don't render anything while redirecting
  return null;
};
