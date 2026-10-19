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
    let autoTickInterval = null;
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
        txnsEmptyState: document.getElementById('txnsEmptyState'),
        
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
        tradeEstTotalVal: document.getElementById('tradeEstTotalVal'),
        tradeEstRemainingVal: document.getElementById('tradeEstRemainingVal'),
        tradeRemainingLabel: document.getElementById('tradeRemainingLabel'),
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
        chartModalMcap: document.getElementById('chartModalMcap'),
        
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

        // 3. Render Top Movers / Gainers
        renderTopMovers();

        // 4. Render Recent Transactions
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
                        <div class="stock-avatar">${stock.symbol.substring(0, 2)}</div>
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
                            <div class="stock-avatar">${stock.symbol.substring(0, 2)}</div>
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

        if (holdings.length === 0) {
            if (elements.portfolioTableCard) elements.portfolioTableCard.style.display = 'none';
            if (elements.portfolioEmptyState) elements.portfolioEmptyState.style.display = 'block';
            return;
        }

        if (elements.portfolioTableCard) elements.portfolioTableCard.style.display = 'block';
        if (elements.portfolioEmptyState) elements.portfolioEmptyState.style.display = 'none';

        elements.portfolioTableBody.innerHTML = holdings.map(h => {
            const isUp = h.pnl >= 0;
            return `
                <tr>
                    <td>
                        <div class="stock-cell">
                            <div class="stock-avatar">${h.symbol.substring(0, 2)}</div>
                            <div class="stock-names">
                                <span class="stock-symbol">${h.symbol}</span>
                                <span class="stock-company">${h.name}</span>
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
        const total = qty * price;
        const holding = engine.getHolding(selectedStock.symbol);
        const ownedQty = holding ? holding.quantity : 0;

        elements.tradeAvailCashVal.textContent = formatINR(engine.user.cash_balance);
        elements.tradeAvailSharesVal.textContent = `${ownedQty} share(s)`;
        elements.tradeEstTotalVal.textContent = formatINR(total);

        // Validation & remaining feedback
        elements.tradeValidationBox.style.display = 'none';
        elements.tradeValidationBox.className = 'validation-box';

        if (currentTradeType === 'buy') {
            const remaining = engine.user.cash_balance - total;
            elements.tradeEstRemainingVal.textContent = formatINR(remaining);
            if (total > engine.user.cash_balance) {
                elements.tradeValidationBox.className = 'validation-box error';
                elements.tradeValidationBox.textContent = `Insufficient funds! You need ${formatINR(total)} but only have ${formatINR(engine.user.cash_balance)}.`;
                elements.btnExecuteTrade.disabled = true;
            } else {
                elements.btnExecuteTrade.disabled = (qty <= 0);
            }
        } else {
            // Sell
            elements.tradeEstRemainingVal.textContent = `+${formatINR(total)}`;
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
        elements.chartModalMcap.textContent = stock.marketCap || '₹10.5 Lakh Cr';

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
    // Next Trading Day Button
    document.getElementById('btnSimulateDay').addEventListener('click', () => {
        const sentiments = ['bullish', 'bearish', 'neutral', 'neutral'];
        const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
        
        engine.simulateMarketTick(randomSentiment);
        renderAll();

        const sentimentLabels = {
            bullish: 'Bullish Rally 🚀 (+0.8% market drift)',
            bearish: 'Market Pullback 📉 (-0.8% market drift)',
            neutral: 'Normal Trading Session 📊'
        };

        showToast(
            `Trading Day #${engine.tradingDay} Complete`,
            `Market updated with daily fluctuations! Sentiment: ${sentimentLabels[randomSentiment]}`,
            'info'
        );
    });

    // Auto-Simulate (Live Ticker) Toggle
    const btnAutoTick = document.getElementById('btnAutoTick');
    btnAutoTick.addEventListener('click', () => {
        if (autoTickInterval) {
            clearInterval(autoTickInterval);
            autoTickInterval = null;
            btnAutoTick.innerHTML = '<span>⚡ Auto-Tick: OFF</span>';
            btnAutoTick.classList.remove('btn-primary');
            btnAutoTick.classList.add('btn-secondary');
            showToast('Auto-Simulation Paused', 'Market ticks are now manual.', 'info');
        } else {
            autoTickInterval = setInterval(() => {
                engine.simulateMarketTick();
                renderAll();
            }, 4000);
            btnAutoTick.innerHTML = '<span>⚡ Auto-Tick: ON (4s)</span>';
            btnAutoTick.classList.remove('btn-secondary');
            btnAutoTick.classList.add('btn-primary');
            showToast('Auto-Simulation Active', 'Simulating new market ticks every 4 seconds.', 'success');
        }
    });

    // Reset Account
    document.getElementById('btnResetAccount').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset your account? This will clear all holdings, reset capital to ₹1,00,000, and clear transactions.')) {
            engine.resetState();
            renderAll();
            showToast('Account Reset', 'Capital re-initialized to ₹1,00,000.00.', 'info');
        }
    });

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
});

