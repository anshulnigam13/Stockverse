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

        const step = chartW / (data.length - 1 || 1);
        const points = data.map((val, idx) => ({
            x: leftPadding + idx * step,
            y: topPadding + chartH - ((val - min) / range) * chartH,
            val: val,
            day: idx + 1
        }));

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

        const lastP = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(lastP.x, lastP.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = mainColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        let highest = points[0];
        let lowest = points[0];
        points.forEach(p => {
            if (p.val > highest.val) highest = p;
            if (p.val < lowest.val) lowest = p;
        });

        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#10b981';
        ctx.fillText(`▲ High: ${formatINR(highest.val)}`, highest.x, Math.max(16, highest.y - 10));
        ctx.fillStyle = '#f43f5e';
        ctx.fillText(`▼ Low: ${formatINR(lowest.val)}`, lowest.x, Math.min(height - 8, lowest.y + 16));
    },

    // Render Portfolio Allocation Donut Chart with Interactive Hover & Brand Colors
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

        const defaultColors = [
            '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
            '#ec4899', '#06b6d4', '#14b8a6', '#f97316'
        ];

        const slices = [];
        let totalVal = cashBalance;

        holdings.forEach((h, i) => {
            const val = h.current_value;
            totalVal += val;
            const stockDef = (typeof DEFAULT_STOCKS !== 'undefined') ? DEFAULT_STOCKS.find(s => s.symbol === h.symbol) : null;
            const sliceColor = (stockDef && stockDef.brandColor) ? stockDef.brandColor : defaultColors[i % defaultColors.length];
            const fullName = h.name || (stockDef ? stockDef.name : h.symbol);

            slices.push({
                label: h.symbol,
                fullName: fullName,
                value: val,
                color: sliceColor
            });
        });

        slices.unshift({
            label: 'CASH',
            fullName: 'Virtual Cash Reserve',
            value: cashBalance,
            color: '#475569'
        });

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 16;
        const innerRadius = radius * 0.65;

        // Calculate slice angles starting from top (-PI/2)
        let currentAngle = -0.5 * Math.PI;
        slices.forEach(slice => {
            const sliceAngle = totalVal > 0 ? (slice.value / totalVal) * (Math.PI * 2) : 0;
            slice.startAngle = currentAngle;
            slice.endAngle = currentAngle + sliceAngle;
            slice.percent = totalVal > 0 ? ((slice.value / totalVal) * 100).toFixed(1) : '0.0';
            currentAngle += sliceAngle;
        });

        function drawDonut(hoverIndex) {
            if (hoverIndex === undefined) hoverIndex = -1;
            ctx.clearRect(0, 0, width, height);

            if (totalVal <= 0) {
                ctx.fillStyle = '#64748b';
                ctx.textAlign = 'center';
                ctx.font = '12px -apple-system, sans-serif';
                ctx.fillText('No portfolio holdings yet', centerX, centerY);
                return;
            }

            slices.forEach((slice, idx) => {
                if (slice.endAngle - slice.startAngle <= 0) return;
                const isHovered = (idx === hoverIndex);
                const r = isHovered ? radius + 6 : radius;
                const ir = isHovered ? innerRadius - 2 : innerRadius;

                ctx.beginPath();
                ctx.arc(centerX, centerY, r, slice.startAngle, slice.endAngle);
                ctx.arc(centerX, centerY, ir, slice.endAngle, slice.startAngle, true);
                ctx.closePath();
                ctx.fillStyle = slice.color;
                ctx.fill();

                ctx.strokeStyle = isHovered ? '#ffffff' : '#0a0f1d';
                ctx.lineWidth = isHovered ? 3.5 : 2;
                ctx.stroke();
            });

            // Center cutout text: dynamically changes on hover to show hovered stock name & value!
            if (hoverIndex !== -1 && slices[hoverIndex]) {
                const s = slices[hoverIndex];
                ctx.fillStyle = s.color || '#38bdf8';
                ctx.font = 'bold 12px -apple-system, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(s.label, centerX, centerY - 12);

                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 13px -apple-system, sans-serif';
                ctx.fillText(formatINR(s.value), centerX, centerY + 4);

                ctx.fillStyle = '#10b981';
                ctx.font = 'bold 11px -apple-system, sans-serif';
                ctx.fillText(s.percent + '% of PF', centerX, centerY + 20);
            } else {
                ctx.fillStyle = '#94a3b8';
                ctx.font = '11px -apple-system, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Net Worth', centerX, centerY - 8);

                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 14px -apple-system, sans-serif';
                ctx.fillText(formatINR(totalVal), centerX, centerY + 14);
            }
        }

        drawDonut(-1);

        // Render Interactive Allocation Legend below the chart
        const legendContainer = document.getElementById('donutLegendContainer');
        if (legendContainer) {
            legendContainer.innerHTML = slices.map((s, idx) => `
                <div class="donut-legend-row" data-idx="${idx}" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.15s ease; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);">
                    <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${s.color}; flex-shrink: 0; box-shadow: 0 0 6px ${s.color}66;"></span>
                        <strong style="color: #f1f5f9;">${s.label}</strong>
                        <span style="color: var(--text-muted); font-size: 10px; overflow: hidden; text-overflow: ellipsis;">${s.fullName !== s.label ? s.fullName : ''}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
                        <span style="color: #38bdf8; font-variant-numeric: tabular-nums; font-weight: 600;">${formatINR(s.value)}</span>
                        <span style="color: #10b981; font-weight: 700; min-width: 38px; text-align: right;">${s.percent}%</span>
                    </div>
                </div>
            `).join('');

            legendContainer.querySelectorAll('.donut-legend-row').forEach(row => {
                const idx = parseInt(row.dataset.idx, 10);
                row.addEventListener('mouseenter', () => {
                    row.style.background = 'rgba(99, 102, 241, 0.18)';
                    row.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                    row.style.transform = 'translateX(4px)';
                    drawDonut(idx);
                });
                row.addEventListener('mouseleave', () => {
                    row.style.background = 'rgba(255,255,255,0.02)';
                    row.style.borderColor = 'rgba(255,255,255,0.06)';
                    row.style.transform = 'translateX(0)';
                    drawDonut(-1);
                });
            });
        }

        // Store references for the hover handler
        canvas._currentSlices = slices;
        canvas._drawDonut = drawDonut;

        // Attach hover listener only once per canvas lifetime
        if (!canvas._donutHoverBound) {
            canvas._donutHoverBound = true;

            const tooltip = document.getElementById('donutTooltip');

            function normalizeAngle(a) {
                a = a % (2 * Math.PI);
                if (a < 0) a += 2 * Math.PI;
                return a;
            }

            canvas.addEventListener('mousemove', function(e) {
                const cRect = canvas.getBoundingClientRect();
                const mx = e.clientX - cRect.left;
                const my = e.clientY - cRect.top;
                const cx2 = cRect.width / 2;
                const cy2 = cRect.height / 2;
                const ddx = mx - cx2;
                const ddy = my - cy2;
                const dist = Math.sqrt(ddx * ddx + ddy * ddy);

                const outerR = Math.min(cRect.width, cRect.height) / 2 - 16;
                const innerR = outerR * 0.65;

                if (dist >= innerR - 4 && dist <= outerR + 12) {
                    var rawAngle = Math.atan2(ddy, ddx);
                    var mouseNorm = normalizeAngle(rawAngle);

                    var liveSlices = canvas._currentSlices || [];
                    var hitIdx = -1;

                    for (var i = 0; i < liveSlices.length; i++) {
                        var sNorm = normalizeAngle(liveSlices[i].startAngle);
                        var eNorm = normalizeAngle(liveSlices[i].endAngle);

                        var sliceSpan = liveSlices[i].endAngle - liveSlices[i].startAngle;
                        if (sliceSpan >= 2 * Math.PI - 0.001) {
                            hitIdx = i;
                            break;
                        }

                        if (sNorm <= eNorm) {
                            if (mouseNorm >= sNorm && mouseNorm <= eNorm) {
                                hitIdx = i;
                                break;
                            }
                        } else {
                            if (mouseNorm >= sNorm || mouseNorm <= eNorm) {
                                hitIdx = i;
                                break;
                            }
                        }
                    }

                    if (hitIdx !== -1 && tooltip) {
                        var slice = liveSlices[hitIdx];
                        // High-contrast, crystal-clear fixed viewport tooltip right at cursor
                        tooltip.style.position = 'fixed';
                        var posX = e.clientX + 16;
                        var posY = e.clientY - 25;
                        if (posX + 220 > window.innerWidth) posX = e.clientX - 230;
                        if (posY + 95 > window.innerHeight) posY = window.innerHeight - 100;
                        if (posY < 10) posY = 10;

                        tooltip.style.left = posX + 'px';
                        tooltip.style.top = posY + 'px';
                        tooltip.style.display = 'block';
                        tooltip.style.zIndex = '99999';
                        tooltip.innerHTML =
                            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:5px;">' +
                                '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + slice.color + ';flex-shrink:0;box-shadow:0 0 8px ' + slice.color + ';"></span>' +
                                '<strong style="color:#ffffff;font-size:12px;letter-spacing:0.02em;">' + slice.fullName + ' (' + slice.label + ')</strong>' +
                            '</div>' +
                            '<div style="display:flex;justify-content:space-between;gap:16px;font-size:11px;color:#94a3b8;margin-bottom:3px;">' +
                                '<span>Current Value:</span>' +
                                '<strong style="color:#38bdf8;font-variant-numeric:tabular-nums;font-size:12px;">' + formatINR(slice.value) + '</strong>' +
                            '</div>' +
                            '<div style="display:flex;justify-content:space-between;gap:16px;font-size:11px;color:#94a3b8;">' +
                                '<span>Portfolio Share:</span>' +
                                '<strong style="color:#10b981;font-size:12px;">' + slice.percent + '%</strong>' +
                            '</div>';

                        if (canvas._drawDonut) canvas._drawDonut(hitIdx);
                        return;
                    }
                }

                // Not on any slice
                if (tooltip) tooltip.style.display = 'none';
                if (canvas._drawDonut) canvas._drawDonut(-1);
            });

            canvas.addEventListener('mouseleave', function() {
                if (tooltip) tooltip.style.display = 'none';
                if (canvas._drawDonut) canvas._drawDonut(-1);
            });
        }
    }
};
