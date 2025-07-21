// ====================
// QUERY HOOKS USAGE
// ====================

// 1. useUsers - Get paginated list of users
function UsersList() {
  const { data, isLoading, error } = useUsers({
    page: 1,
    limit: 10,
    search: 'john',
  });

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.users.map((user) => (
        <div key={user._id}>
          {user.name} - {user.email}
        </div>
      ))}
      <p>Total: {data?.total} users</p>
    </div>
  );
}

// 2. useUserById - Get specific user by ID
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUserById(userId);

  if (isLoading) return <div>Loading user...</div>;
  if (error) return <div>User not found</div>;

  return (
    <div>
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}

// 3. useProfile - Get current user's profile
function MyProfile() {
  const { data, isLoading, error } = useProfile();

  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div>Error loading profile</div>;

  return (
    <div>
      <h1>Welcome, {data?.user.name}!</h1>
      <p>Email: {data?.user.email}</p>
      <p>Profile Completion: {data?.profileCompletion}%</p>
    </div>
  );
}

// 4. useUserStatus - Get user's status (active, email verified, etc.)
function UserStatusCard({ userId }: { userId: string }) {
  const { data: status, isLoading } = useUserStatus(userId);

  if (isLoading) return <div>Loading status...</div>;

  return (
    <div>
      <p>Active: {status?.isActive ? 'Yes' : 'No'}</p>
      <p>Email Verified: {status?.isEmailVerified ? 'Yes' : 'No'}</p>
      <p>Token Version: {status?.tokenVersion}</p>
    </div>
  );
}

// ====================
// MUTATION HOOKS USAGE
// ====================

// 5. useLogin - Handle user login
function LoginForm() {
  const loginMutation = useLogin();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync(formData);
      // User will be redirected automatically on success
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='email'
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder='Email'
        required
      />
      <input
        type='password'
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder='Password'
        required
      />
      <label>
        <input
          type='checkbox'
          checked={formData.rememberMe}
          onChange={(e) =>
            setFormData({ ...formData, rememberMe: e.target.checked })
          }
        />
        Remember Me
      </label>
      <button type='submit' disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </button>
      {loginMutation.error && <p>Error: {loginMutation.error.message}</p>}
    </form>
  );
}

