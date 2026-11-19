/**
 * Stockverse - Trading Engine & Business Logic
 * Implements the core financial algorithms:
 * - Multi-user Account management (Login / Register / Session)
 * - Initial Virtual Capital ₹1,00,000 per user
 * - Validation functions (Sufficient funds, holdings verification)
 * - Order processing (buy_stock, sell_stock)
 * - Profit / Loss calculations per-stock & total portfolio
 * - Daily price fluctuation simulation
 * - Persistent storage (localStorage & exportable)
 */

class TradingEngine {
    constructor() {
        this.STORAGE_KEY = 'STOCKVERSE_MARKET_STATE_V2';
        this.USERS_KEY = 'STOCKVERSE_USERS_V2';
        this.SESSION_KEY = 'STOCKVERSE_ACTIVE_SESSION_V2';
        
        this.tradingDay = 1;
        this.stocks = [];
        this.users = {};
        this.currentUsername = null;
        this.listeners = [];
        this.marketOpen = true;

        this.init();
    }

    init() {
        // 1. Load Market & Stocks State
        const savedMarket = this.loadMarketState();
        if (savedMarket) {
            this.stocks = savedMarket.stocks || JSON.parse(JSON.stringify(DEFAULT_STOCKS));
            this.tradingDay = savedMarket.tradingDay || 1;
        } else {
            this.stocks = JSON.parse(JSON.stringify(DEFAULT_STOCKS));
            this.tradingDay = 1;
        }

        // 2. Load Users Catalog
        this.loadUsers();

        // 3. Ensure Default Demo User exists
        if (!this.users['trader']) {
            this.users['trader'] = {
                username: 'trader',
                name: 'Demo Trader',
                password: '123',
                cash_balance: INITIAL_CAPITAL,
                net_worth: INITIAL_CAPITAL,
                holdings: [],
                transactions: []
            };
            this.saveUsers();
        }

        // 4. Restore Session
        const savedSession = localStorage.getItem(this.SESSION_KEY);
        if (savedSession && this.users[savedSession]) {
            this.currentUsername = savedSession;
        } else {
            // Default to 'trader' on first launch
            this.currentUsername = 'trader';
            localStorage.setItem(this.SESSION_KEY, 'trader');
        }

        this.recalculatePortfolio();
    }

    // Active User Getter
    get user() {
        if (!this.currentUsername || !this.users[this.currentUsername]) {
            return {
                username: "Guest",
                name: "Guest",
                cash_balance: 0,
                net_worth: 0,
                holdings: [],
                transactions: []
            };
        }
        return this.users[this.currentUsername];
    }

    get transactions() {
        return this.user.transactions || [];
    }

    // Authentication Methods
    login(username, password) {
        username = (username || '').trim().toLowerCase();
        password = (password || '').trim();

        if (!username) {
            return { success: false, message: 'Please enter a valid username.' };
        }
        if (!password) {
            return { success: false, message: 'Please enter your password.' };
        }

        const account = this.users[username];
        if (!account) {
            return {
                success: false,
                message: `User '${username}' does not exist. Click 'Create Account' to register!`
            };
        }

        if (account.password !== password) {
            return { success: false, message: 'Incorrect password! Please try again.' };
        }

        this.currentUsername = username;
        localStorage.setItem(this.SESSION_KEY, username);
        this.recalculatePortfolio();
        this.notify('auth_login', { user: this.user });

        return {
            success: true,
            message: `Welcome back, ${account.name || account.username}!`,
            user: this.user
        };
    }

    register(username, name, password) {
        username = (username || '').trim().toLowerCase();
        name = (name || '').trim() || username;
        password = (password || '').trim();

        if (!username || username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters long.' };
        }
        if (!password || password.length < 3) {
            return { success: false, message: 'Password must be at least 3 characters long.' };
        }

        if (this.users[username]) {
            return {
                success: false,
                message: `Username '${username}' is already taken. Please choose another or login.`
            };
        }

        // Create new account with initial ₹1,00,000 capital
        this.users[username] = {
            username: username,
            name: name,
            password: password,
            cash_balance: INITIAL_CAPITAL,
            net_worth: INITIAL_CAPITAL,
            holdings: [],
            transactions: []
        };

        this.saveUsers();
        this.currentUsername = username;
        localStorage.setItem(this.SESSION_KEY, username);
        this.recalculatePortfolio();
        this.notify('auth_register', { user: this.user });

        return {
            success: true,
            message: `Account created successfully with ₹1,00,000 virtual capital! Welcome, ${name}.`,
            user: this.user
        };
    }

