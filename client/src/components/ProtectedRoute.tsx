import React from 'react';
import { Center, Spinner, Text, VStack, Button } from '@chakra-ui/react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { UserRole } from '@/type/auth';
import { permissionUtils } from '@/utils/Permission';
import {
  useCurrentUser,
  useIsAuthenticated,
} from '@/context/AuthContextService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
  showAccessDenied?: boolean;
}

const AccessDeniedFallback: React.FC<{
  userRole?: UserRole;
  onGoBack: () => void;
  onGoHome: () => void;
}> = ({ userRole, onGoBack, onGoHome }) => (
  <Center h='100vh'>
    <VStack spacing={4} textAlign='center'>
      <Text fontSize='2xl' fontWeight='bold' color='red.500'>
        Access Denied
      </Text>
      <Text fontSize='md' color='gray.600' maxW='md'>
        You don't have the necessary permissions to access this page.
        {userRole && ` Your current role: ${userRole}`}
      </Text>
      <VStack spacing={2}>
        <Button onClick={onGoBack} variant='outline'>
          Go Back
        </Button>
        <Button onClick={onGoHome} colorScheme='blue'>
          Go to Dashboard
        </Button>
      </VStack>
    </VStack>
  </Center>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
  redirectTo,
  showAccessDenied = false,
}) => {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const user = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Center h='100vh'>
        <VStack spacing={4}>
          <Spinner size='xl' />
          <Text>Verifying access...</Text>
        </VStack>
      </Center>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to='/my-account' state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const hasRequiredRole = permissionUtils.hasAnyRole(
      user?.role,
      allowedRoles
    );

    if (!hasRequiredRole) {
      if (redirectTo) {
        return <Navigate to={redirectTo} replace />;
      }

      if (showAccessDenied) {
        return (
          <AccessDeniedFallback
            userRole={user?.role}
            onGoBack={() => navigate(-1)}
            onGoHome={() => {
              const defaultRoute = user?.role
                ? permissionUtils.getDefaultRoute(user?.role)
                : '/';
              navigate(defaultRoute);
            }}
          />
        );
      }
      const defaultRoute = user?.role
        ? permissionUtils.getDefaultRoute(user.role)
        : '/my-account';
      return <Navigate to={defaultRoute} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
