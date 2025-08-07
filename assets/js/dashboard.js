const Dashboard = {
    userData: {},

    loadUserData: async () => {
        try {
            console.log('Loading user data...');
            
            const userId = Auth.currentUser['https://hasura.io/jwt/claims']['x-hasura-user-id'];
            console.log('User ID from JWT:', userId);

            const userQuery = `
                query($userId: Int!) {
                    user(where: {id: {_eq: $userId}}) {
                        id
                        login
                        profile
                        attrs
                        createdAt
                        campus
                    }
                }
            `;
            console.log('Executing user query...');
            const userResult = await Auth.client.query(userQuery, { userId: parseInt(userId) });
            console.log('User result:', userResult);
            Dashboard.userData.user = userResult.user[0];

            const transactionQuery = `
                query($userId: Int!) {
                    transaction(where: {userId: {_eq: $userId}}) {
                        id
                        type
                        amount
                        createdAt
                        path
                        attrs
                        objectId
                        eventId
                        campus
                    }
                }
            `;
            console.log('Executing transaction query...');
            const transactionResult = await Auth.client.query(transactionQuery, { userId: parseInt(userId) });
            console.log('Transaction result:', transactionResult);
            Dashboard.userData.transactions = transactionResult.transaction;

            const progressQuery = `
                query($userId: Int!) {
                    progress(where: {userId: {_eq: $userId}}) {
                        id
                        grade
                        isDone
                        version
                        createdAt
                        path
                        campus
                        groupId
                        eventId
                        object {
                            name
                            type
                            attrs
                        }
                    }
                }
            `;
            console.log('Executing progress query with userId:', parseInt(userId));
            const progressResult = await Auth.client.query(progressQuery, { userId: parseInt(userId) });
            console.log('Progress result:', progressResult);
            Dashboard.userData.progress = progressResult.progress;

            const resultQuery = `
                query($userId: Int!) {
                    result(where: {userId: {_eq: $userId}}) {
                        id
                        grade
                        type
                        createdAt
                        path
                        object {
                            name
                            type
                        }
                    }
                }
            `;
            console.log('Executing result query...');
            const resultResult = await Auth.client.query(resultQuery, { userId: parseInt(userId) });
            console.log('Result result:', resultResult);
            Dashboard.userData.results = resultResult.result;

            const auditQuery = `
                query($userId: Int!) {
                    audit(where: {auditorId: {_eq: $userId}}) {
                        id
                        grade
                        createdAt
                        groupId
                    }
                }
            `;
            console.log('Executing audit query...');
            const auditResult = await Auth.client.query(auditQuery, { userId: parseInt(userId) });
            console.log('Audit result:', auditResult);
            Dashboard.userData.audits = auditResult.audit;

            const groupQuery = `
                query($userId: Int!) {
                    group_user(where: {userId: {_eq: $userId}}) {
                        id
                        createdAt
                        group {
                            id
                            status
                            path
                            object {
                                name
                                type
                            }
                        }
                    }
                }
            `;
            console.log('Executing group query...');
            const groupResult = await Auth.client.query(groupQuery, { userId: parseInt(userId) });
            console.log('Group result:', groupResult);
            Dashboard.userData.groups = groupResult.group_user;

            const eventQuery = `
                query($userId: Int!) {
                    event_user(where: {userId: {_eq: $userId}}) {
                        id
                        createdAt
                        event {
                            id
                            createdAt
                            endAt
                            path
                            campus
                            object {
                                name
                                type
                            }
                        }
                    }
                }
            `;
            console.log('Executing event query...');
            const eventResult = await Auth.client.query(eventQuery, { userId: parseInt(userId) });
            console.log('Event result:', eventResult);
            Dashboard.userData.events = eventResult.event_user;

            Dashboard.updateProfile();
            Charts.generateCharts();
            
            console.log('User data loaded successfully');

        } catch (error) {
            console.error('Error loading user data:', error);
            UI.showErrorDialog(`Failed to load profile data: ${error.message}`);
        }
    },

    updateProfile: () => {
        const user = Dashboard.userData.user;
        const transactions = Dashboard.userData.transactions || [];
        const progress = Dashboard.userData.progress || [];
        const results = Dashboard.userData.results || [];

       
        document.getElementById('userNameHeader').textContent = user.login;
       
        document.getElementById('userName').textContent = user.login;
        document.getElementById('userLogin').textContent = `@${user.login} (ID: ${user.id})`;
        document.getElementById('userAvatar').textContent = user.login.charAt(0).toUpperCase();
        document.getElementById('userJoinDate').textContent = `Joined ${new Date(user.createdAt).toLocaleDateString()}`;

        const totalXP = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const projectMap = new Map();
        progress.filter(p => p.object?.type === 'project').forEach(p => {
            const projectName = p.object.name;
            if (!projectMap.has(projectName) || new Date(p.createdAt) > new Date(projectMap.get(projectName).createdAt)) {
                projectMap.set(projectName, p);
            }
        });
        
        const uniqueProjects = Array.from(projectMap.values());
        const passedProjects = uniqueProjects.filter(p => p.grade >= 1).length;
        const failedProjects = uniqueProjects.filter(p => p.grade < 1 && p.grade !== null).length;
        
        const passedResults = results.filter(r => r.grade >= 1).length;
        const totalResults = results.length;
        const auditRatio = totalResults > 0 ? (passedResults / totalResults).toFixed(2) : '0.00';

        const goXP = transactions.filter(t => t.path.includes('bh-piscine') && !t.path.includes('piscine-js')).reduce((sum, t) => sum + (t.amount || 0), 0);
        const jsXP = transactions.filter(t => t.path.includes('piscine-js')).reduce((sum, t) => sum + (t.amount || 0), 0);
        const projectXP = transactions.filter(t => t.path.includes('bh-module')).reduce((sum, t) => sum + (t.amount || 0), 0);

        document.getElementById('totalXP').textContent = totalXP.toLocaleString();
        document.getElementById('passedProjects').textContent = passedProjects;
        document.getElementById('failedProjects').textContent = failedProjects;
        document.getElementById('auditRatio').textContent = auditRatio;

        document.getElementById('xpSummaryTotal').textContent = totalXP.toLocaleString();
        document.getElementById('xpSummaryGo').textContent = goXP.toLocaleString();
        document.getElementById('xpSummaryJS').textContent = jsXP.toLocaleString();
        document.getElementById('xpSummaryProject').textContent = projectXP.toLocaleString();

        Dashboard.populateProfileDetails();
        Dashboard.populateTransactionsList();
        Dashboard.populateProgressList();

        console.log('=== PROFILE UPDATE ===');
        console.log('User:', user);
        console.log(`Total Transactions: ${transactions.length}`);
        console.log(`Total XP: ${totalXP}`);
        console.log(`Progress entries: ${progress.length}`);
        console.log(`Projects - Passed: ${passedProjects}, Failed: ${failedProjects}`);
        console.log(`Results entries: ${results.length}`);
        console.log(`Audit ratio: ${auditRatio} (${passedResults}/${totalResults})`);
    },

    populateProfileDetails: () => {
        const user = Dashboard.userData.user;
        const transactions = Dashboard.userData.transactions || [];
        const progress = Dashboard.userData.progress || [];
        const events = Dashboard.userData.events || [];
        const groups = Dashboard.userData.groups || [];
        const profileDetails = document.getElementById('profileDetails');
        
        let profileData = {};
        let attrsData = {};
        
        try {
            if (user.profile && typeof user.profile === 'string') {
                profileData = JSON.parse(user.profile);
            } else if (user.profile && typeof user.profile === 'object') {
                profileData = user.profile;
            }
        } catch (e) {
            console.log('Could not parse profile data:', e);
        }
        
        try {
            if (user.attrs && typeof user.attrs === 'string') {
                attrsData = JSON.parse(user.attrs);
            } else if (user.attrs && typeof user.attrs === 'object') {
                attrsData = user.attrs;
            }
        } catch (e) {
            console.log('Could not parse attrs data:', e);
        }

        const completedProgress = progress.filter(p => p.isDone).length;
        const totalTransactionTypes = [...new Set(transactions.map(t => t.type))].length;
        const totalEvents = events.length;
        const totalGroups = groups.length;
        
        const latestTransaction = transactions.length > 0 ? 
            transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;
        const latestProgress = progress.length > 0 ? 
            progress.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;

        const profileCards = [
            {
                title: 'Contact Information',
                icon: '📧',
                items: [
                    { label: 'Email', value: profileData.email || attrsData.email || 'Not provided' },
                    { label: 'GitHub', value: user.login || 'Not linked' },
                    { label: 'Campus', value: user.campus || 'Not specified' }
                ]
            },
            {
                title: 'Activity Summary',
                icon: '📊',
                items: [
                    { label: 'Total Transactions', value: transactions.length.toLocaleString() },
                    { label: 'Completed Tasks', value: completedProgress.toLocaleString() },
                    { label: 'Events Participated', value: totalEvents.toLocaleString() },
                    { label: 'Groups Joined', value: totalGroups.toLocaleString() }
                ]
            },
            {
                title: 'Latest Activity',
                icon: '🕒',
                items: [
                    { 
                        label: 'Last Transaction', 
                        value: latestTransaction ? 
                            `${new Date(latestTransaction.createdAt).toLocaleDateString()} - ${latestTransaction.path.split('/').pop()}` :
                            'No transactions'
                    },
                    { 
                        label: 'Last Progress', 
                        value: latestProgress ? 
                            `${new Date(latestProgress.createdAt).toLocaleDateString()} - ${latestProgress.object?.name || latestProgress.path.split('/').pop()}` :
                            'No progress'
                    },
                    { 
                        label: 'Account Age', 
                        value: Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + ' days'
                    }
                ]
            }
        ];

        if (profileData || attrsData) {
            const additionalInfo = {
                title: 'Additional Information',
                icon: '👤',
                items: []
            };
            
            if (profileData.firstName || profileData.lastName) {
                additionalInfo.items.push({
                    label: 'Full Name',
                    value: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()
                });
            }
            
            if (profileData.phone || attrsData.phone) {
                additionalInfo.items.push({
                    label: 'Phone',
                    value: profileData.phone || attrsData.phone
                });
            }
            
            if (profileData.address || attrsData.address) {
                additionalInfo.items.push({
                    label: 'Address',
                    value: profileData.address || attrsData.address
                });
            }
            
            if (profileData.dateOfBirth || attrsData.dateOfBirth) {
                additionalInfo.items.push({
                    label: 'Date of Birth',
                    value: profileData.dateOfBirth || attrsData.dateOfBirth
                });
            }
            
            if (additionalInfo.items.length > 0) {
                profileCards.push(additionalInfo);
            }
        }

        profileDetails.innerHTML = profileCards.map(card => `
            <div class="bg-white dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div class="flex items-center space-x-2 mb-3">
                    <span class="text-2xl">${card.icon}</span>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${card.title}</h4>
                </div>
                <div class="space-y-2">
                    ${card.items.map(item => `
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600 dark:text-gray-400">${item.label}</span>
                            <span class="text-sm font-medium text-gray-900 dark:text-white text-right">${item.value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    populateTransactionsList: () => {
        const transactions = Dashboard.userData.transactions || [];
        const transactionsList = document.getElementById('transactionsList');
        
        if (transactions.length === 0) {
            transactionsList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No transactions found</p>';
            return;
        }

        const recentTransactions = [...transactions]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        transactionsList.innerHTML = recentTransactions.map(transaction => {
            const date = new Date(transaction.createdAt).toLocaleDateString();
            const time = new Date(transaction.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const pathParts = transaction.path.split('/');
            const exercise = pathParts[pathParts.length - 1];
            
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span class="font-medium text-gray-900 dark:text-white">${exercise}</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400">ID: ${transaction.id}</span>
                        </div>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">${transaction.path}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">${date} at ${time}</p>
                    </div>
                    <div class="text-right">
                        <span class="font-bold text-green-600 dark:text-green-400">+${transaction.amount.toLocaleString()}</span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">XP</p>
                    </div>
                </div>
            `;
        }).join('');
    },

    currentFilter: 'all',

    filterProgress: (type) => {
        Dashboard.currentFilter = type;
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-primary-500', 'text-white');
            btn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
        });
        
        const activeBtn = document.getElementById(`filter-${type}`);
        activeBtn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
        activeBtn.classList.add('active', 'bg-primary-500', 'text-white');
       
        Dashboard.populateProgressList();
    },

    populateProgressList: () => {
        const progress = Dashboard.userData.progress || [];
        const progressList = document.getElementById('progressList');
        
        if (progress.length === 0) {
            progressList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No progress data found</p>';
            return;
        }

        let filteredProgress = progress;
        if (Dashboard.currentFilter !== 'all') {
            filteredProgress = progress.filter(item => item.object?.type === Dashboard.currentFilter);
        }

        if (filteredProgress.length === 0) {
            progressList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No data found for this filter</p>';
            return;
        }

        const recentProgress = [...filteredProgress]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 20);

        progressList.innerHTML = recentProgress.map(item => {
            const date = new Date(item.createdAt).toLocaleDateString();
            const time = new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const pathParts = item.path.split('/');
            const exercise = pathParts[pathParts.length - 1];
            const isPassed = item.grade >= 1;
            const isProject = item.object?.type === 'project';
           
            let gradeDisplay = item.grade;
            if (item.grade === null || item.grade === undefined) {
                gradeDisplay = 'N/A';
            } else if (typeof item.grade === 'number') {
                gradeDisplay = item.grade.toFixed(2);
            }
            
            let typeClass = 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
            if (isProject) typeClass = 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
            else if (item.object?.type === 'exam') typeClass = 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
            else if (item.object?.type === 'interview') typeClass = 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
            
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 ${isPassed ? 'bg-green-500' : 'bg-red-500'} rounded-full"></div>
                            <span class="font-medium text-gray-900 dark:text-white">${item.object?.name || exercise}</span>
                            <span class="text-xs px-2 py-1 rounded-full ${typeClass}">${item.object?.type || 'unknown'}</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400">ID: ${item.id}</span>
                        </div>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">${item.path}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">${date} at ${time}</p>
                    </div>
                    <div class="text-right">
                        <span class="font-bold ${isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">${gradeDisplay}</span>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Grade</p>
                    </div>
                </div>
            `;
        }).join('');
    }
};

window.Dashboard = Dashboard;