    logout() {
        this.currentUsername = null;
        localStorage.removeItem(this.SESSION_KEY);
        this.notify('auth_logout', {});
    }

    isAuthenticated() {
        return !!this.currentUsername && !!this.users[this.currentUsername];
    }

    // Subscribe to state changes (UI components)
    subscribe(fn) {
        this.listeners.push(fn);
    }

    notify(eventType = 'update', payload = {}) {
        this.saveMarketState();
        this.saveUsers();
        this.listeners.forEach(fn => fn(eventType, payload));
    }

    loadMarketState() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error("Failed to load market state:", e);
            return null;
        }
    }

    saveMarketState() {
        try {
            const state = {
                stocks: this.stocks,
                tradingDay: this.tradingDay
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error("Failed to save market state:", e);
        }
    }

    loadUsers() {
        try {
            const raw = localStorage.getItem(this.USERS_KEY);
            this.users = raw ? JSON.parse(raw) : {};
        } catch (e) {
            console.error("Failed to load users:", e);
            this.users = {};
        }
    }

    saveUsers() {
        try {
            localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));
        } catch (e) {
            console.error("Failed to save users:", e);
        }
    }

    resetState(triggerNotify = true) {
        if (this.currentUsername && this.users[this.currentUsername]) {
            this.users[this.currentUsername].cash_balance = INITIAL_CAPITAL;
            this.users[this.currentUsername].net_worth = INITIAL_CAPITAL;
            this.users[this.currentUsername].holdings = [];
            this.users[this.currentUsername].transactions = [];
        }
        this.stocks = JSON.parse(JSON.stringify(DEFAULT_STOCKS));
        this.tradingDay = 1;
        this.saveMarketState();
        this.saveUsers();
        if (triggerNotify) {
            this.notify('reset', { message: 'Simulator reset to initial ₹1,00,000 capital' });
        }
    }

    getStock(symbol) {
        return this.stocks.find(s => s.symbol.toUpperCase() === symbol.toUpperCase());
    }

    getHolding(symbol) {
        if (!this.user.holdings) this.user.holdings = [];
        return this.user.holdings.find(h => h.symbol.toUpperCase() === symbol.toUpperCase());
    }

    // Core validation & Buy execution
    buyStock(symbol, quantity) {
        if (!this.isAuthenticated()) {
            return { success: false, message: "Please login to your account before trading." };
        }

        quantity = parseInt(quantity, 10);
        if (isNaN(quantity) || quantity <= 0) {
            return { success: false, message: "Please enter a valid quantity of shares (minimum 1)." };
        }

        const stock = this.getStock(symbol);
        if (!stock) {
            return { success: false, message: `Stock '${symbol}' not found in exchange catalog.` };
        }

        const currentPrice = stock.price;
        const totalCost = Number((quantity * currentPrice).toFixed(2));
        const friction = calculateTradeFriction('BUY', totalCost, 0);
        const totalDeduction = Number((totalCost + friction.totalFriction).toFixed(2));

        // Validation check: Sufficient cash balance including statutory taxes & brokerage
        if (this.user.cash_balance < totalDeduction) {
            const shortfall = totalDeduction - this.user.cash_balance;
            return {
                success: false,
                message: `Insufficient virtual funds! Required: ${formatINR(totalDeduction)} (Shares: ${formatINR(totalCost)} + Taxes/Fees: ${formatINR(friction.totalFriction)}), Available: ${formatINR(this.user.cash_balance)}. Shortfall: ${formatINR(shortfall)}.`
            };
        }

        // Deduct cash (Gross + Real friction)
        this.user.cash_balance = Number((this.user.cash_balance - totalDeduction).toFixed(2));

        // Update or insert into holdings
        let holding = this.getHolding(symbol);
        if (holding) {
            const totalExistingValue = holding.quantity * holding.average_buy_price;
            const newTotalQty = holding.quantity + quantity;
            const newAvgPrice = (totalExistingValue + totalCost) / newTotalQty;

            holding.quantity = newTotalQty;
            holding.average_buy_price = Number(newAvgPrice.toFixed(2));
        } else {
            if (!this.user.holdings) this.user.holdings = [];
            this.user.holdings.push({
                symbol: stock.symbol,
                name: stock.name,
                sector: stock.sector,
                quantity: quantity,
                average_buy_price: currentPrice
            });
        }

        // Create transaction record with friction details
        const transaction = {
            id: 'TXN-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100),
            symbol: stock.symbol,
            name: stock.name,
            type: 'BUY',
            quantity: quantity,
            price: currentPrice,
            total: totalCost,
            taxesAndBrokerage: friction.totalFriction,
            netCashImpact: totalDeduction,
            timestamp: new Date().toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            })
        };
        if (!this.user.transactions) this.user.transactions = [];
        this.user.transactions.unshift(transaction);

        this.recalculatePortfolio();
        this.notify('trade_buy', { transaction, stock });

        return {
            success: true,
            message: `Successfully purchased ${quantity} share(s) of ${stock.symbol} at ${formatINR(currentPrice)}. Taxes & Brokerage: ${formatINR(friction.totalFriction)}.`,
            transaction
        };
    }

    // Core validation & Sell execution with realistic STT, brokerage & STCG Tax
    sellStock(symbol, quantity) {
        if (!this.isAuthenticated()) {
            return { success: false, message: "Please login to your account before trading." };
        }

        quantity = parseInt(quantity, 10);
        if (isNaN(quantity) || quantity <= 0) {
            return { success: false, message: "Please enter a valid quantity of shares (minimum 1)." };
        }

        const stock = this.getStock(symbol);
        if (!stock) {
            return { success: false, message: `Stock '${symbol}' not found in exchange catalog.` };
        }

        const holding = this.getHolding(symbol);
        if (!holding || holding.quantity <= 0) {
            return { success: false, message: `You do not own any shares of ${symbol} to sell.` };
        }

        // Validation check: Sufficient holdings
        if (holding.quantity < quantity) {
            return {
                success: false,
                message: `Insufficient holdings! You only own ${holding.quantity} share(s) of ${symbol}, cannot sell ${quantity}.`
            };
        }

        const currentPrice = stock.price;
        const totalRevenue = Number((quantity * currentPrice).toFixed(2));
        const costBasis = Number((quantity * holding.average_buy_price).toFixed(2));
        const grossPnL = Number((totalRevenue - costBasis).toFixed(2));

        // Real Friction & STCG calculation (20% on profit)
        const friction = calculateTradeFriction('SELL', totalRevenue, grossPnL);
        const netCashReceived = Number((totalRevenue - friction.netDeduction).toFixed(2));
        const netRealizedPnL = Number((grossPnL - friction.netDeduction).toFixed(2));

        // Credit net cash
        this.user.cash_balance = Number((this.user.cash_balance + netCashReceived).toFixed(2));

        // Deduct quantity from holdings
        holding.quantity -= quantity;
        if (holding.quantity === 0) {
            this.user.holdings = this.user.holdings.filter(h => h.symbol.toUpperCase() !== symbol.toUpperCase());
        }

        // Log transaction
        const transaction = {
            id: 'TXN-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100),
            symbol: stock.symbol,
            name: stock.name,
            type: 'SELL',
            quantity: quantity,
            price: currentPrice,
            total: totalRevenue,
            grossPnL: grossPnL,
            taxesAndBrokerage: friction.totalFriction,
            stcgTax: friction.stcgTax,
            netRealizedPnL: netRealizedPnL,
            netCashImpact: netCashReceived,
            timestamp: new Date().toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            })
        };
        if (!this.user.transactions) this.user.transactions = [];
        this.user.transactions.unshift(transaction);

        this.recalculatePortfolio();
        this.notify('trade_sell', { transaction, stock, realizedPnL: netRealizedPnL });

        return {
            success: true,
            message: `Sold ${quantity} share(s) of ${stock.symbol}. Gross: ${formatINR(totalRevenue)} | Brokerage & STT: ${formatINR(friction.totalFriction)} | STCG Tax: ${formatINR(friction.stcgTax)} | Net in Bank: ${formatINR(netCashReceived)}.`,
            transaction
        };
    }

    // Profit & Loss calculation per stock and for overall portfolio
    calculatePortfolio() {
        if (!this.isAuthenticated()) {
            return {
                cash_balance: 0,
                total_invested: 0,
                current_portfolio_value: 0,
                net_worth: 0,
                total_pnl: 0,
                total_pnl_percent: 0,
                overall_return: 0,
                holdings: []
            };
        }

        let totalInvested = 0;
        let currentPortfolioValue = 0;
        const holdingsDetail = [];
        const userHoldings = this.user.holdings || [];

        for (const h of userHoldings) {
            const stock = this.getStock(h.symbol);
            const currentPrice = stock ? stock.price : h.average_buy_price;
            const investedVal = Number((h.quantity * h.average_buy_price).toFixed(2));
            const currentVal = Number((h.quantity * currentPrice).toFixed(2));
            const pnl = Number((currentVal - investedVal).toFixed(2));
            const pnlPercent = investedVal > 0 ? Number(((pnl / investedVal) * 100).toFixed(2)) : 0;
            const dayChange = stock ? Number(((currentPrice - stock.prevClose) * h.quantity).toFixed(2)) : 0;

            // Detect Loss Aversion / Ego bias warning: holding down > 8%
            const lossAversionWarning = pnlPercent <= -8.0;
            // Opportunity cost compared to Nifty baseline 12% annual (~0.04% per day)
            const opportunityCost = investedVal > 0 && pnl < 0 ? Math.abs(Number((pnl - (investedVal * 0.015)).toFixed(2))) : 0;

            totalInvested += investedVal;
            currentPortfolioValue += currentVal;

            holdingsDetail.push({
                symbol: h.symbol,
                name: h.name || (stock ? stock.name : h.symbol),
                sector: h.sector || (stock ? stock.sector : 'Other'),
                quantity: h.quantity,
                average_buy_price: h.average_buy_price,
                current_price: currentPrice,
                invested_value: investedVal,
                current_value: currentVal,
                pnl: pnl,
                pnl_percent: pnlPercent,
                day_change: dayChange,
                lossAversionWarning,
                opportunityCost
            });
        }

        const totalPnL = Number((currentPortfolioValue - totalInvested).toFixed(2));
        const totalPnLPercent = totalInvested > 0 ? Number(((totalPnL / totalInvested) * 100).toFixed(2)) : 0;
        const netWorth = Number((this.user.cash_balance + currentPortfolioValue).toFixed(2));
        const overallReturnOnInitial = Number((((netWorth - INITIAL_CAPITAL) / INITIAL_CAPITAL) * 100).toFixed(2));

        // Investor Discipline & Health Analysis
        const activeLossAversions = holdingsDetail.filter(h => h.lossAversionWarning);
        const maxSinglePosition = holdingsDetail.reduce((max, h) => Math.max(max, h.current_value), 0);
        const concentrationRatio = netWorth > 0 ? (maxSinglePosition / netWorth) : 0;

        let disciplineScore = 100;
        const disciplineTips = [];

        if (concentrationRatio > 0.35) {
            disciplineScore -= 25;
            disciplineTips.push(`High Concentration: A single holding occupies ${(concentrationRatio * 100).toFixed(1)}% of your net worth! Cap positions under 20% to manage downside risk.`);
        }
        if (activeLossAversions.length > 0) {
            disciplineScore -= 20;
            disciplineTips.push(`Loss Aversion Bias: You are holding ${activeLossAversions.length} position(s) with deep losses without strict stop-loss protection.`);
        }
        if (this.user.cash_balance < 5000 && holdingsDetail.length > 0) {
            disciplineScore -= 15;
            disciplineTips.push("Zero Emergency Buffer: Liquid cash reserve under ₹5,000. Maintain dry powder to buy market dips.");
        }

        return {
            cash_balance: this.user.cash_balance,
            total_invested: totalInvested,
            current_portfolio_value: currentPortfolioValue,
            net_worth: netWorth,
            total_pnl: totalPnL,
            total_pnl_percent: totalPnLPercent,
            overall_return: overallReturnOnInitial,
            holdings: holdingsDetail,
            disciplineScore: Math.max(20, disciplineScore),
            disciplineTips,
            activeLossAversions
        };
    }

    recalculatePortfolio() {
        if (this.isAuthenticated()) {
            const stats = this.calculatePortfolio();
            this.user.net_worth = stats.net_worth;
            this.saveUsers();
        }
    }

    // Daily price fluctuation simulation with realistic calibrated volatility & weekly news events (every multiple of 7 days)
    simulateMarketTick(marketSentiment = null) {
        const nextDay = this.tradingDay + 1;
        const isWeeklyMilestone = (nextDay % 7 === 0);
        let newsEvent = null;
        const weekNumber = Math.max(1, Math.floor(nextDay / 7));

        // Weekly news catalyst triggers strictly on every multiple of 7 (Day 7, 14, 21, 28, etc.)
        if (isWeeklyMilestone && typeof MARKET_NEWS_FEED !== 'undefined' && MARKET_NEWS_FEED.length > 0) {
            const idx = (weekNumber - 1) % MARKET_NEWS_FEED.length;
            newsEvent = MARKET_NEWS_FEED[idx];
        }

        let sentimentBias = 0;
        if (marketSentiment === 'bullish') sentimentBias = 0.003;
        if (marketSentiment === 'bearish') sentimentBias = -0.003;

        this.stocks.forEach(stock => {
            // Realistic large-cap daily volatility: 0.5% to 0.9% standard deviation
            const stockBeta = stock.beta || 1.0;
            const baseDailyVol = 0.007 * stockBeta; // ~0.4% (defensive) to ~0.9% (cyclical)
            
            // Random walk factor with gaussian-like distribution (sum of 3 uniforms)
            const randomWalk = ((Math.random() + Math.random() + Math.random()) / 3 - 0.5) * 2;
            
            // News specific catalyst impact (applied when weekly milestone occurs)
            let catalystImpact = 0;
            if (newsEvent && newsEvent.impact) {
                if (newsEvent.impact[stock.symbol]) {
                    catalystImpact += newsEvent.impact[stock.symbol];
                }
                if (newsEvent.impact['all']) {
                    catalystImpact += newsEvent.impact['all'];
                }
            }

            const totalDailyReturn = (randomWalk * baseDailyVol) + sentimentBias + catalystImpact;
            const oldPrice = stock.price;
            let newPrice = Number((oldPrice * (1 + totalDailyReturn)).toFixed(2));

            if (newPrice < 5) newPrice = 5.00;

            stock.prevClose = oldPrice;
            stock.price = newPrice;
            
            // Intraday high & low with realistic tight spread
            const intradayWiggle = newPrice * (0.003 + Math.random() * 0.004);
            stock.dayHigh = Number(Math.max(oldPrice, newPrice, newPrice + intradayWiggle).toFixed(2));
            stock.dayLow = Number(Math.min(oldPrice, newPrice, Math.max(5, newPrice - intradayWiggle)).toFixed(2));
            
            if (!stock.history) stock.history = [];
            stock.history.push(newPrice);
            if (stock.history.length > 30) {
                stock.history.shift();
            }

            // Fluctuate volume within natural trading ranges
            stock.volume = Math.floor(stock.volume * (0.95 + Math.random() * 0.10));
        });

        this.tradingDay += 1;
        this.recalculatePortfolio();
        
        const tickResult = {
            tradingDay: this.tradingDay,
            isWeeklyMilestone: isWeeklyMilestone,
            weekNumber: Math.max(1, Math.floor(this.tradingDay / 7)),
            sentiment: marketSentiment || (newsEvent ? newsEvent.sentiment : 'neutral'),
            news: newsEvent
        };

        this.notify('market_tick', tickResult);
        return tickResult;
    }

    // Filter and search stocks
    getFilteredStocks(searchTerm = '', sector = 'All', sortBy = 'symbol', sortAsc = true) {
        let list = [...this.stocks];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            list = list.filter(s =>
                s.symbol.toLowerCase().includes(term) ||
                s.name.toLowerCase().includes(term) ||
                s.sector.toLowerCase().includes(term)
            );
        }

        if (sector && sector !== 'All') {
            list = list.filter(s => s.sector === sector);
        }

        list.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            if (sortBy === 'changePercent') {
                valA = ((a.price - a.prevClose) / a.prevClose) * 100;
                valB = ((b.price - b.prevClose) / b.prevClose) * 100;
            } else if (sortBy === 'change') {
                valA = a.price - a.prevClose;
                valB = b.price - b.prevClose;
            }

            if (typeof valA === 'string') {
                return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            return sortAsc ? valA - valB : valB - valA;
        });

        return list;
    }

    // Get all unique sectors
    getSectors() {
        const set = new Set(this.stocks.map(s => s.sector));
        return ['All', ...Array.from(set)];
    }
}
