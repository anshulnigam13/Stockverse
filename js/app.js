/**
 * Stockverse - Main Application Controller
 * Handles UI interactions, view switching, trading modals,
 * notifications, and synchronization between state and DOM.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Core Engine & Bridge
    const engine = new TradingEngine();
    const cgiBridge = new CGIBridge(engine);

    // Current State
    let currentView = 'dashboard';
    let selectedStock = engine.stocks[0] || null;
    let currentTradeType = 'buy'; // 'buy' | 'sell'
    let selectedChartRange = '30D';
    let txnFilter = 'ALL';

    // DOM Elements
    const elements = {
        tickerTape: document.getElementById('tickerTape'),
        navTabs: document.querySelectorAll('.nav-tab-btn'),
        viewSections: document.querySelectorAll('.view-section'),
        
        // Header stats
        headerCash: document.getElementById('headerCash'),
        marketStatusText: document.getElementById('marketStatusText'),
        tradingDayBadge: document.getElementById('tradingDayBadge'),
        
        // Dashboard metrics
        metricCash: document.getElementById('metricCash'),
        metricPortfolioVal: document.getElementById('metricPortfolioVal'),
        metricNetWorth: document.getElementById('metricNetWorth'),
        metricPnL: document.getElementById('metricPnL'),
        metricPnLBadge: document.getElementById('metricPnLBadge'),
        metricReturnBadge: document.getElementById('metricReturnBadge'),
        
        // Tables
        dashboardRecentTxns: document.getElementById('dashboardRecentTxns'),
        topMoversContainer: document.getElementById('topMoversContainer'),
        stocksTableBody: document.getElementById('stocksTableBody'),
        portfolioTableBody: document.getElementById('portfolioTableBody'),
        portfolioEmptyState: document.getElementById('portfolioEmptyState'),
        portfolioTableCard: document.getElementById('portfolioTableCard'),
        txnsTableBody: document.getElementById('txnsTableBody'),
        
        // Search & Filters
        stockSearchInput: document.getElementById('stockSearchInput'),
        sectorFilterSelect: document.getElementById('sectorFilterSelect'),
        
        // Modals
        tradeModal: document.getElementById('tradeModal'),
        tradeModalTitle: document.getElementById('tradeModalTitle'),
        tradeStockSymbol: document.getElementById('tradeStockSymbol'),
        tradeStockName: document.getElementById('tradeStockName'),
        tradeStockPrice: document.getElementById('tradeStockPrice'),
        tradeStockChange: document.getElementById('tradeStockChange'),
        tradeBuyTab: document.getElementById('tradeBuyTab'),
        tradeSellTab: document.getElementById('tradeSellTab'),
        tradeQuantityInput: document.getElementById('tradeQuantityInput'),
        tradeAvailCashRow: document.getElementById('tradeAvailCashRow'),
        tradeAvailCashVal: document.getElementById('tradeAvailCashVal'),
        tradeAvailSharesRow: document.getElementById('tradeAvailSharesRow'),
        tradeAvailSharesVal: document.getElementById('tradeAvailSharesVal'),
        tradePositionSizingBox: document.getElementById('tradePositionSizingBox'),
        tradePositionSizingText: document.getElementById('tradePositionSizingText'),
        tradeGrossVal: document.getElementById('tradeGrossVal'),
        tradeFrictionVal: document.getElementById('tradeFrictionVal'),
        tradeStcgRow: document.getElementById('tradeStcgRow'),
        tradeStcgVal: document.getElementById('tradeStcgVal'),
        tradeTotalLabel: document.getElementById('tradeTotalLabel'),
        tradeEstTotalVal: document.getElementById('tradeEstTotalVal'),
        tradeEstRemainingVal: document.getElementById('tradeEstRemainingVal'),
        tradeRemainingLabel: document.getElementById('tradeRemainingLabel'),
        tradeSellPnLCard: document.getElementById('tradeSellPnLCard'),
        tradeSellPnLTitle: document.getElementById('tradeSellPnLTitle'),
        tradeSellPnLPill: document.getElementById('tradeSellPnLPill'),
        tradeSellPnLDesc: document.getElementById('tradeSellPnLDesc'),
        tradeValidationBox: document.getElementById('tradeValidationBox'),
        btnExecuteTrade: document.getElementById('btnExecuteTrade'),
        
        // Stock Chart Inspector Modal
        chartModal: document.getElementById('chartModal'),
        chartModalTitle: document.getElementById('chartModalTitle'),
        chartModalPrice: document.getElementById('chartModalPrice'),
        chartModalChange: document.getElementById('chartModalChange'),
        chartModalHigh: document.getElementById('chartModalHigh'),
        chartModalLow: document.getElementById('chartModalLow'),
        chartModalVolume: document.getElementById('chartModalVolume'),
        chartModalPe: document.getElementById('chartModalPe'),
        chartModalIndustryPe: document.getElementById('chartModalIndustryPe'),
        chartModalDebtToEquity: document.getElementById('chartModalDebtToEquity'),
        chartModalEarningsGrowth: document.getElementById('chartModalEarningsGrowth'),
        chartModalMcap: document.getElementById('chartModalMcap'),
        chartModalPeBadge: document.getElementById('chartModalPeBadge'),
        chartModalQuarterlyStatus: document.getElementById('chartModalQuarterlyStatus'),
        
        // Investor Discipline & Loss Aversion Elements
        disciplineScoreBadge: document.getElementById('disciplineScoreBadge'),
        disciplineLevelText: document.getElementById('disciplineLevelText'),
        disciplineMeterBar: document.getElementById('disciplineMeterBar'),
        disciplineTipsList: document.getElementById('disciplineTipsList'),
        lossAversionAlertBanner: document.getElementById('lossAversionAlertBanner'),
        lossAversionDetails: document.getElementById('lossAversionDetails'),
        
        // User Auth Elements
        userAccountBtn: document.getElementById('userAccountBtn'),
        btnLogoutBtn: document.getElementById('btnLogoutBtn'),
        userAvatarText: document.getElementById('userAvatarText'),
        userDisplayName: document.getElementById('userDisplayName'),
        
        // Auth Modal
        authModal: document.getElementById('authModal'),
        closeAuthModal: document.getElementById('closeAuthModal'),
        authTabLogin: document.getElementById('authTabLogin'),
        authTabRegister: document.getElementById('authTabRegister'),
        authNameGroup: document.getElementById('authNameGroup'),
        authFullName: document.getElementById('authFullName'),
        authUsername: document.getElementById('authUsername'),
        authPassword: document.getElementById('authPassword'),
        authValidationBox: document.getElementById('authValidationBox'),
        btnSubmitAuth: document.getElementById('btnSubmitAuth'),
        authHint: document.getElementById('authHint'),
        
        // Toasts
        toastContainer: document.getElementById('toastContainer')
    };

    // ==========================================
    // NOTIFICATION TOAST HELPER
    // ==========================================
    function showToast(title, desc, type = 'info', duration = 4000) {
        if (!elements.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
        } else {
            iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
        }

        toast.innerHTML = `
            <div style="flex-shrink:0;">${iconSvg}</div>
            <div style="flex:1;">
                <div class="toast-title">${title}</div>
                <div class="toast-desc">${desc}</div>
            </div>
            <button style="background:none; border:none; color:#64748b; cursor:pointer;" onclick="this.parentElement.remove()">✕</button>
        `;

        elements.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(60px)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ==========================================
    // LIVE MARKET CLOCK
    // ==========================================
    function updateLiveClock() {
        const el = document.getElementById('liveMarketClock');
        if (!el) return;
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        const isMarketHours = now.getHours() >= 9 && (now.getHours() < 15 || (now.getHours() === 15 && now.getMinutes() < 30));
        const statusDot = isMarketHours
            ? `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;margin-right:5px;animation:pulse 1.5s ease-in-out infinite;"></span>`
            : `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#ef4444;margin-right:5px;"></span>`;
        el.innerHTML = `${statusDot}${h}:${m}:${s} IST &nbsp;${isMarketHours ? '<span style="color:#10b981;font-weight:600;">Market Open</span>' : '<span style="color:#ef4444;">Market Closed</span>'}`;
    }
    updateLiveClock();
    setInterval(updateLiveClock, 1000);

    // ==========================================
    // KEYBOARD SHORTCUTS
    // ==========================================
    document.addEventListener('keydown', (e) => {
        // Skip if typing in an input/textarea
        if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
        // N = Next Trading Day
        if (e.key === 'n' || e.key === 'N') {
            const btn = document.getElementById('btnSimulateDay');
            if (btn) btn.click();
        }
        // 1-5 = Switch views
        if (e.key === '1') switchView('dashboard');
        if (e.key === '2') switchView('market');
        if (e.key === '3') switchView('portfolio');
        if (e.key === '4') switchView('transactions');
        if (e.key === '5') switchView('insights');
        // Escape = close any open modal
        if (e.key === 'Escape') {
            closeTradeModal();
            if (elements.chartModal) elements.chartModal.classList.remove('open');
            closeAuthModal();
        }
    });

    // ==========================================
    // VIEW NAVIGATION
    // ==========================================
    function switchView(viewName) {
        currentView = viewName;
        elements.navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === viewName);
        });
        elements.viewSections.forEach(sec => {
            sec.classList.toggle('active', sec.id === `view-${viewName}`);
        });

        // Re-render charts or specific views when visible
        if (viewName === 'dashboard') {
            renderDashboard();
        } else if (viewName === 'market') {
            renderStocksTable();
        } else if (viewName === 'portfolio') {
            renderPortfolioTable();
        } else if (viewName === 'transactions') {
            renderTransactionsTable();
        } else if (viewName === 'insights') {
            renderInsightsTab();
        }
    }

    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchView(tab.dataset.view));
    });

    // ==========================================
    // RENDER TICKER TAPE
    // ==========================================
    function renderTickerTape() {
        if (!elements.tickerTape) return;
        const stocks = engine.stocks;
        // Duplicate for seamless infinite loop
        const items = [...stocks, ...stocks];

        elements.tickerTape.innerHTML = items.map(stock => {
            const change = stock.price - stock.prevClose;
            const changePct = (change / stock.prevClose) * 100;
            const isUp = change >= 0;
            const sign = isUp ? '+' : '';

            return `
                <div class="ticker-item" data-symbol="${stock.symbol}">
                    <span class="ticker-symbol">${stock.symbol}</span>
                    <span class="ticker-price">${formatINR(stock.price)}</span>
                    <span class="ticker-change ${isUp ? 'up' : 'down'}">
                        ${isUp ? '▲' : '▼'} ${sign}${changePct.toFixed(2)}%
                    </span>
                </div>
            `;
        }).join('');

        // Click on ticker opens detailed chart
        elements.tickerTape.querySelectorAll('.ticker-item').forEach(el => {
            el.addEventListener('click', () => {
                const sym = el.dataset.symbol;
                const stock = engine.getStock(sym);
                if (stock) openChartModal(stock);
            });
        });
    }

    // ==========================================
    // RENDER DASHBOARD
    // ==========================================
    function renderDashboard() {
        const stats = engine.calculatePortfolio();
        
        // 1. Update Metrics Cards
        if (elements.headerCash) elements.headerCash.textContent = formatINR(stats.cash_balance);
        if (elements.metricCash) elements.metricCash.textContent = formatINR(stats.cash_balance);
        if (elements.metricPortfolioVal) elements.metricPortfolioVal.textContent = formatINR(stats.current_portfolio_value);
        if (elements.metricNetWorth) elements.metricNetWorth.textContent = formatINR(stats.net_worth);
        
        if (elements.metricPnL) {
            elements.metricPnL.textContent = formatINR(stats.total_pnl);
            elements.metricPnL.style.color = stats.total_pnl >= 0 ? 'var(--success)' : 'var(--danger)';
        }

        if (elements.metricPnLBadge) {
            const isUp = stats.total_pnl >= 0;
            elements.metricPnLBadge.className = `metric-badge ${isUp ? 'up' : 'down'}`;
            elements.metricPnLBadge.innerHTML = `${isUp ? '▲' : '▼'} ${formatPercent(stats.total_pnl_percent)}`;
        }

        if (elements.metricReturnBadge) {
            const isUp = stats.overall_return >= 0;
            elements.metricReturnBadge.className = `metric-badge ${isUp ? 'up' : 'down'}`;
            elements.metricReturnBadge.innerHTML = `${isUp ? '▲' : '▼'} ${formatPercent(stats.overall_return)}`;
        }

        if (elements.tradingDayBadge) {
            elements.tradingDayBadge.textContent = `Trading Day #${engine.tradingDay}`;
        }

        // 2. Render Portfolio Donut Chart
        Charts.renderPortfolioDonut('portfolioDonutChart', stats.holdings, stats.cash_balance);

        // 3. Render Investor Discipline & Risk Assessment
        if (elements.disciplineScoreBadge) {
            const score = stats.disciplineScore || 100;
            elements.disciplineScoreBadge.textContent = `${score} / 100`;

            let scoreColor = '#10b981';
            let scoreLevel = 'Excellent (Disciplined)';
            let badgeClass = 'metric-badge up';

            if (score < 55) {
                scoreColor = '#ef4444';
                scoreLevel = 'High Risk (Ego / Overexposure)';
                badgeClass = 'metric-badge down';
            } else if (score < 80) {
                scoreColor = '#f59e0b';
                scoreLevel = 'Moderate Risk (Caution Required)';
                badgeClass = 'metric-badge neutral';
            }

            elements.disciplineScoreBadge.className = badgeClass;
            if (elements.disciplineLevelText) {
                elements.disciplineLevelText.textContent = scoreLevel;
                elements.disciplineLevelText.style.color = scoreColor;
            }
            if (elements.disciplineMeterBar) {
                elements.disciplineMeterBar.style.width = `${score}%`;
                elements.disciplineMeterBar.style.background = scoreColor;
            }

            if (elements.disciplineTipsList) {
                if (stats.disciplineTips && stats.disciplineTips.length > 0) {
                    elements.disciplineTipsList.innerHTML = stats.disciplineTips.map(tip => `
                        <div style="color: ${tip.includes('Concentration') || tip.includes('Loss Aversion') ? '#fca5a5' : '#fbbf24'}; display:flex; align-items:flex-start; gap:6px;">
                            <span>⚠️</span>
                            <span>${tip}</span>
                        </div>
                    `).join('');
                } else {
                    elements.disciplineTipsList.innerHTML = `
                        <div style="color: #10b981;">✓ Optimal position sizing: No stock exceeds 20% of portfolio net worth.</div>
                        <div style="color: #10b981;">✓ Zero loss-aversion traps: No unmanaged sunken losses detected.</div>
                        <div style="color: #10b981;">✓ Healthy cash reserve available to capitalize on market corrections.</div>
                    `;
                }
            }
        }

        // 4. Render Top Movers / Gainers
        renderTopMovers();

        // 5. Render Recent Transactions
        renderDashboardRecentTxns();
    }

    function renderTopMovers() {
        if (!elements.topMoversContainer) return;
        const sorted = [...engine.stocks].sort((a, b) => {
            const changeA = ((a.price - a.prevClose) / a.prevClose);
            const changeB = ((b.price - b.prevClose) / b.prevClose);
            return changeB - changeA;
        });

        const top3 = sorted.slice(0, 4);
        elements.topMoversContainer.innerHTML = top3.map(stock => {
            const change = stock.price - stock.prevClose;
            const changePct = (change / stock.prevClose) * 100;
            const isUp = change >= 0;

            return `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:12px; background:var(--bg-card-subtle); border-radius:var(--radius-sm); border:1px solid var(--border-subtle); margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="stock-avatar" style="background:${stock.brandColor || '#6366f1'}; border-color:${stock.brandColor || '#6366f1'};">${stock.symbol.substring(0, 2)}</div>
                        <div>
                            <div style="font-weight:700; font-size:13px;">${stock.symbol}</div>
                            <div style="font-size:11px; color:var(--text-muted);">${stock.sector}</div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:700; font-size:13px;">${formatINR(stock.price)}</div>
                        <div class="change-pill ${isUp ? 'up' : 'down'}" style="font-size:11px; padding:2px 6px;">
                            ${isUp ? '▲' : '▼'} ${formatPercent(changePct)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderDashboardRecentTxns() {
        if (!elements.dashboardRecentTxns) return;
        const recent = engine.transactions.slice(0, 5);
        if (recent.length === 0) {
            elements.dashboardRecentTxns.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:24px; color:var(--text-muted);">
                        No transactions recorded yet. Start trading to see activity here!
                    </td>
                </tr>
            `;
            return;
        }

        elements.dashboardRecentTxns.innerHTML = recent.map(t => {
            const isBuy = t.type === 'BUY';
            return `
                <tr>
                    <td style="color:var(--text-muted); font-size:12px;">${t.timestamp}</td>
                    <td>
                        <span class="change-pill ${isBuy ? 'up' : 'down'}">${t.type}</span>
                    </td>
                    <td style="font-weight:700;">${t.symbol}</td>
                    <td>${t.quantity}</td>
                    <td style="font-weight:700; font-variant-numeric:tabular-nums;">${formatINR(t.total)}</td>
                </tr>
            `;
        }).join('');
    }

    // ==========================================
    // MARKET INSIGHTS & WEEKLY NEWS TAB
    // ==========================================
    function renderInsightsTab() {
        // Update day & week badge
        const dayBadge = document.getElementById('insightsDayBadge');
        const currentWeek = Math.ceil(engine.tradingDay / 7) || 1;
        if (dayBadge) dayBadge.textContent = `Trading Day #${engine.tradingDay}  ·  Week ${currentWeek}`;

        // Render MARKET_NEWS_FEED cards — weekly rotation
        const newsContainer = document.getElementById('marketNewsContainer');
        if (newsContainer && typeof MARKET_NEWS_FEED !== 'undefined') {
            // Show current week's news first (highlighted), then past weeks
            const totalWeeks = MARKET_NEWS_FEED.length;
            const currentNewsIdx = (currentWeek - 1) % totalWeeks;

            // Build ordered list: current week first, then previous weeks descending
            const ordered = [];
            for (let w = currentWeek; w >= 1 && ordered.length < totalWeeks; w--) {
                const idx = (w - 1) % totalWeeks;
                ordered.push({ news: MARKET_NEWS_FEED[idx], weekNum: w, isCurrent: w === currentWeek });
            }

            newsContainer.innerHTML = ordered.map((item) => {
                const news = item.news;
                const isBullish = news.sentiment === 'bullish';
                const isBearish = news.sentiment === 'bearish';
                const color = isBullish ? '#10b981' : isBearish ? '#f43f5e' : '#6366f1';
                const icon = isBullish ? '🚀' : isBearish ? '📉' : '📊';
                const opacity = item.isCurrent ? '1' : '0.55';
                const currentTag = item.isCurrent
                    ? '<span style="font-size:9px;background:#6366f1;color:#fff;padding:1px 7px;border-radius:4px;margin-left:8px;font-weight:700;">THIS WEEK</span>'
                    : '<span style="font-size:9px;color:#64748b;margin-left:8px;">Past</span>';

                return `
                    <div style="padding:12px 14px; background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); border:1px solid var(--border-subtle); border-left:3px solid ${color}; opacity:${opacity}; transition:opacity 0.2s;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <strong style="color:#f8fafc; font-size:12px; flex:1; margin-right:8px;">${icon} ${news.headline}${currentTag}</strong>
                            <span style="font-size:10px; background:${color}22; color:${color}; padding:2px 8px; border-radius:99px; font-weight:700; text-transform:uppercase; white-space:nowrap;">${news.sentiment}</span>
                        </div>
                        <p style="font-size:11px; color:var(--text-secondary); margin:0; line-height:1.5;">${news.desc || ''}</p>
                    </div>
                `;
            }).join('');
        }

        // Render sector trends
        const sectorContainer = document.getElementById('sectorTrendsContainer');
        if (sectorContainer) {
            const sectorData = [
                { sector: 'Banking & Financials', trend: 'RBI rate hold: Positive for credit growth. Watch NPAs closely.', color: '#10b981' },
                { sector: 'Information Technology', trend: 'USD/INR at 84: IT exports benefit. US budget uncertainty risk.', color: '#38bdf8' },
                { sector: 'Energy & Conglomerate', trend: 'Crude above $80: Mixed. Jio 5G monetization drives upside.', color: '#f59e0b' },
                { sector: 'Automotive', trend: 'EV policy tailwinds. Festive season demand robust.', color: '#a78bfa' },
                { sector: 'Telecommunications', trend: 'Tariff hike cycle complete. ARPU growth phase begins.', color: '#f43f5e' },
            ];
            sectorContainer.innerHTML = sectorData.map(s => `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:10px; background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); gap:10px; border:1px solid var(--border-subtle);">
                    <div style="flex:1;">
                        <div style="font-size:12px; font-weight:700; color:#f8fafc; margin-bottom:3px;">${s.sector}</div>
                        <div style="font-size:11px; color:var(--text-secondary);">${s.trend}</div>
                    </div>
                    <span style="width:8px; height:8px; border-radius:50%; background:${s.color}; flex-shrink:0; margin-top:4px; display:inline-block;"></span>
                </div>
            `).join('');
        }
    }

    // ==========================================
    // RENDER STOCKS WATCHLIST / MARKET VIEW
    // ==========================================
    function renderStocksTable() {
        if (!elements.stocksTableBody) return;
        const search = elements.stockSearchInput ? elements.stockSearchInput.value : '';
        const sector = elements.sectorFilterSelect ? elements.sectorFilterSelect.value : 'All';
        const filtered = engine.getFilteredStocks(search, sector);

        if (filtered.length === 0) {
            elements.stocksTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:36px; color:var(--text-muted);">
                        No stocks found matching your search criteria.
                    </td>
                </tr>
            `;
            return;
        }

        elements.stocksTableBody.innerHTML = filtered.map(stock => {
            const change = stock.price - stock.prevClose;
            const changePct = (change / stock.prevClose) * 100;
            const isUp = change >= 0;
            const sparkline = Charts.renderSparklineSVG(stock.history, isUp);

            return `
                <tr>
                    <td>
                        <div class="stock-cell">
                            <div class="stock-avatar" style="background:${stock.brandColor || '#6366f1'}; border-color:${stock.brandColor || '#6366f1'};">${stock.symbol.substring(0, 2)}</div>
                            <div class="stock-names">
                                <span class="stock-symbol">${stock.symbol}</span>
                                <span class="stock-company">${stock.name}</span>
                            </div>
                        </div>
                    </td>
                    <td><span class="sector-tag">${stock.sector}</span></td>
                    <td class="price-cell">${formatINR(stock.price)}</td>
                    <td>
                        <span class="change-pill ${isUp ? 'up' : 'down'}">
                            ${isUp ? '▲' : '▼'} ${formatPercent(changePct)}
                        </span>
                    </td>
                    <td style="color:var(--text-muted); font-size:12px;">
                        ${formatINR(stock.dayLow)} - ${formatINR(stock.dayHigh)}
                    </td>
                    <td>${sparkline}</td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="btn btn-sm btn-success" data-action="buy" data-symbol="${stock.symbol}">
                                Buy
                            </button>
                            <button class="btn btn-sm btn-danger" data-action="sell" data-symbol="${stock.symbol}">
                                Sell
                            </button>
                            <button class="btn btn-sm btn-secondary" data-action="chart" data-symbol="${stock.symbol}" title="View Details & Interactive Chart">
                                📊
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Attach action handlers
        elements.stocksTableBody.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const symbol = btn.dataset.symbol;
                const stock = engine.getStock(symbol);
                if (!stock) return;

                if (action === 'buy') {
                    openTradeModal(stock, 'buy');
                } else if (action === 'sell') {
                    openTradeModal(stock, 'sell');
                } else if (action === 'chart') {
                    openChartModal(stock);
                }
            });
        });
    }

    // Populate sector dropdown
    function populateSectorFilter() {
        if (!elements.sectorFilterSelect) return;
        const sectors = engine.getSectors();
        elements.sectorFilterSelect.innerHTML = sectors.map(sec => `
            <option value="${sec}">${sec === 'All' ? 'All Sectors' : sec}</option>
        `).join('');
    }

    if (elements.stockSearchInput) {
        elements.stockSearchInput.addEventListener('input', renderStocksTable);
    }
    if (elements.sectorFilterSelect) {
        elements.sectorFilterSelect.addEventListener('change', renderStocksTable);
    }

    // ==========================================
    // RENDER PORTFOLIO HOLDINGS VIEW
    // ==========================================
    function renderPortfolioTable() {
        const stats = engine.calculatePortfolio();
        const holdings = stats.holdings;

        // Portfolio summary banners
        const summaryInvested = document.getElementById('portfolioTotalInvested');
        const summaryCurrent = document.getElementById('portfolioCurrentVal');
        const summaryReturns = document.getElementById('portfolioTotalReturns');
        
        if (summaryInvested) summaryInvested.textContent = formatINR(stats.total_invested);
        if (summaryCurrent) summaryCurrent.textContent = formatINR(stats.current_portfolio_value);
        if (summaryReturns) {
            summaryReturns.textContent = `${formatINR(stats.total_pnl)} (${formatPercent(stats.total_pnl_percent)})`;
            summaryReturns.style.color = stats.total_pnl >= 0 ? 'var(--success)' : 'var(--danger)';
        }

        // Loss Aversion & Ego Bias Alert Banner
        if (elements.lossAversionAlertBanner && elements.lossAversionDetails) {
            if (stats.activeLossAversions && stats.activeLossAversions.length > 0) {
                elements.lossAversionAlertBanner.style.display = 'block';
                const totalSunken = stats.activeLossAversions.reduce((acc, x) => acc + x.loss, 0);
                const totalOppCost = stats.activeLossAversions.reduce((acc, x) => acc + x.opportunityCost, 0);
                const names = stats.activeLossAversions.map(x => `<strong>${x.symbol}</strong> (-${x.lossPercent.toFixed(1)}%)`).join(', ');

                elements.lossAversionDetails.innerHTML = `
                    You are holding <strong>${stats.activeLossAversions.length} stock(s)</strong> (${names}) with sunken paper losses (> 8%), totaling <strong>${formatINR(totalSunken)}</strong>.
                    <br>
                    <span style="color:#fde047; font-weight:600;">Opportunity Cost:</span> Keeping your capital paralyzed here in hope of breaking even has forfeited ~<strong>${formatINR(totalOppCost)}</strong> in alternative returns. Professional investors accept small losses to preserve capital for winning setups.
                `;
            } else {
                elements.lossAversionAlertBanner.style.display = 'none';
            }
        }

        if (holdings.length === 0) {
            if (elements.portfolioTableCard) elements.portfolioTableCard.style.display = 'none';
            if (elements.portfolioEmptyState) elements.portfolioEmptyState.style.display = 'block';
            return;
        }

        if (elements.portfolioTableCard) elements.portfolioTableCard.style.display = 'block';
        if (elements.portfolioEmptyState) elements.portfolioEmptyState.style.display = 'none';

        elements.portfolioTableBody.innerHTML = holdings.map(h => {
            const isUp = h.pnl >= 0;
            const stockData = engine.getStock(h.symbol);
            const avatarBg = (stockData && stockData.brandColor) ? stockData.brandColor : '#6366f1';
            return `
                <tr>
                    <td>
                        <div class="stock-cell">
                            <div class="stock-avatar" style="background:${avatarBg}; border-color:${avatarBg};">${h.symbol.substring(0, 2)}</div>
                            <div class="stock-names">
                                <span class="stock-symbol">${h.symbol}</span>
                                <span class="stock-company">${h.name}</span>
                                ${h.portfolio_weight > 20 ? `<span style="font-size:10px; color:#fbbf24; display:block;">⚠️ Overweight (${h.portfolio_weight.toFixed(1)}% of PF)</span>` : ''}
                            </div>
                        </div>
                    </td>
                    <td style="font-weight:700;">${h.quantity}</td>
                    <td>${formatINR(h.average_buy_price)}</td>
                    <td style="font-weight:700;">${formatINR(h.current_price)}</td>
                    <td>${formatINR(h.invested_value)}</td>
                    <td style="font-weight:700;">${formatINR(h.current_value)}</td>
                    <td>
                        <div class="change-pill ${isUp ? 'up' : 'down'}">
                            ${isUp ? '+' : ''}${formatINR(h.pnl)} (${formatPercent(h.pnl_percent)})
                        </div>
                        ${h.lossAversionWarning ? `
                            <div style="margin-top:4px; font-size:10px; color:#f87171; background:rgba(239,68,68,0.15); padding:2px 6px; border-radius:4px; border:1px solid rgba(239,68,68,0.3); display:inline-block;" title="Holding sunken loss without stop-loss">
                                ⚠️ Ego Trap (Opp Cost: ${formatINR(h.opportunityCost)})
                            </div>
                        ` : ''}
                    </td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="btn btn-sm btn-success" data-action="buy" data-symbol="${h.symbol}">
                                + Buy More
                            </button>
                            <button class="btn btn-sm btn-danger" data-action="sell" data-symbol="${h.symbol}">
                                Sell
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Action handlers for portfolio table
        elements.portfolioTableBody.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const symbol = btn.dataset.symbol;
                const stock = engine.getStock(symbol);
                if (stock) openTradeModal(stock, action);
            });
        });
    }

    // ==========================================
    // RENDER TRANSACTIONS HISTORY VIEW
    // ==========================================
    function renderTransactionsTable() {
        if (!elements.txnsTableBody) return;
        let list = [...engine.transactions];

        if (txnFilter === 'BUY') list = list.filter(t => t.type === 'BUY');
        if (txnFilter === 'SELL') list = list.filter(t => t.type === 'SELL');

        if (list.length === 0) {
            elements.txnsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; padding:36px; color:var(--text-muted);">
                        No transaction records found.
                    </td>
                </tr>
            `;
            return;
        }

        elements.txnsTableBody.innerHTML = list.map(t => {
            const isBuy = t.type === 'BUY';
            return `
                <tr>
                    <td style="color:var(--text-muted); font-size:12px;">${t.timestamp}</td>
                    <td style="font-family:monospace; font-size:11px; color:#818cf8;">${t.id}</td>
                    <td><span class="change-pill ${isBuy ? 'up' : 'down'}">${t.type}</span></td>
                    <td style="font-weight:700;">${t.symbol}</td>
                    <td>${t.quantity}</td>
                    <td>${formatINR(t.price)}</td>
                    <td style="font-weight:700; font-variant-numeric:tabular-nums;">${formatINR(t.total)}</td>
                </tr>
            `;
        }).join('');
    }

    // Transactions Filter Buttons
    document.querySelectorAll('.txn-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.txn-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            txnFilter = btn.dataset.filter;
            renderTransactionsTable();
        });
    });

    // ==========================================
    // TRADING MODAL & EXECUTION
    // ==========================================
    function openTradeModal(stock, type = 'buy') {
        selectedStock = stock;
        currentTradeType = type;
        
        elements.tradeStockSymbol.textContent = stock.symbol;
        elements.tradeStockName.textContent = stock.name;
        elements.tradeStockPrice.textContent = formatINR(stock.price);
        
        const change = stock.price - stock.prevClose;
        const changePct = (change / stock.prevClose) * 100;
        elements.tradeStockChange.className = `change-pill ${change >= 0 ? 'up' : 'down'}`;
        elements.tradeStockChange.textContent = `${change >= 0 ? '▲' : '▼'} ${formatPercent(changePct)}`;

        elements.tradeQuantityInput.value = 1;
        setTradeTab(type);
        updateTradeCalculations();

        elements.tradeModal.classList.add('open');
        elements.tradeQuantityInput.focus();
    }

    function closeTradeModal() {
        elements.tradeModal.classList.remove('open');
        elements.tradeValidationBox.className = 'validation-box';
        elements.tradeValidationBox.style.display = 'none';
    }

    function setTradeTab(type) {
        currentTradeType = type;
        elements.tradeBuyTab.classList.toggle('active', type === 'buy');
        elements.tradeSellTab.classList.toggle('active', type === 'sell');
        
        elements.btnExecuteTrade.textContent = type === 'buy' ? 'Confirm Purchase' : 'Confirm Sale';
        elements.btnExecuteTrade.className = `btn btn-lg ${type === 'buy' ? 'btn-success' : 'btn-danger'}`;

        if (type === 'buy') {
            elements.tradeAvailCashRow.style.display = 'flex';
            elements.tradeAvailSharesRow.style.display = 'none';
            elements.tradeRemainingLabel.textContent = 'Estimated Balance After Trade:';
            // Hide sell P&L card when in buy mode
            if (elements.tradeSellPnLCard) elements.tradeSellPnLCard.style.display = 'none';
        } else {
            elements.tradeAvailCashRow.style.display = 'none';
            elements.tradeAvailSharesRow.style.display = 'flex';
            elements.tradeRemainingLabel.textContent = 'Cash Proceeds From Sale:';
        }

        updateTradeCalculations();
    }

    function updateTradeCalculations() {
        if (!selectedStock) return;
        const qty = parseInt(elements.tradeQuantityInput.value, 10) || 0;
        const price = selectedStock.price;
        const grossVal = Number((qty * price).toFixed(2));
        const holding = engine.getHolding(selectedStock.symbol);
        const ownedQty = holding ? holding.quantity : 0;

        elements.tradeAvailCashVal.textContent = formatINR(engine.user.cash_balance);
        elements.tradeAvailSharesVal.textContent = `${ownedQty} share(s)`;

        // Calculate real Indian delivery taxes & friction
        let grossPnL = 0;
        if (currentTradeType === 'sell' && holding) {
            grossPnL = Number(((price - holding.average_buy_price) * qty).toFixed(2));
        }

        const friction = typeof calculateTradeFriction === 'function'
            ? calculateTradeFriction(currentTradeType.toUpperCase(), grossVal, grossPnL)
            : { totalFriction: 0, stcgTax: 0, netDeduction: 0 };

        if (elements.tradeGrossVal) elements.tradeGrossVal.textContent = formatINR(grossVal);
        if (elements.tradeFrictionVal) elements.tradeFrictionVal.textContent = `-${formatINR(friction.totalFriction)}`;

        // STCG Tax display on sell
        if (elements.tradeStcgRow && elements.tradeStcgVal) {
            if (currentTradeType === 'sell' && friction.stcgTax > 0) {
                elements.tradeStcgRow.style.display = 'flex';
                elements.tradeStcgVal.textContent = `-${formatINR(friction.stcgTax)}`;
            } else {
                elements.tradeStcgRow.style.display = 'none';
            }
        }

        // Net amounts
        let netTotal = grossVal;
        if (currentTradeType === 'buy') {
            netTotal = Number((grossVal + friction.totalFriction).toFixed(2));
            if (elements.tradeTotalLabel) elements.tradeTotalLabel.textContent = 'Net Cash Required:';
            if (elements.tradeEstTotalVal) elements.tradeEstTotalVal.textContent = formatINR(netTotal);
            const remaining = Number((engine.user.cash_balance - netTotal).toFixed(2));
            if (elements.tradeRemainingLabel) elements.tradeRemainingLabel.textContent = 'Estimated Balance After Trade:';
            if (elements.tradeEstRemainingVal) elements.tradeEstRemainingVal.textContent = formatINR(remaining);
        } else {
            netTotal = Number((grossVal - friction.netDeduction).toFixed(2));
            if (elements.tradeTotalLabel) elements.tradeTotalLabel.textContent = 'Net Cash Credited:';
            if (elements.tradeEstTotalVal) elements.tradeEstTotalVal.textContent = formatINR(netTotal);
            const newBal = Number((engine.user.cash_balance + netTotal).toFixed(2));
            if (elements.tradeRemainingLabel) elements.tradeRemainingLabel.textContent = 'Estimated Balance After Sale:';
            if (elements.tradeEstRemainingVal) elements.tradeEstRemainingVal.textContent = formatINR(newBal);
        }

        // Position Sizing Analysis & Bias Guidance
        const pfStats = engine.calculatePortfolio();
        const netWorth = pfStats.net_worth || 100000;

        if (elements.tradePositionSizingBox && elements.tradePositionSizingText) {
            if (currentTradeType === 'buy') {
                const positionPct = netWorth > 0 ? (grossVal / netWorth) * 100 : 0;
                if (positionPct > 20) {
                    elements.tradePositionSizingBox.style.background = 'rgba(239, 68, 68, 0.12)';
                    elements.tradePositionSizingBox.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                    elements.tradePositionSizingBox.style.color = '#fca5a5';
                    elements.tradePositionSizingText.innerHTML = `⚠️ <strong>High Concentration Risk:</strong> This order consumes <strong>${positionPct.toFixed(1)}%</strong> of your net worth (${formatINR(netWorth)}). Limit single holdings under 15-20% to avoid outsized portfolio risk.`;
                } else {
                    elements.tradePositionSizingBox.style.background = 'rgba(99, 102, 241, 0.08)';
                    elements.tradePositionSizingBox.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                    elements.tradePositionSizingBox.style.color = '#c7d2fe';
                    elements.tradePositionSizingText.innerHTML = `🎯 <strong>Smart Position Sizing:</strong> Order is <strong>${positionPct.toFixed(1)}%</strong> of net worth (safely within &lt; 20% limit). Diversification preserves capital.`;
                }
            } else {
                elements.tradePositionSizingBox.style.background = 'rgba(16, 185, 129, 0.08)';
                elements.tradePositionSizingBox.style.borderColor = 'rgba(16, 185, 129, 0.25)';
                elements.tradePositionSizingBox.style.color = '#a7f3d0';
                elements.tradePositionSizingText.innerHTML = `💡 <strong>Exit Discipline:</strong> Reallocating capital. Regulatory taxes (STT 0.1% + GST) & STCG Tax (20% on profit) are deducted automatically.`;
            }
        }

        // Sell P&L Indicator Card
        if (elements.tradeSellPnLCard) {
            if (currentTradeType === 'sell' && qty > 0 && holding) {
                elements.tradeSellPnLCard.style.display = 'block';
                const isProfit = grossPnL >= 0;
                const pnlPct = holding.average_buy_price > 0
                    ? (grossPnL / (holding.average_buy_price * qty)) * 100
                    : 0;
                elements.tradeSellPnLCard.style.background = isProfit
                    ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';
                elements.tradeSellPnLCard.style.border = `1px solid ${isProfit ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`;
                if (elements.tradeSellPnLTitle) {
                    elements.tradeSellPnLTitle.textContent = isProfit ? '📈 Realizing a Profit' : '📉 Selling at a Loss';
                    elements.tradeSellPnLTitle.style.color = isProfit ? '#10b981' : '#f87171';
                }
                if (elements.tradeSellPnLPill) {
                    elements.tradeSellPnLPill.className = `change-pill ${isProfit ? 'up' : 'down'}`;
                    elements.tradeSellPnLPill.textContent = `${isProfit ? '+' : ''}${formatINR(grossPnL)} (${isProfit ? '+' : ''}${pnlPct.toFixed(2)}%)`;
                }
                if (elements.tradeSellPnLDesc) {
                    elements.tradeSellPnLDesc.style.color = isProfit ? '#a7f3d0' : '#fca5a5';
                    elements.tradeSellPnLDesc.textContent = isProfit
                        ? `Avg buy: ${formatINR(holding.average_buy_price)} → Current: ${formatINR(price)}. Booking profit — well done!`
                        : `Avg buy: ${formatINR(holding.average_buy_price)} → Current: ${formatINR(price)}. Selling below cost. Consider waiting unless cutting losses intentionally.`;
                }
            } else {
                elements.tradeSellPnLCard.style.display = 'none';
            }
        }

        // Validation & Feedback
        elements.tradeValidationBox.style.display = 'none';
        elements.tradeValidationBox.className = 'validation-box';

        if (currentTradeType === 'buy') {
            if (netTotal > engine.user.cash_balance) {
                elements.tradeValidationBox.className = 'validation-box error';
                elements.tradeValidationBox.textContent = `Insufficient funds! You need ${formatINR(netTotal)} (including fees) but only have ${formatINR(engine.user.cash_balance)}.`;
                elements.btnExecuteTrade.disabled = true;
            } else {
                elements.btnExecuteTrade.disabled = (qty <= 0);
            }
        } else {
            // Sell
            if (qty > ownedQty) {
                elements.tradeValidationBox.className = 'validation-box error';
                elements.tradeValidationBox.textContent = `Insufficient shares! You only hold ${ownedQty} share(s) of ${selectedStock.symbol}.`;
                elements.btnExecuteTrade.disabled = true;
            } else {
                elements.btnExecuteTrade.disabled = (qty <= 0 || ownedQty === 0);
            }
        }
    }

    elements.tradeBuyTab.addEventListener('click', () => setTradeTab('buy'));
    elements.tradeSellTab.addEventListener('click', () => setTradeTab('sell'));
    elements.tradeQuantityInput.addEventListener('input', updateTradeCalculations);

    // Quick quantity chips
    document.querySelectorAll('.qty-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const val = chip.dataset.val;
            if (!selectedStock) return;

            if (val === 'max') {
                if (currentTradeType === 'buy') {
                    const maxAffordable = Math.floor(engine.user.cash_balance / selectedStock.price);
                    elements.tradeQuantityInput.value = Math.max(1, maxAffordable);
                } else {
                    const holding = engine.getHolding(selectedStock.symbol);
                    elements.tradeQuantityInput.value = holding ? holding.quantity : 0;
                }
            } else {
                const add = parseInt(val, 10);
                const current = parseInt(elements.tradeQuantityInput.value, 10) || 0;
                elements.tradeQuantityInput.value = Math.max(1, current + add);
            }
            updateTradeCalculations();
        });
    });

    // Execute Trade button click
    elements.btnExecuteTrade.addEventListener('click', async () => {
        if (!selectedStock) return;
        const qty = parseInt(elements.tradeQuantityInput.value, 10);
        if (!qty || qty <= 0) {
            showToast('Invalid Quantity', 'Please enter a valid number of shares.', 'error');
            return;
        }

        elements.btnExecuteTrade.disabled = true;
        elements.btnExecuteTrade.textContent = 'Processing...';

        const result = await cgiBridge.executeTrade(currentTradeType, selectedStock.symbol, qty);

        elements.btnExecuteTrade.disabled = false;
        elements.btnExecuteTrade.textContent = currentTradeType === 'buy' ? 'Confirm Purchase' : 'Confirm Sale';

        if (result.success) {
            showToast(
                currentTradeType === 'buy' ? 'Order Executed: BUY' : 'Order Executed: SELL',
                result.message,
                'success'
            );
            closeTradeModal();
            renderAll();
        } else {
            showToast('Order Rejected', result.message, 'error');
            elements.tradeValidationBox.className = 'validation-box error';
            elements.tradeValidationBox.textContent = result.message;
        }
    });

    // Close trade modal
    document.getElementById('closeTradeModal').addEventListener('click', closeTradeModal);

    // ==========================================
    // DETAILED STOCK CHART MODAL
    // ==========================================
    function openChartModal(stock) {
        selectedStock = stock;
        elements.chartModalTitle.textContent = `${stock.symbol} - ${stock.name}`;
        elements.chartModalPrice.textContent = formatINR(stock.price);
        
        const change = stock.price - stock.prevClose;
        const changePct = (change / stock.prevClose) * 100;
        elements.chartModalChange.className = `change-pill ${change >= 0 ? 'up' : 'down'}`;
        elements.chartModalChange.textContent = `${change >= 0 ? '▲' : '▼'} ${formatPercent(changePct)}`;

        elements.chartModalHigh.textContent = formatINR(stock.dayHigh);
        elements.chartModalLow.textContent = formatINR(stock.dayLow);
        elements.chartModalVolume.textContent = Number(stock.volume).toLocaleString('en-IN');
        elements.chartModalPe.textContent = stock.pe || '24.5';
        if (elements.chartModalIndustryPe) elements.chartModalIndustryPe.textContent = stock.industryPe !== undefined ? stock.industryPe : '24.0';
        if (elements.chartModalDebtToEquity) elements.chartModalDebtToEquity.textContent = stock.debtToEquity !== undefined ? stock.debtToEquity : '0.0';
        if (elements.chartModalEarningsGrowth) elements.chartModalEarningsGrowth.textContent = stock.earningsGrowth || '+10.5%';
        elements.chartModalMcap.textContent = stock.marketCap || '₹10.5 Lakh Cr';

        if (elements.chartModalQuarterlyStatus) {
            elements.chartModalQuarterlyStatus.textContent = stock.quarterlyStatus || 'Consistent quarterly operational growth with steady operating cash margins.';
        }

        if (elements.chartModalPeBadge && stock.pe && stock.industryPe) {
            const peVal = parseFloat(stock.pe);
            const indPe = parseFloat(stock.industryPe);
            if (peVal < indPe * 0.9) {
                elements.chartModalPeBadge.textContent = `Discount Valuation (P/E ${peVal} vs ${indPe} Sector)`;
                elements.chartModalPeBadge.className = 'change-pill up';
                elements.chartModalPeBadge.style = '';
            } else if (peVal > indPe * 1.25) {
                elements.chartModalPeBadge.textContent = `Growth Premium (P/E ${peVal} vs ${indPe} Sector)`;
                elements.chartModalPeBadge.className = 'change-pill down';
                elements.chartModalPeBadge.style = '';
            } else {
                elements.chartModalPeBadge.textContent = `Fairly Valued (P/E ${peVal} vs ${indPe} Sector)`;
                elements.chartModalPeBadge.className = 'change-pill';
                elements.chartModalPeBadge.style.color = '#38bdf8';
                elements.chartModalPeBadge.style.background = 'rgba(56, 189, 248, 0.15)';
                elements.chartModalPeBadge.style.border = '1px solid rgba(56, 189, 248, 0.3)';
            }
        }

        elements.chartModal.classList.add('open');
        setTimeout(() => {
            Charts.renderPriceChart('detailedStockCanvas', stock, selectedChartRange);
        }, 50);
    }

    document.getElementById('closeChartModal').addEventListener('click', () => {
        elements.chartModal.classList.remove('open');
    });

    // Time range buttons in chart modal
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedChartRange = btn.dataset.range;
            if (selectedStock) {
                Charts.renderPriceChart('detailedStockCanvas', selectedStock, selectedChartRange);
            }
        });
    });

    // Direct Buy/Sell from chart modal
    document.getElementById('chartModalBuyBtn').addEventListener('click', () => {
        elements.chartModal.classList.remove('open');
        if (selectedStock) openTradeModal(selectedStock, 'buy');
    });
    document.getElementById('chartModalSellBtn').addEventListener('click', () => {
        elements.chartModal.classList.remove('open');
        if (selectedStock) openTradeModal(selectedStock, 'sell');
    });

    // ==========================================
    // SIMULATION TOOLBAR CONTROLS
    // ==========================================
    // Next Trading Day Button - Advances daily, triggers major weekly news catalyst every multiple of 7
    const btnSimulateDay = document.getElementById('btnSimulateDay');
    if (btnSimulateDay) {
        btnSimulateDay.addEventListener('click', () => {
            const sentiments = ['bullish', 'bearish', 'neutral', 'neutral'];
            const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
            
            const tickResult = engine.simulateMarketTick(randomSentiment);
            renderAll();

            // Weekly milestone news trigger (Day 7, 14, 21, 28, etc.)
            if (tickResult && tickResult.isWeeklyMilestone && tickResult.news) {
                const newsEvent = tickResult.news;
                showToast(
                    `📰 Week #${tickResult.weekNumber} Catalyst (Day #${engine.tradingDay})`,
                    `<strong>${newsEvent.headline}</strong><br><span style="font-size:11px; color:#cbd5e1;">${newsEvent.desc}</span>`,
                    newsEvent.sentiment === 'bullish' ? 'success' : (newsEvent.sentiment === 'bearish' ? 'error' : 'info'),
                    6000
                );
            } else {
                const daysToNextWeek = 7 - (engine.tradingDay % 7);
                showToast(
                    `Trading Day #${engine.tradingDay} Complete`,
                    `Daily price fluctuation updated. Next weekly market catalyst in <strong>${daysToNextWeek} day(s)</strong>.`,
                    'info',
                    3000
                );
            }
        });
    }

    // Reset Account
    const btnResetAccount = document.getElementById('btnResetAccount');
    if (btnResetAccount) {
        btnResetAccount.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset your account? This will clear all holdings, reset capital to ₹1,00,000, and clear transactions.')) {
                engine.resetState();
                renderAll();
                showToast('Account Reset', 'Capital re-initialized to ₹1,00,000.00 virtual cash.', 'info');
            }
        });
    }

    // ==========================================
    // USER AUTHENTICATION & LOGIN MODAL
    // ==========================================
    let authMode = 'login'; // 'login' | 'register'

    function openAuthModal(mode = 'login') {
        authMode = mode;
        setAuthTab(mode);
        if (elements.authValidationBox) {
            elements.authValidationBox.style.display = 'none';
            elements.authValidationBox.className = 'validation-box';
        }
        if (elements.authUsername) elements.authUsername.value = '';
        if (elements.authPassword) elements.authPassword.value = '';
        if (elements.authFullName) elements.authFullName.value = '';
        
        if (elements.authModal) {
            elements.authModal.classList.add('open');
            if (elements.authUsername) elements.authUsername.focus();
        }
    }

    function closeAuthModal() {
        if (elements.authModal) {
            elements.authModal.classList.remove('open');
        }
    }

    function setAuthTab(mode) {
        authMode = mode;
        if (elements.authTabLogin) elements.authTabLogin.classList.toggle('active', mode === 'login');
        if (elements.authTabRegister) elements.authTabRegister.classList.toggle('active', mode === 'register');
        
        if (mode === 'login') {
            if (elements.authModalTitle) elements.authModalTitle.textContent = 'Trader Sign In';
            if (elements.authNameGroup) elements.authNameGroup.style.display = 'none';
            if (elements.btnSubmitAuth) elements.btnSubmitAuth.textContent = 'Sign In to Stockverse';
            if (elements.authHint) {
                elements.authHint.innerHTML = '🔑 <strong>Default Account:</strong> Username: <code>trader</code> | Password: <code>123</code><br>Or switch tab to create your own account!';
            }
        } else {
            if (elements.authModalTitle) elements.authModalTitle.textContent = 'Create New Trading Account';
            if (elements.authNameGroup) elements.authNameGroup.style.display = 'block';
            if (elements.btnSubmitAuth) elements.btnSubmitAuth.textContent = 'Create Account (₹1,00,000 Capital)';
            if (elements.authHint) {
                elements.authHint.innerHTML = '🎁 <strong>Instant Virtual Capital:</strong> New accounts receive <strong>₹1,00,000.00</strong> to trade risk-free!';
            }
        }
    }

    if (elements.authTabLogin) {
        elements.authTabLogin.addEventListener('click', () => setAuthTab('login'));
    }
    if (elements.authTabRegister) {
        elements.authTabRegister.addEventListener('click', () => setAuthTab('register'));
    }
    if (elements.closeAuthModal) {
        elements.closeAuthModal.addEventListener('click', closeAuthModal);
    }
    if (elements.userAccountBtn) {
        elements.userAccountBtn.addEventListener('click', () => openAuthModal('login'));
    }
    if (elements.btnLogoutBtn) {
        elements.btnLogoutBtn.addEventListener('click', () => {
            if (confirm(`Do you want to log out of '${engine.user.name || engine.user.username}'?`)) {
                engine.logout();
                showToast('Signed Out', 'You have been logged out.', 'info');
                openAuthModal('login');
                renderAll();
            }
        });
    }

    // Submit Auth Form
    if (elements.btnSubmitAuth) {
        elements.btnSubmitAuth.addEventListener('click', () => {
            const username = elements.authUsername ? elements.authUsername.value.trim() : '';
            const password = elements.authPassword ? elements.authPassword.value.trim() : '';
            const fullName = elements.authFullName ? elements.authFullName.value.trim() : '';

            let result;
            if (authMode === 'login') {
                result = engine.login(username, password);
            } else {
                result = engine.register(username, fullName, password);
            }

            if (result.success) {
                showToast(
                    authMode === 'login' ? 'Signed In' : 'Account Created',
                    result.message,
                    'success'
                );
                closeAuthModal();
                renderAll();
            } else {
                if (elements.authValidationBox) {
                    elements.authValidationBox.className = 'validation-box error';
                    elements.authValidationBox.textContent = result.message;
                    elements.authValidationBox.style.display = 'block';
                }
            }
        });
    }

    // Export Transactions to CSV
    const btnExportTxns = document.getElementById('btnExportTxns');
    if (btnExportTxns) {
        btnExportTxns.addEventListener('click', () => {
            if (engine.transactions.length === 0) {
                showToast('No Data', 'No transactions to export.', 'info');
                return;
            }
            const headers = ['Timestamp', 'Transaction_ID', 'Type', 'Symbol', 'Quantity', 'Price_INR', 'Total_INR'];
            const rows = engine.transactions.map(t => [
                `"${t.timestamp}"`,
                `"${t.id}"`,
                t.type,
                t.symbol,
                t.quantity,
                t.price,
                t.total
            ]);
            const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `stockverse_transactions_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast('Export Complete', 'Downloaded transaction history CSV.', 'success');
        });
    }

    // Modal click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === elements.tradeModal) closeTradeModal();
        if (e.target === elements.chartModal) elements.chartModal.classList.remove('open');
        if (e.target === elements.authModal) closeAuthModal();
    });

    // ==========================================
    // GLOBAL RE-RENDER DISPATCHER
    // ==========================================
    function renderAll() {
        renderTickerTape();
        
        // Update user profile displays in header
        const currentTrader = engine.user;
        if (elements.userDisplayName) {
            elements.userDisplayName.textContent = currentTrader.name || currentTrader.username || 'Trader';
        }
        if (elements.userAvatarText) {
            const initial = (currentTrader.name || currentTrader.username || 'T').substring(0, 1).toUpperCase();
            elements.userAvatarText.textContent = initial;
        }

        if (currentView === 'dashboard') renderDashboard();
        if (currentView === 'market') renderStocksTable();
        if (currentView === 'portfolio') renderPortfolioTable();
        if (currentView === 'transactions') renderTransactionsTable();
        if (currentView === 'insights') renderInsightsTab();
        
        // Always refresh top banner balance
        if (elements.headerCash) elements.headerCash.textContent = formatINR(engine.user.cash_balance);
    }

    // Subscribe engine changes
    engine.subscribe((event, data) => {
        renderAll();
    });

    // Initial Setup
    populateSectorFilter();
    renderAll();

    // URL parameters hook for view & modal direct access
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('seed') === 'true') {
        if (!engine.user.holdings || engine.user.holdings.length === 0) {
            engine.buyStock('RELIANCE', 10);
            engine.buyStock('TCS', 5);
            engine.buyStock('HDFCBANK', 15);
            engine.simulateMarketTick('bullish');
        }
    }
    const viewParam = urlParams.get('view');
    if (viewParam) switchView(viewParam);

    const modalParam = urlParams.get('modal');
    if (modalParam === 'trade') {
        setTimeout(() => openTradeModal(engine.stocks[0], 'buy'), 200);
    } else if (modalParam === 'chart') {
        setTimeout(() => openChartModal(engine.stocks[0]), 200);
    } else if (modalParam === 'auth') {
        setTimeout(() => openAuthModal('login'), 200);
    }
});

