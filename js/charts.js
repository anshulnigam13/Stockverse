/**
 * Stockverse - Interactive Financial Charts & Data Visualizations
 * Zero-dependency SVG & Canvas rendering for:
 * - Stock Price History Area/Line Chart with gradients and tooltips
 * - Portfolio Allocation Donut Chart
 * - Mini Sparklines for Stock Watchlists
 */

const Charts = {
    // Generate mini sparkline SVG for table rows
    renderSparklineSVG(history, isPositive = true, width = 90, height = 28) {
        if (!history || history.length < 2) return '';
        const min = Math.min(...history);
        const max = Math.max(...history);
        const range = max - min || 1;
        const padding = 2;
        const effectiveHeight = height - padding * 2;
        const step = (width - padding * 2) / (history.length - 1);

        const points = history.map((val, idx) => {
            const x = padding + idx * step;
            const y = height - padding - ((val - min) / range) * effectiveHeight;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');

        const color = isPositive ? '#00f59b' : '#ff3b69';
        const fillPoints = `${padding},${height} ${points} ${width - padding},${height}`;

        return `
            <svg class="sparkline" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <defs>
                    <linearGradient id="grad-${isPositive ? 'up' : 'down'}" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
                        <stop offset="100%" stop-color="${color}" stop-opacity="0.0"/>
                    </linearGradient>
                </defs>
                <polygon points="${fillPoints}" fill="url(#grad-${isPositive ? 'up' : 'down'})" />
                <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    },

    // Render Detailed Stock Price Interactive Canvas Chart
    renderPriceChart(canvasId, stock, timeRange = '30D') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        // Scale for Retina/HiDPI
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        ctx.clearRect(0, 0, width, height);

        let data = stock.history ? [...stock.history] : [stock.price];
        if (timeRange === '7D') data = data.slice(-7);
        if (timeRange === '14D') data = data.slice(-14);

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const topPadding = 35;
        const bottomPadding = 35;
        const leftPadding = 55;
        const rightPadding = 25;
        const chartW = width - leftPadding - rightPadding;
        const chartH = height - topPadding - bottomPadding;

        const isUp = (data[data.length - 1] >= data[0]);
        const mainColor = isUp ? '#00f59b' : '#ff3b69';
        const gradColorTop = isUp ? 'rgba(0, 245, 155, 0.35)' : 'rgba(255, 59, 105, 0.35)';
        const gradColorBottom = isUp ? 'rgba(0, 245, 155, 0.0)' : 'rgba(255, 59, 105, 0.0)';

        // Draw horizontal grid lines & Price labels
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'right';

        const gridSteps = 4;
        for (let i = 0; i <= gridSteps; i++) {
            const y = topPadding + (chartH / gridSteps) * i;
            const priceVal = max - (range / gridSteps) * i;

            ctx.beginPath();
            ctx.moveTo(leftPadding, y);
            ctx.lineTo(width - rightPadding, y);
            ctx.stroke();

            ctx.fillText(formatINR(priceVal), leftPadding - 8, y + 4);
        }

        // Compute coordinate points
        const step = chartW / (data.length - 1 || 1);
        const points = data.map((val, idx) => {
            return {
                x: leftPadding + idx * step,
                y: topPadding + chartH - ((val - min) / range) * chartH,
                val: val,
                day: idx + 1
            };
        });

        // Fill area gradient
        const gradient = ctx.createLinearGradient(0, topPadding, 0, topPadding + chartH);
        gradient.addColorStop(0, gradColorTop);
        gradient.addColorStop(1, gradColorBottom);

        ctx.beginPath();
        ctx.moveTo(points[0].x, topPadding + chartH);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(points[points.length - 1].x, topPadding + chartH);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw smooth main line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw current pulse point
        const lastP = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(lastP.x, lastP.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = mainColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // High / Low annotations
        let highest = points[0];
        let lowest = points[0];
        points.forEach(p => {
            if (p.val > highest.val) highest = p;
            if (p.val < lowest.val) lowest = p;
        });

        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'center';

        // High badge
        ctx.fillStyle = '#10b981';
        ctx.fillText(`▲ High: ${formatINR(highest.val)}`, highest.x, Math.max(16, highest.y - 10));

        // Low badge
        ctx.fillStyle = '#f43f5e';
        ctx.fillText(`▼ Low: ${formatINR(lowest.val)}`, lowest.x, Math.min(height - 8, lowest.y + 16));
    },

    // Render Portfolio Allocation Donut Chart
    renderPortfolioDonut(canvasId, holdings, cashBalance) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        ctx.clearRect(0, 0, width, height);

        const colors = [
            '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
            '#ec4899', '#06b6d4', '#14b8a6', '#f97316'
        ];

        // Slices: Cash + each holding
        const slices = [];
        let totalVal = cashBalance;

        holdings.forEach((h, i) => {
            const val = h.current_value;
            totalVal += val;
            slices.push({
                label: h.symbol,
                value: val,
                color: colors[i % colors.length]
            });
        });

        // Add cash slice
        slices.unshift({
            label: 'Cash Reserve',
            value: cashBalance,
            color: '#64748b'
        });

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 15;
        const innerRadius = radius * 0.65;

        if (totalVal <= 0) {
            ctx.fillStyle = '#64748b';
            ctx.textAlign = 'center';
            ctx.fillText('No portfolio data', centerX, centerY);
            return;
        }

        let currentAngle = -0.5 * Math.PI;

        slices.forEach(slice => {
            const sliceAngle = (slice.value / totalVal) * (Math.PI * 2);
            if (sliceAngle <= 0) return;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
            ctx.closePath();
            ctx.fillStyle = slice.color;
            ctx.fill();

            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 2;
            ctx.stroke();

            currentAngle += sliceAngle;
        });

        // Center cutout text
        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Net Worth', centerX, centerY - 8);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 14px -apple-system, sans-serif';
        ctx.fillText(formatINR(totalVal), centerX, centerY + 14);
    }
};
