const CONFIG = {
   
    API: {
        BASE_URL: 'https://learn.reboot01.com/api/graphql-engine/v1/graphql',
        AUTH_URL: 'https://learn.reboot01.com/api/auth/signin',
        ENDPOINTS: {
            AUTH: '/auth/signin',
            GRAPHQL: '/graphql',
            LOGOUT: '/auth/signout'
        }
    },

   
    AUTH: {
        TOKEN_KEY: 'authToken',
        USER_KEY: 'userData',
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
        REMEMBER_ME_DURATION: 7 * 24 * 60 * 60 * 1000 // 7 days
    },

    UI: {
        ANIMATION_DURATION: 300,
        CHART_COLORS: {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
        },
        DARK_MODE_KEY: 'darkMode'
    },

 
    ERRORS: {
        NETWORK_ERROR: 'Network error. Please check your connection.',
        AUTH_FAILED: 'Authentication failed. Please check your credentials.',
        SESSION_EXPIRED: 'Session expired. Please login again.',
        INVALID_CREDENTIALS: 'Invalid username or password.',
        SERVER_ERROR: 'Server error. Please try again later.',
        DATA_FETCH_ERROR: 'Failed to fetch data. Please refresh the page.',
        INVALID_JWT: 'Invalid or malformed authentication token.',
        JWT_EXPIRED: 'Authentication token has expired. Please login again.',
        JWT_DECODE_ERROR: 'Unable to decode authentication token.'
    },


    SUCCESS: {
        LOGIN_SUCCESS: 'Login successful!',
        LOGOUT_SUCCESS: 'Logout successful!',
        DATA_LOADED: 'Data loaded successfully!'
    }
};

window.CONFIG = CONFIG;