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

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
//   children,
//   allowedRoles = [],
//   requireAuth = true,
//   redirectTo,
//   showAccessDenied = false,
// }) => {
//   const { isAuthenticated, isLoading } = useIsAuthenticated();
//   const currentUser = useCurrentUser();
//   const location = useLocation();
//   const navigate = useNavigate();

//   if (isLoading || (requireAuth && !currentUser)) {
//     return (
//       <Center h='100vh'>
//         <VStack spacing={4}>
//           <Spinner size='xl' />
//           <Text>Verifying access...</Text>
//         </VStack>
//       </Center>
//     );
//   }

//   // Redirect to login if auth is required but user is not authenticated
//   if (requireAuth && !isAuthenticated) {
//     return <Navigate to='/my-account' state={{ from: location }} replace />;
//   }

//   // Check role permissions if roles are specified
//   if (
//     allowedRoles.length > 0 &&
//     !permissionUtils.hasAnyRole(currentUser?.role, allowedRoles)
//   ) {
//     // Use custom redirect if provided
//     if (redirectTo) {
//       return <Navigate to={redirectTo} replace />;
//     }

//     // Show access denied page if requested
//     if (showAccessDenied) {
//       return (
//         <AccessDeniedFallback
//           userRole={currentUser?.role}
//           onGoBack={() => navigate(-1)}
//           onGoHome={() => {
//             const defaultRoute = currentUser?.role
//               ? permissionUtils.getDefaultRoute(currentUser.role)
//               : '/';
//             navigate(defaultRoute);
//           }}
//         />
//       );
//     }

//     const defaultRoute = currentUser?.role
//       ? permissionUtils.getDefaultRoute(currentUser.role)
//       : '/my-account';
//     return <Navigate to={defaultRoute} replace />;
//   }

//   return <>{children}</>;
// };

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

  // Add timeout for stuck loading states
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.warn('ProtectedRoute: Loading timeout reached');
        setLoadingTimeout(true);
      }, 10000); // 10 seconds timeout

      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  // Handle various failure scenarios
  useEffect(() => {
    if (requireAuth) {
      // If we have an auth error, force logout
      if (error) {
        console.log('ProtectedRoute: Auth error detected, forcing logout');
        forceLogout('Your session has expired. Please login again.');
        return;
      }

      // If loading timed out and we're not refreshing, something is wrong
      if (loadingTimeout && !isRefreshing) {
        console.log('ProtectedRoute: Loading timeout, forcing logout');
        forceLogout(
          'Authentication verification timed out. Please login again.'
        );
        return;
      }
    }
  }, [error, loadingTimeout, isRefreshing, requireAuth, forceLogout]);

  // Show loading only if we're actually loading and haven't timed out
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

  // At this point, loading is complete or we have an error
  // Redirect to login if auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to='/my-account' state={{ from: location }} replace />;
  }

  // Check role permissions if roles are specified
  if (
    allowedRoles.length > 0 &&
    !permissionUtils.hasAnyRole(currentUser?.role, allowedRoles)
  ) {
    // Use custom redirect if provided
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Show access denied page if requested
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
