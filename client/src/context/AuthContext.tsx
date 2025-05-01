import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

// Define the User type
interface User {
  id: string;
  name: string;
  email: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
  
  // Add request interceptor for debugging
  axios.interceptors.request.use(
    config => {
      console.log(`📤 Making ${config.method?.toUpperCase()} request to ${config.url}`, config.data);
      return config;
    },
    error => {
      console.error('❌ Request error:', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for debugging
  axios.interceptors.response.use(
    response => {
      console.log(`📥 Response from ${response.config.url}:`, response.data);
      return response;
    },
    error => {
      if (error.response) {
        console.error(`❌ Response error (${error.response.status}):`, error.response.data);
      } else if (error.request) {
        console.error('❌ No response received:', error.request);
      } else {
        console.error('❌ Request setup error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  // Register a new user
  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('🔑 Registering user:', { name, email });
      
      const response = await axios.post('/api/users/register', {
        name,
        email,
        password
      });
      
      const { user, token } = response.data;
      
      // Save to state and local storage
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      console.log('✅ Registration successful');
    } catch (error: any) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      throw error;
    }
  };

  // Login an existing user
  const login = async (email: string, password: string) => {
    try {
      console.log('🔑 Logging in user:', { email });
      
      const response = await axios.post('/api/users/login', {
        email,
        password
      });
      
      const { user, token } = response.data;
      
      // Save to state and local storage
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      
      console.log('✅ Login successful');
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw error;
    }
  };

  // Logout the current user
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    console.log('👋 User logged out');
  };

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('🔄 Loading user data with token');
        const response = await axios.get('/api/users/me');
        
        setUser(response.data);
        console.log('✅ User data loaded successfully');
      } catch (error: any) {
        console.error('❌ Error loading user:', error.response?.data || error.message);
        logout(); // Clear invalid token
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Set authorization header on axios when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};