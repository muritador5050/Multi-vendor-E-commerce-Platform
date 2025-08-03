import { useCreateVendorProfile } from '@/context/VendorContextService';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useHasVendorProfileWithRedirect = (
  redirectPath = '/vendors/onboarding'
) => {
  const navigate = useNavigate();
  const { data, isPending, error } = useCreateVendorProfile();

  const hasVendorProfile = data?.hasVendorProfile ?? false;

  useEffect(() => {
    if (!isPending && data && !hasVendorProfile) {
      navigate(redirectPath);
    }
  }, [isPending, data, hasVendorProfile, navigate, redirectPath]);

  return {
    hasVendorProfile,
    isPending,
    error,
    data,
  };
};
