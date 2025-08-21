import React, { useEffect, useState } from 'react';
import {
  Center,
  Spinner,
  Text,
  VStack,
  Button,
  Flex,
  Box,
} from '@chakra-ui/react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import type { UserRole } from '@/type/auth';
import { permissionUtils } from '@/utils/Permission';
import {
  useCurrentUser,
  useForceLogout,
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
      <Box fontSize='md' color='gray.600' maxW='md'>
        You don't have permission to access this page.
        <br />
        {userRole && (
          <Flex justify={'center'}>
            Your role:
            <Text color='teal' fontWeight='bold'>
              {userRole}
            </Text>
          </Flex>
        )}
      </Box>
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
  const { isAuthenticated, isLoading, error, isRefreshing } =
    useIsAuthenticated();
  const currentUser = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const forceLogout = useForceLogout();

  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (requireAuth) {
      if (error) {
        forceLogout('Your session has expired. Please login again.');
        return;
      }

      if (loadingTimeout && !isRefreshing) {
        forceLogout(
          'Authentication verification timed out. Please login again.'
        );
        return;
      }
    }
  }, [error, loadingTimeout, isRefreshing, requireAuth, forceLogout]);

  if (requireAuth && isLoading && !loadingTimeout && !error) {
    return (
      <Center h='100vh'>
        <VStack spacing={4}>
          <Spinner size='xl' />
          <Text>Verifying access...</Text>
          {isRefreshing && (
            <Text fontSize='sm' color='gray.500'>
              Refreshing session...
            </Text>
          )}
        </VStack>
      </Center>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to='/my-account' state={{ from: location }} replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !permissionUtils.hasAnyRole(currentUser?.role, allowedRoles)
  ) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    if (showAccessDenied) {
      return (
        <AccessDeniedFallback
          userRole={currentUser?.role}
          onGoBack={() => navigate(-1)}
          onGoHome={() => {
            const defaultRoute = currentUser?.role
              ? permissionUtils.getDefaultRoute(currentUser.role)
              : '/';
            navigate(defaultRoute);
          }}
        />
      );
    }

    const defaultRoute = currentUser?.role
      ? permissionUtils.getDefaultRoute(currentUser.role)
      : '/my-account';
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
