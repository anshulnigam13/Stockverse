#include "stockverse.h"

static const char *DEFAULT_SYMBOLS[] = {
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK",
    "TATAMOTORS", "ITC", "BHARTIARTL", "SBIN", "LT"
};

static const char *DEFAULT_NAMES[] = {
    "Reliance Industries Ltd", "Tata Consultancy Services", "HDFC Bank Ltd",
    "Infosys Ltd", "ICICI Bank Ltd", "Tata Motors Ltd",
    "ITC Limited", "Bharti Airtel Ltd", "State Bank of India",
    "Larsen & Toubro Ltd"
};

static const char *DEFAULT_SECTORS[] = {
    "Energy & Conglomerate", "Information Technology", "Banking & Financials",
    "Information Technology", "Banking & Financials", "Automotive",
    "FMCG & Diversified", "Telecommunications", "Banking & Financials",
    "Infrastructure & Engineering"
};

static const double DEFAULT_PRICES[] = {
    2942.50, 4125.80, 1654.25, 1878.60, 1248.90,
    968.40, 498.75, 1685.20, 828.60, 3560.00
};

void init_default_data(TradingSystem *sys) {
    memset(sys, 0, sizeof(TradingSystem));

    // User initialization with ₹1,00,000 initial capital
    strncpy(sys->user.username, "Demo Trader", sizeof(sys->user.username) - 1);
    sys->user.cash_balance = INITIAL_CAPITAL;
    sys->user.net_worth = INITIAL_CAPITAL;
    sys->user.holding_count = 0;
    sys->trading_day = 1;
    sys->transaction_count = 0;

    // Stock catalog initialization
    sys->stock_count = 10;
    for (int i = 0; i < sys->stock_count; i++) {
        strncpy(sys->stocks[i].symbol, DEFAULT_SYMBOLS[i], sizeof(sys->stocks[i].symbol) - 1);
        strncpy(sys->stocks[i].name, DEFAULT_NAMES[i], sizeof(sys->stocks[i].name) - 1);
        strncpy(sys->stocks[i].sector, DEFAULT_SECTORS[i], sizeof(sys->stocks[i].sector) - 1);
        
        double p = DEFAULT_PRICES[i];
        sys->stocks[i].current_price = p;
        sys->stocks[i].prev_close = p * 0.99;
        sys->stocks[i].day_high = p * 1.015;
        sys->stocks[i].day_low = p * 0.985;
        sys->stocks[i].history_count = HISTORY_LEN;

        for (int h = 0; h < HISTORY_LEN; h++) {
            double drift = (h - HISTORY_LEN / 2.0) * 0.002;
            sys->stocks[i].price_history[h] = p * (0.95 + drift);
        }
        sys->stocks[i].price_history[HISTORY_LEN - 1] = p;
    }
}

Stock* find_stock(TradingSystem *sys, const char *symbol) {
    if (!sys || !symbol) return NULL;
    for (int i = 0; i < sys->stock_count; i++) {
        if (strcmp(sys->stocks[i].symbol, symbol) == 0) {
            return &sys->stocks[i];
        }
    }
    return NULL;
}

Holding* find_holding(User *user, const char *symbol) {
    if (!user || !symbol) return NULL;
    for (int i = 0; i < user->holding_count; i++) {
        if (strcmp(user->holdings[i].symbol, symbol) == 0) {
            return &user->holdings[i];
        }
    }
    return NULL;
}

int buy_stock(TradingSystem *sys, const char *symbol, int quantity, char *message, size_t msg_len) {
    if (!sys || !symbol || quantity <= 0) {
        snprintf(message, msg_len, "Invalid input parameters. Quantity must be >= 1.");
        return 0;
    }

    Stock *stk = find_stock(sys, symbol);
    if (!stk) {
        snprintf(message, msg_len, "Stock symbol '%s' not found.", symbol);
        return 0;
    }

    double total_cost = quantity * stk->current_price;

    // Validation: Sufficient virtual capital
    if (sys->user.cash_balance < total_cost) {
        snprintf(message, msg_len, "Insufficient funds! Required: Rs. %.2f, Available: Rs. %.2f",
                 total_cost, sys->user.cash_balance);
        return 0;
    }

    // Deduct cash
    sys->user.cash_balance -= total_cost;

    // Update holdings
    Holding *h = find_holding(&sys->user, symbol);
    if (h) {
        double current_total_value = h->quantity * h->average_buy_price;
        int new_qty = h->quantity + quantity;
        h->average_buy_price = (current_total_value + total_cost) / new_qty;
        h->quantity = new_qty;
    } else {
        if (sys->user.holding_count < MAX_HOLDINGS) {
            Holding *new_h = &sys->user.holdings[sys->user.holding_count++];
            strncpy(new_h->symbol, stk->symbol, sizeof(new_h->symbol) - 1);
            new_h->quantity = quantity;
            new_h->average_buy_price = stk->current_price;
        } else {
            snprintf(message, msg_len, "Max holdings limit reached.");
            sys->user.cash_balance += total_cost; // rollback
            return 0;
        }
    }

    // Record Transaction
    if (sys->transaction_count < MAX_TRANSACTIONS) {
        Transaction *t = &sys->transactions[sys->transaction_count++];
        snprintf(t->id, sizeof(t->id), "TXN-%ld", (long)time(NULL));
        strncpy(t->symbol, stk->symbol, sizeof(t->symbol) - 1);
        strncpy(t->type, "BUY", sizeof(t->type) - 1);
        t->quantity = quantity;
        t->price = stk->current_price;
        t->total = total_cost;

        time_t now = time(NULL);
        struct tm *tm_info = localtime(&now);
        strftime(t->timestamp, sizeof(t->timestamp), "%d %b %Y, %I:%M %p", tm_info);
    }

    // Recompute Net Worth
    double invested = 0, port_val = 0, pnl = 0;
    calculate_profit_loss(sys, &invested, &port_val, &pnl);
    sys->user.net_worth = sys->user.cash_balance + port_val;

    snprintf(message, msg_len, "Bought %d shares of %s at Rs. %.2f each. Total: Rs. %.2f",
             quantity, stk->symbol, stk->current_price, total_cost);
    return 1;
}

