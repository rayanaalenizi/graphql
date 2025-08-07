const UI = {   
    showErrorDialog: (message) => {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 5000);
        }
    },


    showLoadingState: (show) => {
        const btn = document.getElementById('loginBtn');
        const text = document.getElementById('loginBtnText');
        const spinner = document.getElementById('loginSpinner');
        
        if (btn && text && spinner) {
            if (show) {
                btn.disabled = true;
                btn.classList.add('opacity-75');
                text.textContent = 'Signing In...';
                spinner.classList.remove('hidden');
            } else {
                btn.disabled = false;
                btn.classList.remove('opacity-75');
                text.textContent = 'Sign In';
                spinner.classList.add('hidden');
            }
        }
    },

    
    toggleDarkMode: () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('darkMode', isDark);
    },


    initializeDarkMode: () => {
     
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });

        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            document.documentElement.classList.add('dark');
        }
    }
};

const App = {
 
  initialize: () => {
    console.log('GraphQL Profile Dashboard initialized');
    
  
    UI.initializeDarkMode();
    

    App.setupEventListeners();
    

    if (window.location.pathname.includes('login.html')) {
        Auth.checkExistingLogin();
    }
},

 
    setupEventListeners: () => {
       
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const identifier = document.getElementById('identifier').value.trim();
                const password = document.getElementById('password').value;
                
                if (!identifier || !password) {
                    UI.showErrorDialog('Please fill in all fields.');
                    return;
                }
                
                Auth.login(identifier, password);
            });
        }

    
        App.setupPasswordToggle();

        window.addEventListener('resize', Utils.debounce(() => {
            if (!document.getElementById('profilePage').classList.contains('hidden')) {
                Charts.generateCharts();
            }
        }, 250));


        document.addEventListener('keydown', App.handleKeyboardShortcuts);
    },

  
    setupPasswordToggle: () => {
        const toggleButton = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eyeIcon');
        const eyeSlashIcon = document.getElementById('eyeSlashIcon');

        if (toggleButton && passwordInput && eyeIcon && eyeSlashIcon) {
            toggleButton.addEventListener('click', () => {
                const isPassword = passwordInput.type === 'password';
                
           
                passwordInput.type = isPassword ? 'text' : 'password';
                
                
                if (isPassword) {
                    eyeIcon.classList.add('hidden');
                    eyeSlashIcon.classList.remove('hidden');
                    toggleButton.setAttribute('aria-label', 'Hide password');
                } else {
                    eyeIcon.classList.remove('hidden');
                    eyeSlashIcon.classList.add('hidden');
                    toggleButton.setAttribute('aria-label', 'Show password');
                }

              
                toggleButton.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    toggleButton.style.transform = 'scale(1)';
                }, 100);

                passwordInput.focus();
            });

            toggleButton.addEventListener('mouseenter', () => {
                toggleButton.style.transform = 'scale(1.1)';
            });

            toggleButton.addEventListener('mouseleave', () => {
                toggleButton.style.transform = 'scale(1)';
            });
        }
    },

 
    handleKeyboardShortcuts: (event) => {
     
        if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
            event.preventDefault();
            const loginField = document.getElementById('identifier');
            if (loginField && !loginField.disabled) {
                loginField.focus();
            }
        }

      
        if (event.key === 'Escape') {
            const errorDiv = document.getElementById('errorMessage');
            if (errorDiv && !errorDiv.classList.contains('hidden')) {
                errorDiv.classList.add('hidden');
            }
        }
    }
};


function toggleDarkMode() {
    UI.toggleDarkMode();
}

function confirmLogout() {
    Auth.confirmLogout();
}

function filterProgress(type) {
    Dashboard.filterProgress(type);
}

document.addEventListener('DOMContentLoaded', App.initialize);


window.App = App;
window.UI = UI;