#include "stockverse.h"

#define DATA_FILE "stockverse_data.bin"

// URL parameter parsing helper
static void get_param(const char *query, const char *key, char *dest, size_t dest_size) {
    dest[0] = '\0';
    if (!query || !key) return;

    char search[64];
    snprintf(search, sizeof(search), "%s=", key);
    const char *start = strstr(query, search);
    if (!start) return;

    start += strlen(search);
    const char *end = strchr(start, '&');
    size_t len = end ? (size_t)(end - start) : strlen(start);

    if (len >= dest_size) len = dest_size - 1;
    strncpy(dest, start, len);
    dest[len] = '\0';
}

int main(void) {
    // Send HTTP JSON Header
    printf("Content-Type: application/json\r\n");
    printf("Access-Control-Allow-Origin: *\r\n");
    printf("Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n");
    printf("Access-Control-Allow-Headers: Content-Type\r\n\r\n");

    TradingSystem sys;
    if (!load_data(&sys, DATA_FILE)) {
        init_default_data(&sys);
        save_data(&sys, DATA_FILE);
    }

    const char *query = getenv("QUERY_STRING");
    if (!query) query = "";

    char action[32] = "";
    get_param(query, "action", action, sizeof(action));

    if (strcmp(action, "status") == 0) {
        printf("{\"success\":true,\"version\":\"Stockverse C-CGI Engine v1.0\",\"status\":\"online\",\"trading_day\":%d}\n", sys.trading_day);
        return 0;
    }

    if (strcmp(action, "get_account") == 0) {
        double invested = 0, port_val = 0, pnl = 0;
        calculate_profit_loss(&sys, &invested, &port_val, &pnl);

        printf("{\"success\":true,\"username\":\"%s\",\"cash_balance\":%.2f,\"net_worth\":%.2f,\"trading_day\":%d,\"holdings\":[",
               sys.user.username, sys.user.cash_balance, sys.user.cash_balance + port_val, sys.trading_day);

        for (int i = 0; i < sys.user.holding_count; i++) {
            Holding *h = &sys.user.holdings[i];
            Stock *stk = find_stock(&sys, h->symbol);
            double cur_p = stk ? stk->current_price : h->average_buy_price;
            printf("{\"symbol\":\"%s\",\"quantity\":%d,\"average_buy_price\":%.2f,\"current_price\":%.2f}%s",
                   h->symbol, h->quantity, h->average_buy_price, cur_p,
                   (i < sys.user.holding_count - 1) ? "," : "");
        }
        printf("]}\n");
        return 0;
    }

    if (strcmp(action, "buy") == 0 || strcmp(action, "buy_stock") == 0) {
        char symbol[16] = "";
        char qty_str[16] = "";
        get_param(query, "symbol", symbol, sizeof(symbol));
        get_param(query, "qty", qty_str, sizeof(qty_str));

        int qty = atoi(qty_str);
        char msg[256];
        int res = buy_stock(&sys, symbol, qty, msg, sizeof(msg));
        if (res) save_data(&sys, DATA_FILE);

        printf("{\"success\":%s,\"message\":\"%s\",\"cash_balance\":%.2f}\n",
               res ? "true" : "false", msg, sys.user.cash_balance);
        return 0;
    }

    if (strcmp(action, "sell") == 0 || strcmp(action, "sell_stock") == 0) {
        char symbol[16] = "";
        char qty_str[16] = "";
        get_param(query, "symbol", symbol, sizeof(symbol));
        get_param(query, "qty", qty_str, sizeof(qty_str));

        int qty = atoi(qty_str);
        char msg[256];
        int res = sell_stock(&sys, symbol, qty, msg, sizeof(msg));
        if (res) save_data(&sys, DATA_FILE);

        printf("{\"success\":%s,\"message\":\"%s\",\"cash_balance\":%.2f}\n",
               res ? "true" : "false", msg, sys.user.cash_balance);
        return 0;
    }

    if (strcmp(action, "simulate_day") == 0 || strcmp(action, "market_tick") == 0) {
        simulate_price_fluctuations(&sys);
        save_data(&sys, DATA_FILE);
        printf("{\"success\":true,\"message\":\"Simulated trading day #%d\",\"trading_day\":%d}\n",
               sys.trading_day, sys.trading_day);
        return 0;
    }

    if (strcmp(action, "reset") == 0) {
        reset_system(&sys);
        save_data(&sys, DATA_FILE);
        printf("{\"success\":true,\"message\":\"Account re-initialized to Rs. 1,00,000.00\"}\n");
        return 0;
    }

    // Default: Output system summary JSON
    printf("{\"success\":true,\"info\":\"Stockverse C Backend CGI Gateway ready.\",\"trading_day\":%d,\"cash_balance\":%.2f}\n",
           sys.trading_day, sys.user.cash_balance);

    return 0;
}
