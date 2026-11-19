#ifndef STOCKVERSE_H
#define STOCKVERSE_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define MAX_STOCKS 20
#define MAX_HOLDINGS 50
#define MAX_TRANSACTIONS 500
#define HISTORY_LEN 30
#define INITIAL_CAPITAL 100000.00 // ₹1,00,000 initial virtual capital

/* 1. Stock Data Entity */
typedef struct {
    char symbol[16];
    char name[64];
    char sector[32];
    double current_price;
    double prev_close;
    double day_high;
    double day_low;
    double price_history[HISTORY_LEN];
    int history_count;
} Stock;

/* 2. Holding Entity */
typedef struct {
    char symbol[16];
    int quantity;
    double average_buy_price;
} Holding;

/* 3. User Account Entity */
typedef struct {
    char username[32];
    double cash_balance;
    double net_worth;
    Holding holdings[MAX_HOLDINGS];
    int holding_count;
} User;

/* 4. Transaction Entity */
typedef struct {
    char id[32];
    char symbol[16];
    char type[8]; // "BUY" or "SELL"
    int quantity;
    double price;
    double total;
    char timestamp[32];
} Transaction;

/* Application State Container */
typedef struct {
    User user;
    Stock stocks[MAX_STOCKS];
    int stock_count;
    Transaction transactions[MAX_TRANSACTIONS];
    int transaction_count;
    int trading_day;
} TradingSystem;

/* Function Prototypes */
void init_default_data(TradingSystem *sys);
Stock* find_stock(TradingSystem *sys, const char *symbol);
Holding* find_holding(User *user, const char *symbol);

/* Trading Engine Operations */
int buy_stock(TradingSystem *sys, const char *symbol, int quantity, char *message, size_t msg_len);
int sell_stock(TradingSystem *sys, const char *symbol, int quantity, char *message, size_t msg_len);
void calculate_profit_loss(const TradingSystem *sys, double *out_invested, double *out_portfolio_val, double *out_pnl);
void simulate_price_fluctuations(TradingSystem *sys);
void reset_system(TradingSystem *sys);

/* File I/O Persistence */
int save_data(const TradingSystem *sys, const char *filepath);
int load_data(TradingSystem *sys, const char *filepath);

#endif /* STOCKVERSE_H */
