function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - no auth context needed */}
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/about' element={<About />} />

        {/* Protected routes - wrapped with auth context */}
        <Route
          path='/dashboard/*'
          element={
            <AuthProvider>
              <Dashboard />
            </AuthProvider>
          }
        />
        <Route
          path='/profile'
          element={
            <AuthProvider>
              <Profile />
            </AuthProvider>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/about' element={<About />} />
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Then in your AuthProvider, you can check if auth is needed
function AuthProvider({ children }) {
  const location = useLocation();
  const publicRoutes = ['/login', '/signup', '/about'];

  if (publicRoutes.includes(location.pathname)) {
    return children; // Don't provide auth context for public routes
  }

  // Provide auth context for protected routes
  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
        } catch (error) {
          // Token is invalid
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const authValue = {
    // State
    user,
    loading,
    isAuthenticated,
    token,

    // Methods
    login,
    logout,

    // Optional: role-based access
    hasRole: (role) => user?.roles?.includes(role),
    hasPermission: (permission) => user?.permissions?.includes(permission),
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}

function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to='/login' />;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