// 6. useRegister - Handle user registration
function RegisterForm() {
  const registerMutation = useRegister({
    onSuccess: () => {
      alert(
        'Registration successful! Please check your email for verification.'
      );
    },
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='text'
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder='Full Name'
        required
      />
      <input
        type='email'
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder='Email'
        required
      />
      <input
        type='password'
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder='Password'
        required
      />
      <input
        type='password'
        value={formData.confirmPassword}
        onChange={(e) =>
          setFormData({ ...formData, confirmPassword: e.target.value })
        }
        placeholder='Confirm Password'
        required
      />
      <button type='submit' disabled={registerMutation.isPending}>
        {registerMutation.isPending ? 'Creating Account...' : 'Register'}
      </button>
    </form>
  );
}

// 7. useRegisterVendor - Handle vendor registration
function VendorRegisterForm() {
  const registerVendorMutation = useRegisterVendor({
    onSuccess: () => {
      alert('Vendor registration successful! Please wait for approval.');
    },
  });

  const handleSubmit = async (formData: any) => {
    try {
      await registerVendorMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Vendor registration failed:', error);
    }
  };

  return (
    <div>
      {/* Similar form structure as regular registration */}
      <button
        onClick={() =>
          handleSubmit({
            /* form data */
          })
        }
      >
        Register as Vendor
      </button>
    </div>
  );
}

// 8. useLogout - Handle user logout
function LogoutButton() {
  const logoutMutation = useLogout({
    onSuccess: () => {
      console.log('Successfully logged out');
    },
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // User will be redirected automatically
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button onClick={handleLogout} disabled={logoutMutation.isPending}>
      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
    </button>
  );
}

// 9. useForgotPassword - Handle forgot password
function ForgotPasswordForm() {
  const forgotPasswordMutation = useForgotPassword({
    onSuccess: () => {
      alert('Password reset email sent! Check your inbox.');
    },
  });

  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPasswordMutation.mutateAsync(email);
    } catch (error) {
      console.error('Forgot password failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Enter your email'
        required
      />
      <button type='submit' disabled={forgotPasswordMutation.isPending}>
        {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Email'}
      </button>
    </form>
  );
}

// 10. useResetPassword - Handle password reset
function ResetPasswordForm({ token }: { token: string }) {
  const resetPasswordMutation = useResetPassword({
    onSuccess: () => {
      alert('Password reset successful! You can now login.');
    },
  });

  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPasswordMutation.mutateAsync({
        token,
        ...passwords,
      });
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='password'
        value={passwords.password}
        onChange={(e) =>
          setPasswords({ ...passwords, password: e.target.value })
        }
        placeholder='New Password'
        required
      />
      <input
        type='password'
        value={passwords.confirmPassword}
        onChange={(e) =>
          setPasswords({ ...passwords, confirmPassword: e.target.value })
        }
        placeholder='Confirm New Password'
        required
      />
      <button type='submit' disabled={resetPasswordMutation.isPending}>
        Reset Password
      </button>
    </form>
  );
}

// 11. useUpdateProfile - Update user profile
function EditProfileForm() {
  const updateProfileMutation = useUpdateProfile();
  const { data: profile } = useProfile();

  const [formData, setFormData] = useState({
    name: profile?.user.name || '',
    email: profile?.user.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync(formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='text'
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder='Name'
      />
      <input
        type='email'
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder='Email'
      />
      <button type='submit' disabled={updateProfileMutation.isPending}>
        {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}

// 12. useVerifyEmail - Verify user email
function EmailVerificationHandler({ token }: { token: string }) {
  const verifyEmailMutation = useVerifyEmail({
    onSuccess: () => {
      alert('Email verified successfully!');
    },
    onError: (error) => {
      alert(`Verification failed: ${error.message}`);
    },
  });

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token);
    }
  }, [token]);

  if (verifyEmailMutation.isPending) return <div>Verifying email...</div>;

  return <div>Email verification complete</div>;
}

// 13. useUploadFile - Upload files
function FileUploadForm() {
  const uploadFileMutation = useUploadFile();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadFileMutation.mutateAsync({
        file,
        endpoint: '/upload/avatar', // optional custom endpoint
      });
      console.log('File uploaded:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input type='file' onChange={handleFileUpload} accept='image/*' />
      {uploadFileMutation.isPending && <div>Uploading...</div>}
    </div>
  );
}

// 14. useDeactivateUser - Deactivate a user
function DeactivateUserButton({ userId }: { userId: string }) {
  const deactivateUserMutation = useDeactivateUser();

  const handleDeactivate = async () => {
    if (confirm('Are you sure you want to deactivate this user?')) {
      try {
        await deactivateUserMutation.mutateAsync(userId);
        alert('User deactivated successfully');
      } catch (error) {
        console.error('Deactivation failed:', error);
      }
    }
  };

  return (
    <button
      onClick={handleDeactivate}
      disabled={deactivateUserMutation.isPending}
      className='bg-red-500 text-white px-4 py-2 rounded'
    >
      {deactivateUserMutation.isPending ? 'Deactivating...' : 'Deactivate User'}
    </button>
  );
}

// 15. useActivateUser - Activate a user
function ActivateUserButton({ userId }: { userId: string }) {
  const activateUserMutation = useActivateUser();

  const handleActivate = async () => {
    try {
      await activateUserMutation.mutateAsync(userId);
      alert('User activated successfully');
    } catch (error) {
      console.error('Activation failed:', error);
    }
  };

  return (
    <button
      onClick={handleActivate}
      disabled={activateUserMutation.isPending}
      className='bg-green-500 text-white px-4 py-2 rounded'
    >
      {activateUserMutation.isPending ? 'Activating...' : 'Activate User'}
    </button>
  );
}

// 16. useInvalidateUserTokens - Force logout user by invalidating tokens
function InvalidateTokensButton({ userId }: { userId: string }) {
  const invalidateTokensMutation = useInvalidateUserTokens();

  const handleInvalidateTokens = async () => {
    if (confirm('This will force the user to login again. Continue?')) {
      try {
        await invalidateTokensMutation.mutateAsync(userId);
        alert('User tokens invalidated successfully');
      } catch (error) {
        console.error('Token invalidation failed:', error);
      }
    }
  };

  return (
    <button
      onClick={handleInvalidateTokens}
      disabled={invalidateTokensMutation.isPending}
      className='bg-orange-500 text-white px-4 py-2 rounded'
    >
      {invalidateTokensMutation.isPending ? 'Invalidating...' : 'Force Logout'}
    </button>
  );
}

// ====================
// UTILITY HOOKS USAGE
// ====================

// 17. useCurrentUser - Get current logged-in user
function UserGreeting() {
  const currentUser = useCurrentUser();

  if (!currentUser) return <div>Not logged in</div>;

  return <div>Hello, {currentUser.name}!</div>;
}

// 18. useProfileCompletion - Get profile completion percentage
function ProfileCompletionBar() {
  const profileCompletion = useProfileCompletion();

  return (
    <div>
      <div>Profile Completion: {profileCompletion}%</div>
      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className='bg-blue-600 h-2 rounded-full'
          style={{ width: `${profileCompletion}%` }}
        ></div>
      </div>
    </div>
  );
}

// 19. useIsAuthenticated - Check if user is authenticated
function AuthStatus() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();

  if (isLoading) return <div>Checking authentication...</div>;

  return <div>Status: {isAuthenticated ? 'Logged In' : 'Not Logged In'}</div>;
}

// 20. useCanPerformAction - Check if user can perform specific action
function AdminPanel() {
  const canManageUsers = useCanPerformAction('MANAGE_USERS');
  const canViewReports = useCanPerformAction('VIEW_REPORTS');

  return (
    <div>
      {canManageUsers && <button>Manage Users</button>}
      {canViewReports && <button>View Reports</button>}
      {!canManageUsers && !canViewReports && (
        <div>You don't have admin permissions</div>
      )}
    </div>
  );
}

// 21. useHasAnyRole - Check if user has any of the specified roles
function RoleBasedContent() {
  const hasAdminOrVendorRole = useHasAnyRole(['ADMIN', 'VENDOR']);

  if (!hasAdminOrVendorRole) {
    return <div>This content is restricted</div>;
  }

  return <div>Welcome to the admin/vendor area!</div>;
}

// 22. useIsAdmin - Check if user is admin
function AdminOnlyButton() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) return null;

  return <button>Admin Only Action</button>;
}

// 23. useCanManageUser - Check management permissions for specific user
function UserManagementButtons({ userId }: { userId: string }) {
  const { canDeactivate, canActivate, canInvalidateTokens, canViewStatus } =
    useCanManageUser(userId);

  return (
    <div>
      {canViewStatus && <UserStatusCard userId={userId} />}
      {canDeactivate && <DeactivateUserButton userId={userId} />}
      {canActivate && <ActivateUserButton userId={userId} />}
      {canInvalidateTokens && <InvalidateTokensButton userId={userId} />}
    </div>
  );
}

// 24. useUserActivityStatus - Get user activity status
function UserActivityIndicator({ userId }: { userId: string }) {
  const { isActive, isEmailVerified, tokenVersion, lastUpdated } =
    useUserActivityStatus(userId);

  return (
    <div className='p-4 border rounded'>
      <div
        className={`inline-block w-3 h-3 rounded-full ${
          isActive ? 'bg-green-500' : 'bg-red-500'
        }`}
      ></div>
      <span className='ml-2'>{isActive ? 'Active' : 'Inactive'}</span>

      {isEmailVerified ? (
        <div className='text-green-600'>✓ Email Verified</div>
      ) : (
        <div className='text-red-600'>✗ Email Not Verified</div>
      )}

      <div className='text-sm text-gray-500'>
        Token Version: {tokenVersion}
        {lastUpdated && (
          <div>Last Updated: {new Date(lastUpdated).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
}

// 25. useGoogleLogin - Handle Google OAuth login
function GoogleLoginButton() {
  const googleLoginMutation = useGoogleLogin();

  const handleGoogleLogin = () => {
    googleLoginMutation.mutate();
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={googleLoginMutation.isPending}
      className='bg-red-500 text-white px-4 py-2 rounded'
    >
      {googleLoginMutation.isPending ? 'Redirecting...' : 'Login with Google'}
    </button>
  );
}

// ====================
// COMPLETE USAGE EXAMPLE
// ====================

function CompleteUserManagement() {
  // Using multiple hooks together
  const { data: users, isLoading } = useUsers({ page: 1, limit: 10 });
  const currentUser = useCurrentUser();
  const isAdmin = useIsAdmin();
  const deactivateUser = useDeactivateUser();
  const activateUser = useActivateUser();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>User Management</h1>
      <p>
        Logged in as: {currentUser?.name} ({currentUser?.role})
      </p>

      {isAdmin ? (
        <div>
          <h2>All Users ({users?.total})</h2>
          {users?.users.map((user) => (
            <div key={user._id} className='border p-4 mb-2'>
              <div>
                {user.name} - {user.email}
              </div>
              <UserActivityIndicator userId={user._id} />
              <UserManagementButtons userId={user._id} />
            </div>
          ))}
        </div>
      ) : (
        <div>You need admin privileges to view this page</div>
      )}
    </div>
  );
}
