const Charts = {
   
    generateCharts: () => {
        Charts.generateXPChart();
        Charts.generateSuccessChart();
        Charts.generateProjectsChart();
        Charts.generateCategoryChart();
    },


    createArcPath: (centerX, centerY, radius, startAngle, endAngle) => {
        const startAngleRad = (startAngle - 90) * Math.PI / 180;
        const endAngleRad = (endAngle - 90) * Math.PI / 180;
        
        const x1 = centerX + radius * Math.cos(startAngleRad);
        const y1 = centerY + radius * Math.sin(startAngleRad);
        const x2 = centerX + radius * Math.cos(endAngleRad);
        const y2 = centerY + radius * Math.sin(endAngleRad);
        
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        
        return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    },

 
    generateXPChart: () => {
        const transactions = Dashboard.userData.transactions || [];
        const xpChart = document.getElementById('xpChart');
      
        xpChart.innerHTML = '';
        
        if (transactions.length === 0) {
            xpChart.innerHTML = '<text x="200" y="125" text-anchor="middle" class="fill-gray-500 dark:fill-gray-400">No XP data available</text>';
            return;
        }

        const monthlyData = new Map();
        transactions.forEach(t => {
            const date = new Date(t.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            
            if (!monthlyData.has(monthKey)) {
                monthlyData.set(monthKey, { month: monthName, xp: 0, date: new Date(date.getFullYear(), date.getMonth()) });
            }
            monthlyData.get(monthKey).xp += t.amount || 0;
        });

        const sortedData = Array.from(monthlyData.values())
            .sort((a, b) => a.date - b.date)
            .slice(-12);

        if (sortedData.length === 0) {
            xpChart.innerHTML = '<text x="200" y="125" text-anchor="middle" class="fill-gray-500 dark:fill-gray-400">No monthly data available</text>';
            return;
        }

        const width = 500;
        const height = 300;
        const margin = { top: 30, right: 30, bottom: 80, left: 80 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const maxXP = Math.max(...sortedData.map(d => d.xp));
        const barWidth = chartWidth / sortedData.length;

        const gridLines = [];
        for (let i = 0; i <= 4; i++) {
            const y = margin.top + (chartHeight / 4) * i;
            const value = Math.round(maxXP - (maxXP / 4) * i);
            gridLines.push(`
                <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" 
                      stroke="currentColor" stroke-opacity="0.1" class="text-gray-400" />
                <text x="${margin.left - 10}" y="${y + 5}" text-anchor="end" 
                      class="text-xs fill-gray-500 dark:fill-gray-400">${value}</text>
            `);
        }

        const bars = sortedData.map((d, i) => {
            const x = margin.left + (i * barWidth) + (barWidth * 0.1);
            const barHeight = maxXP > 0 ? (d.xp / maxXP) * chartHeight : 0;
            const y = margin.top + chartHeight - barHeight;
            const actualBarWidth = barWidth * 0.8;

            return `
                <rect x="${x}" y="${y}" width="${actualBarWidth}" height="${barHeight}" 
                      fill="url(#barGradient)" class="chart-bar" style="animation-delay: ${i * 0.1}s" />
                <text x="${x + actualBarWidth/2}" y="${height - 40}" text-anchor="middle" 
                      class="text-xs fill-gray-600 dark:fill-gray-400" transform="rotate(-45 ${x + actualBarWidth/2} ${height - 40})">${d.month}</text>
                <text x="${x + actualBarWidth/2}" y="${y - 5}" text-anchor="middle" 
                      class="text-xs fill-gray-700 dark:fill-gray-300">${d.xp}</text>
            `;
        }).join('');

        xpChart.innerHTML = `
            <defs>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
                </linearGradient>
            </defs>
            ${gridLines.join('')}
            ${bars}
            <text x="${width/2}" y="${height - 5}" text-anchor="middle" class="text-sm fill-gray-600 dark:fill-gray-400">Month</text>
            <text x="15" y="20" text-anchor="middle" class="text-sm fill-gray-600 dark:fill-gray-400" transform="rotate(-90 15 20)">XP</text>
        `;
    },

    generateProjectsChart: () => {
        const transactions = Dashboard.userData.transactions || [];
        const projectsChart = document.getElementById('projectsChart');
       
        projectsChart.innerHTML = '';
        
        const projectTransactions = transactions
            .filter(t => t.path.includes('bh-module') || (t.path.includes('project') && !t.path.includes('piscine')))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 12);

        if (projectTransactions.length === 0) {
            projectsChart.innerHTML = '<text x="200" y="125" text-anchor="middle" class="fill-gray-500 dark:fill-gray-400">No project XP data available</text>';
            return;
        }

        projectTransactions.reverse();

        const width = 500;
        const height = 300;
        const margin = { top: 30, right: 30, bottom: 100, left: 80 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const maxXP = Math.max(...projectTransactions.map(t => t.amount || 0));
        const barWidth = chartWidth / projectTransactions.length;

        const gridLines = [];
        for (let i = 0; i <= 4; i++) {
            const y = margin.top + (chartHeight / 4) * i;
            const value = Math.round(maxXP - (maxXP / 4) * i);
            gridLines.push(`
                <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" 
                      stroke="currentColor" stroke-opacity="0.1" class="text-gray-400" />
                <text x="${margin.left - 10}" y="${y + 5}" text-anchor="end" 
                      class="text-xs fill-gray-500 dark:fill-gray-400">${value}</text>
            `);
        }

        const bars = projectTransactions.map((t, i) => {
            const x = margin.left + (i * barWidth) + (barWidth * 0.1);
            const barHeight = maxXP > 0 ? ((t.amount || 0) / maxXP) * chartHeight : 0;
            const y = margin.top + chartHeight - barHeight;
            const actualBarWidth = barWidth * 0.8;

            const pathParts = t.path.split('/');
            const projectName = pathParts[pathParts.length - 1];
            const shortName = projectName.length > 8 ? projectName.substring(0, 8) + '...' : projectName;

            return `
                <rect x="${x}" y="${y}" width="${actualBarWidth}" height="${barHeight}" 
                      fill="url(#projectGradient)" class="chart-bar" style="animation-delay: ${i * 0.1}s" />
                <text x="${x + actualBarWidth/2}" y="${height - 45}" text-anchor="middle" 
                      class="text-xs fill-gray-600 dark:fill-gray-400" transform="rotate(-45 ${x + actualBarWidth/2} ${height - 45})">${shortName}</text>
                <text x="${x + actualBarWidth/2}" y="${y - 5}" text-anchor="middle" 
                      class="text-xs fill-gray-700 dark:fill-gray-300">${t.amount || 0}</text>
            `;
        }).join('');

        projectsChart.innerHTML = `
            <defs>
                <linearGradient id="projectGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
                </linearGradient>
            </defs>
            ${gridLines.join('')}
            ${bars}
            <text x="${width/2}" y="${height - 5}" text-anchor="middle" class="text-sm fill-gray-600 dark:fill-gray-400">Latest Projects</text>
            <text x="15" y="20" text-anchor="middle" class="text-sm fill-gray-600 dark:fill-gray-400" transform="rotate(-90 15 20)">XP</text>
        `;
    },

    generateSuccessChart: () => {
        const progress = Dashboard.userData.progress || [];
        const successChart = document.getElementById('successChart');
        
        successChart.innerHTML = '';
      
        const projectMap = new Map();
        progress.filter(p => p.object?.type === 'project').forEach(p => {
            const projectName = p.object.name;
            if (!projectMap.has(projectName) || new Date(p.createdAt) > new Date(projectMap.get(projectName).createdAt)) {
                projectMap.set(projectName, p);
            }
        });
        
        const uniqueProjects = Array.from(projectMap.values());
        if (uniqueProjects.length === 0) {
            successChart.innerHTML = '<text x="125" y="125" text-anchor="middle" class="fill-gray-500 dark:fill-gray-400">No project data</text>';
            return;
        }

        const passed = uniqueProjects.filter(p => p.grade >= 1).length;
        const failed = uniqueProjects.filter(p => p.grade < 1 && p.grade !== null).length;
        const total = passed + failed;

        if (total === 0) {
            successChart.innerHTML = '<text x="125" y="125" text-anchor="middle" class="fill-gray-500 dark:fill-gray-400">No project data</text>';
            return;
        }

        const passedAngle = (passed / total) * 360;
        const failedAngle = (failed / total) * 360;

        const radius = 90;
        const centerX = 125;
        const centerY = 125;

        const passedPath = Charts.createArcPath(centerX, centerY, radius, 0, passedAngle);
        const failedPath = Charts.createArcPath(centerX, centerY, radius, passedAngle, passedAngle + failedAngle);

        successChart.innerHTML = `
            <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#8567d4ff" stroke-width="4" />
            <path d="${passedPath}" fill="none" stroke="#10b981" stroke-width="12" stroke-linecap="round" class="chart-line" />
            <path d="${failedPath}" fill="none" stroke="#ef4444" stroke-width="12" stroke-linecap="round" class="chart-line" style="animation-delay: 0.5s" />
            <text x="${centerX}" y="${centerY - 10}" text-anchor="middle" class="text-3xl font-bold fill-gray-900 dark:fill-white">${Math.round((passed/total)*100)}%</text>
            <text x="${centerX}" y="${centerY + 15}" text-anchor="middle" class="text-sm fill-gray-600 dark:fill-gray-400">Success Rate</text>
            
            <!-- Legend -->
            <g transform="translate(30, 30)">
                <circle cx="0" cy="0" r="5" fill="#10b981" />
                <text x="12" y="5" class="text-sm fill-gray-600 dark:fill-gray-400">Passed (${passed})</text>
                <circle cx="0" cy="25" r="5" fill="#ef4444" />
                <text x="12" y="30" class="text-sm fill-gray-600 dark:fill-gray-400">Failed (${failed})</text>
            </g>
        `;
    },

 
    generateCategoryChart: () => {
        const transactions = Dashboard.userData.transactions || [];
        const categoryChart = document.getElementById('categoryChart');
       
        categoryChart.innerHTML = '';
        
        if (transactions.length === 0) {
            categoryChart.innerHTML = '<text x="125" y="125" text-anchor="middle" class="fill-gray-500 dark:fill-gray-400">No XP data available</text>';
            return;
        }

        const goXP = transactions.filter(t => t.path.includes('bh-piscine') && !t.path.includes('piscine-js')).reduce((sum, t) => sum + (t.amount || 0), 0);
        const jsXP = transactions.filter(t => t.path.includes('piscine-js')).reduce((sum, t) => sum + (t.amount || 0), 0);
        const projectXP = transactions.filter(t => t.path.includes('bh-module')).reduce((sum, t) => sum + (t.amount || 0), 0);
        const otherXP = transactions.filter(t => !t.path.includes('bh-piscine') && !t.path.includes('piscine-js') && !t.path.includes('bh-module')).reduce((sum, t) => sum + (t.amount || 0), 0);

        const categories = [
            { name: 'Piscine Go', value: goXP, color: '#0ea5e9' },
            { name: 'Piscine JS', value: jsXP, color: '#f59e0b' },
            { name: 'Projects', value: projectXP, color: '#10b981' },
            { name: 'Other', value: otherXP, color: '#8b5cf6' }
        ].filter(cat => cat.value > 0);

        if (categories.length === 0) {
            categoryChart.innerHTML = '<text x="125" y="125" text-anchor="middle" class="fill-gray-500 dark:fill-gray-400">No category data available</text>';
            return;
        }

        const total = categories.reduce((sum, cat) => sum + cat.value, 0);
        const radius = 90;
        const innerRadius = 45;
        const centerX = 125;
        const centerY = 125;

        let currentAngle = 0;
        const arcs = categories.map((cat, i) => {
            const percentage = (cat.value / total) * 100;
            const angle = (cat.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle += angle;

            const startAngleRad = (startAngle - 90) * Math.PI / 180;
            const endAngleRad = (endAngle - 90) * Math.PI / 180;
            
            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);
            const x3 = centerX + innerRadius * Math.cos(endAngleRad);
            const y3 = centerY + innerRadius * Math.sin(endAngleRad);
            const x4 = centerX + innerRadius * Math.cos(startAngleRad);
            const y4 = centerY + innerRadius * Math.sin(startAngleRad);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const donutPath = `
                M ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                L ${x3} ${y3}
                A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
                Z
            `;

            return `
                <path d="${donutPath}" fill="${cat.color}" class="chart-line" style="animation-delay: ${i * 0.2}s; opacity: 0.9" />
            `;
        }).join('');

       
        const legend = categories.map((cat, i) => {
            const percentage = ((cat.value / total) * 100).toFixed(1);
            return `
                <g transform="translate(20, ${30 + i * 25})">
                    <circle cx="0" cy="0" r="6" fill="${cat.color}" />
                    <text x="15" y="5" class="text-sm fill-gray-600 dark:fill-gray-400">${cat.name}</text>
                    <text x="15" y="18" class="text-xs fill-gray-500 dark:fill-gray-500">${percentage}% (${cat.value.toLocaleString()})</text>
                </g>
            `;
        }).join('');

        categoryChart.innerHTML = `
            ${arcs}
            <text x="${centerX}" y="${centerY - 5}" text-anchor="middle" class="text-lg font-bold fill-gray-900 dark:fill-white">XP</text>
            <text x="${centerX}" y="${centerY + 15}" text-anchor="middle" class="text-sm fill-gray-600 dark:fill-gray-400">Breakdown</text>
            ${legend}
        `;
    }
};


window.Charts = Charts;