int sell_stock(TradingSystem *sys, const char *symbol, int quantity, char *message, size_t msg_len) {
    if (!sys || !symbol || quantity <= 0) {
        snprintf(message, msg_len, "Invalid input parameters. Quantity must be >= 1.");
        return 0;
    }

    Stock *stk = find_stock(sys, symbol);
    if (!stk) {
        snprintf(message, msg_len, "Stock symbol '%s' not found.", symbol);
        return 0;
    }

    Holding *h = find_holding(&sys->user, symbol);
    if (!h || h->quantity <= 0) {
        snprintf(message, msg_len, "You do not own any shares of %s.", symbol);
        return 0;
    }

    // Validation: Holdings verification
    if (h->quantity < quantity) {
        snprintf(message, msg_len, "Insufficient holdings! Owned: %d, Requested to sell: %d.",
                 h->quantity, quantity);
        return 0;
    }

    double total_revenue = quantity * stk->current_price;
    double realized_pnl = quantity * (stk->current_price - h->average_buy_price);

    // Credit cash
    sys->user.cash_balance += total_revenue;

    // Update holdings
    h->quantity -= quantity;
    if (h->quantity == 0) {
        // Shift remaining holdings to fill gap
        int idx = (int)(h - sys->user.holdings);
        for (int i = idx; i < sys->user.holding_count - 1; i++) {
            sys->user.holdings[i] = sys->user.holdings[i + 1];
        }
        sys->user.holding_count--;
    }

    // Record Transaction
    if (sys->transaction_count < MAX_TRANSACTIONS) {
        Transaction *t = &sys->transactions[sys->transaction_count++];
        snprintf(t->id, sizeof(t->id), "TXN-%ld", (long)time(NULL));
        strncpy(t->symbol, stk->symbol, sizeof(t->symbol) - 1);
        strncpy(t->type, "SELL", sizeof(t->type) - 1);
        t->quantity = quantity;
        t->price = stk->current_price;
        t->total = total_revenue;

        time_t now = time(NULL);
        struct tm *tm_info = localtime(&now);
        strftime(t->timestamp, sizeof(t->timestamp), "%d %b %Y, %I:%M %p", tm_info);
    }

    // Recompute Net Worth
    double invested = 0, port_val = 0, pnl = 0;
    calculate_profit_loss(sys, &invested, &port_val, &pnl);
    sys->user.net_worth = sys->user.cash_balance + port_val;

    snprintf(message, msg_len, "Sold %d shares of %s at Rs. %.2f each. Revenue: Rs. %.2f, P&L: Rs. %.2f",
             quantity, stk->symbol, stk->current_price, total_revenue, realized_pnl);
    return 1;
}

void calculate_profit_loss(const TradingSystem *sys, double *out_invested, double *out_portfolio_val, double *out_pnl) {
    double total_inv = 0.0;
    double current_val = 0.0;

    for (int i = 0; i < sys->user.holding_count; i++) {
        const Holding *h = &sys->user.holdings[i];
        double current_price = h->average_buy_price;

        for (int s = 0; s < sys->stock_count; s++) {
            if (strcmp(sys->stocks[s].symbol, h->symbol) == 0) {
                current_price = sys->stocks[s].current_price;
                break;
            }
        }

        total_inv += (h->quantity * h->average_buy_price);
        current_val += (h->quantity * current_price);
    }

    if (out_invested) *out_invested = total_inv;
    if (out_portfolio_val) *out_portfolio_val = current_val;
    if (out_pnl) *out_pnl = (current_val - total_inv);
}

void simulate_price_fluctuations(TradingSystem *sys) {
    if (!sys) return;
    srand((unsigned int)time(NULL));

    for (int i = 0; i < sys->stock_count; i++) {
        Stock *s = &sys->stocks[i];
        s->prev_close = s->current_price;

        // Fluctuation between -3% and +3%
        double pct_change = ((rand() % 601) - 300) / 10000.0;
        s->current_price = s->current_price * (1.0 + pct_change);

        if (s->current_price > s->day_high) s->day_high = s->current_price;
        if (s->current_price < s->day_low) s->day_low = s->current_price;

        // Shift history
        for (int h = 0; h < HISTORY_LEN - 1; h++) {
            s->price_history[h] = s->price_history[h + 1];
        }
        s->price_history[HISTORY_LEN - 1] = s->current_price;
    }

    sys->trading_day++;
    double invested = 0, port_val = 0, pnl = 0;
    calculate_profit_loss(sys, &invested, &port_val, &pnl);
    sys->user.net_worth = sys->user.cash_balance + port_val;
}

void reset_system(TradingSystem *sys) {
    init_default_data(sys);
}

int save_data(const TradingSystem *sys, const char *filepath) {
    FILE *fp = fopen(filepath, "wb");
    if (!fp) return 0;
    size_t written = fwrite(sys, sizeof(TradingSystem), 1, fp);
    fclose(fp);
    return (written == 1);
}

int load_data(TradingSystem *sys, const char *filepath) {
    FILE *fp = fopen(filepath, "rb");
    if (!fp) return 0;
    size_t read = fread(sys, sizeof(TradingSystem), 1, fp);
    fclose(fp);
    return (read == 1);
}
