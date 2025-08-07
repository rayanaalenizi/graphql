const Auth = {
   
    currentUser: null,
    authToken: null,
    client: null,

    initializeClient: () => {
        if (!Auth.client) {
            Auth.client = new GraphQLClient('https://learn.reboot01.com/api/graphql-engine/v1/graphql');
        }
        return Auth.client;
    },

    getCurrentUser: () => Auth.currentUser,

    getToken: () => Auth.authToken,

    login: async (identifier, password) => {
        UI.showLoadingState(true);
        
        try {
            const credentials = btoa(`${identifier}:${password}`);
            const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Invalid credentials. Please check your username/email and password.');
            }

            let token = await response.text();
          
            token = token.replace(/^["']|["']$/g, '');
         
            Auth.authToken = token;
          
            localStorage.setItem('authToken', token);
            localStorage.setItem('loginTime', Date.now().toString());
            
            console.log('Token received and saved:', token.substring(0, 50) + '...');
            
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                Auth.currentUser = payload;
                console.log('User payload:', payload);
            } catch (jwtError) {
                console.error('JWT decode error:', jwtError);
                throw new Error('Invalid token format received');
            }

            Auth.initializeClient();

            const loadingScreen = document.getElementById('loadingScreen');
            const loginPage = document.getElementById('loginPage');
            
            if (loadingScreen && loginPage) {
                loginPage.classList.add('hidden');
                loadingScreen.classList.remove('hidden');
            }

            setTimeout(() => {
                window.location.href = 'chart.html';
            }, 1000);
            
            Utils.showNotification('Welcome back! Login successful', 'success');

        } catch (error) {
            console.error('Login error:', error);
            UI.showErrorDialog(error.message);
        } finally {
            UI.showLoadingState(false);
        }
    },

    logout: () => {
        Auth.authToken = null;
        Auth.currentUser = null;
        
        if (typeof Dashboard !== 'undefined') {
            Dashboard.userData = {};
        }
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('loginTime');
        
       
        window.location.href = 'login.html';
    },

 
    checkExistingLogin: () => {
        const savedToken = localStorage.getItem('authToken');
        const loginTime = localStorage.getItem('loginTime');
        
        if (savedToken && loginTime) {
           
            const tokenAge = Date.now() - parseInt(loginTime);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (tokenAge < maxAge) {
                Auth.authToken = savedToken;
                
                try {
                    const payload = JSON.parse(atob(savedToken.split('.')[1]));
                    Auth.currentUser = payload;
                    
                    Auth.initializeClient();
                    
                    if (window.location.pathname.includes('chart.html') && typeof Dashboard !== 'undefined') {
                        Dashboard.loadUserData().then(() => {
                            console.log('Auto-login successful');
                        }).catch(error => {
                            console.error('Auto-login failed:', error);
                            Auth.logout(); 
                        });
                    } else if (window.location.pathname.includes('login.html')) {
                       
                        window.location.href = 'chart.html';
                    }
                    
                } catch (error) {
                    console.error('Invalid saved token:', error);
                    Auth.logout(); 
                }
            } else {
            
                Auth.logout();
            }
        } else if (window.location.pathname.includes('chart.html')) {
  
            window.location.href = 'login.html';
        }
    },

    confirmLogout: () => {
        Utils.showConfirmDialog('Are you sure you want to logout?', () => {
            Auth.logout();
            Utils.showNotification('You have been logged out successfully', 'info');
        });
    }
};

class GraphQLClient {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    async query(query, variables = {}) {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Auth.authToken ? `Bearer ${Auth.authToken}` : ''
            },
            body: JSON.stringify({ query, variables })
        });

        const result = await response.json();
        if (result.errors) {
            throw new Error(result.errors[0].message);
        }
        return result.data;
    }
}


window.Auth = Auth;
window.GraphQLClient = GraphQLClient;