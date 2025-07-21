// Frontend Implementation for Online/Offline Status Tracking

// 1. User Status Service
class UserStatusService {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.heartbeatInterval = null;
    this.heartbeatFrequency = 3 * 60 * 1000; // 3 minutes
  }

  // Set user online and start heartbeat
  async goOnline() {
    try {
      await this.apiClient.post('/api/auth/online');
      this.startHeartbeat();
      return { success: true };
    } catch (error) {
      console.error('Failed to set user online:', error);
      return { success: false, error };
    }
  }

  // Set user offline and stop heartbeat
  async goOffline() {
    try {
      this.stopHeartbeat();
      await this.apiClient.post('/api/auth/offline');
      return { success: true };
    } catch (error) {
      console.error('Failed to set user offline:', error);
      return { success: false, error };
    }
  }

  // Start periodic heartbeat
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.apiClient.post('/api/auth/heartbeat');
        console.log('Heartbeat sent successfully');
      } catch (error) {
        console.error('Heartbeat failed:', error);
        // If heartbeat fails, user might be logged out
        this.handleHeartbeatFailure(error);
      }
    }, this.heartbeatFrequency);
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Handle heartbeat failure (token expired, network issues, etc.)
  handleHeartbeatFailure(error) {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      this.stopHeartbeat();
      // Trigger logout/redirect logic
      window.location.href = '/login';
    }
  }

  // Get online users (admin feature)
  async getOnlineUsers(minutes = 5) {
    try {
      const response = await this.apiClient.get(
        `/api/auth/online-users?minutes=${minutes}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get online users:', error);
      return [];
    }
  }
}

// 2. React Hook for Online Status
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const statusService = useRef(new UserStatusService(apiClient));

  useEffect(() => {
    const service = statusService.current;

    // Auto go online when component mounts
    const initializeStatus = async () => {
      const result = await service.goOnline();
      if (result.success) {
        setIsOnline(true);
        setLastSeen(new Date());
      }
    };

    initializeStatus();

    // Handle page visibility changes
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await service.goOnline();
        setIsOnline(true);
      } else {
        await service.goOffline();
        setIsOnline(false);
      }
      setLastSeen(new Date());
    };

    // Handle before page unload
    const handleBeforeUnload = () => {
      // Send offline status (synchronous)
      navigator.sendBeacon('/api/auth/offline', JSON.stringify({}));
      service.stopHeartbeat();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      service.goOffline();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const goOnline = async () => {
    const result = await statusService.current.goOnline();
    if (result.success) {
      setIsOnline(true);
      setLastSeen(new Date());
    }
    return result;
  };

  const goOffline = async () => {
    const result = await statusService.current.goOffline();
    if (result.success) {
      setIsOnline(false);
      setLastSeen(new Date());
    }
    return result;
  };

  return {
    isOnline,
    lastSeen,
    goOnline,
    goOffline,
  };
}

// 3. React Component Example
function UserDashboard() {
  const { isOnline, lastSeen, goOnline, goOffline } = useOnlineStatus();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  // For admin users - get online users list
  useEffect(() => {
    if (user?.role === 'admin') {
      const fetchOnlineUsers = async () => {
        const service = new UserStatusService(apiClient);
        const users = await service.getOnlineUsers();
        setOnlineUsers(users);
      };

      fetchOnlineUsers();
      // Refresh online users every 30 seconds
      const interval = setInterval(fetchOnlineUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <div className='user-dashboard'>
      {/* User Status Display */}
      <div className='status-indicator'>
        <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
        <span>
          {isOnline ? 'Online' : 'Offline'}
          {lastSeen && ` - Last seen: ${lastSeen.toLocaleTimeString()}`}
        </span>
      </div>

      {/* Manual Controls */}
      <div className='status-controls'>
        <button onClick={goOnline} disabled={isOnline}>
          Go Online
        </button>
        <button onClick={goOffline} disabled={!isOnline}>
          Go Offline
        </button>
      </div>

      {/* Admin: Online Users List */}
      {user?.role === 'admin' && (
        <div className='online-users-section'>
          <h3>Online Users ({onlineUsers.length})</h3>
          <div className='users-list'>
            {onlineUsers.map((user) => (
              <div key={user._id} className='user-item'>
                <div className='status-dot online'></div>
                <span>{user.name}</span>
                <span className='last-seen'>
                  Last seen: {new Date(user.lastSeen).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 4. CSS for Status Indicators
const styles = `
.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.status-dot.online {
  background-color: #10b981; /* Green */
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

.status-dot.offline {
  background-color: #ef4444; /* Red */
}

.status-indicator {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  margin-bottom: 16px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.last-seen {
  margin-left: auto;
  font-size: 0.875rem;
  color: #6b7280;
}
`;

export { UserStatusService, useOnlineStatus, UserDashboard };
