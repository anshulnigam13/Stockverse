# 📈 Stockverse — Modern Virtual Stock Trading Simulator & Quantitative Platform

[![Architecture](https://img.shields.io/badge/Architecture-3--Tier%20CGI%20Client--Server-indigo.svg)](#system-architecture)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20ES6+%20%7C%20Canvas%202D-blue.svg)](#technology-stack)
[![Backend](https://img.shields.io/badge/Backend-Compiled%20ANSI%20C%20(GCC)-emerald.svg)](#technology-stack)
[![Tax Compliance](https://img.shields.io/badge/Regulatory-SEBI%20%26%20Indian%20Tax%20Friction-amber.svg)](#regulatory-indian-tax-friction)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](#license)

**Stockverse** is an institutional-grade virtual financial stock trading simulator combining a native compiled **C language backend** for high-performance business logic, trade execution, and regulatory math with an ultra-modern, obsidian-themed **web frontend (HTML5 / CSS3 / ES6 JavaScript / Canvas 2D)** connected via **Apache HTTP Server and Common Gateway Interface (CGI)**.

---

## 🌟 Key Highlights & Features

### 1. 💼 Virtual Capital & Zero-Risk Execution
- Every registered trader receives **₹1,00,000.00** in starting virtual cash.
- Realistic portfolio management with zero risk to personal capital.

### 2. 🏛️ Three-Tier Client-Server Architecture
- **Tier 1 (Presentation Layer)**: Responsive Single Page Application (SPA) built with Vanilla ES6 JavaScript, CSS3 Glassmorphism, and HTML5 Canvas 2D.
- **Tier 2 (Gateway Layer)**: Apache 2.4 HTTP Server with `mod_cgi` module routing requests to `/cgi-bin/stockverse.cgi`.
- **Tier 3 (Compiled Computational Kernel)**: Pure ANSI C binary (`stockverse.c`, `cgi_handler.c`) executing trades, tax computations, and JSON output with sub-5ms latency.

### 3. ⚖️ Realistic Indian Regulatory Taxation & Trading Friction
- **Securities Transaction Tax (STT)**: Statutory 0.1% levy on gross delivery turnover.
- **Equity Brokerage**: Capped at min(₹20, 0.05% of trade value).
- **Exchange & SEBI Turnover Fees**: 0.0035% regulatory transaction fee.
- **Goods & Services Tax (GST)**: 18% statutory tax on brokerage and exchange fees.
- **Short-Term Capital Gains Tax (STCG)**: 20% statutory deduction on positive realized net capital gains upon selling.

### 4. 🧠 Behavioral Finance & Investor Discipline Engine
- **100-Point Investor Discipline Score**: Evaluates risk management, portfolio balance, and trading frequency.
- **Position Sizing Guardrails**: High-contrast amber alert warns against deploying >20% of net worth into a single equity.
- **Loss Aversion "Ego Trap" Detection**: Identifies sunken paper losses (>8%) and calculates the opportunity cost against sovereign risk-free treasury yields.

### 5. 📰 Macroeconomic News & 7-Day Milestone Cycles
- Eliminates erratic 4-second price twitching.
- **Weekly Market News Catalysts**: Major economic events trigger exclusively on multiples of 7 trading days (Day 7, Day 14, Day 21, etc.).
- **Sectoral Impact Matrix**: Economic news applies targeted tailwinds or headwinds (e.g., RBI rate holds positively impacting Banking by +0.4% to +0.6%).
- Dedicated **Market Insights** portal with chronological news cards and sentiment badges (Bullish 🚀, Bearish 📉, Neutral 📊).

### 6. 📊 Institutional Charts & Authentic Corporate Branding
- **Trigonometric Asset Donut Chart**: Polar coordinate cursor tracking with millimeter-accurate segment expansion.
- **Dynamic Center Cutout**: Transitions dynamically on hover to show stock ticker, valuation, and percentage allocation.
- **Authentic Brand Identity**: Real corporate hex palettes (Reliance Navy `#0A4BB3`, Bharti Airtel Red `#E40000`, SBI Cyan `#00A3E0`, Tata Motors Blue `#005696`, ITC Gold `#B38029`, TCS Sky `#0072C6`, Infosys Azure `#007CC3`).
- **Live IST Market Clock**: Synchronized real-time clock with animated market session status indicator (Open: 9:15 AM - 3:30 PM IST).

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Presentation Layer              │
│        (HTML5 + CSS3 + Vanilla JavaScript ES6 + Canvas)      │
│     Dashboard • Watchlist • Trade Dock • Portfolio • News   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP Request (GET/POST)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Connection Bridge Layer (CGI)              │
│           Apache Web Server / XAMPP (cgi-bin/stockverse.cgi)│
│       Parses QUERY_STRING / POST body ──► Returns JSON      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Compiled C Business Logic (gcc)             │
│   Validation • Trading Engine • Tax Math • State Hashing    │
│     (User, Stock, Holding, Transaction Structs + File I/O)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Directory Structure

```
Stockverse/
├── index.html               # Main modern single-page trading interface
├── README.md                # Comprehensive documentation
├── .gitignore               # Standard Git ignore rules
├── start_stockverse.bat     # One-click desktop launcher
├── css/
│   └── style.css            # Modern fintech design system, dark glassmorphism
├── js/
│   ├── data.js              # Stock catalog, brand colors, tax friction algorithms
│   ├── engine.js            # Client simulation engine, behavioral discipline model
│   ├── charts.js            # Zero-dependency SVG sparklines & Canvas price charts
│   ├── cgi-bridge.js        # CGI adapter connecting frontend to compiled C backend
│   └── app.js               # Main UI controller, view router, modal handlers
├── backend/
│   ├── stockverse.h         # C header: Typed Structs (Stock, User, Holding, Transaction)
│   ├── stockverse.c         # Pure C business logic: buy, sell, tax calculations, file I/O
│   ├── cgi_handler.c        # CGI entry point: parses HTTP query/stdin & streams JSON
│   ├── compile.bat          # Windows GCC compilation batch script
│   └── Makefile             # Cross-platform Makefile for GCC compilation
├── images/                  # UI showcase screenshots and architectural figures
│   ├── m4_dashboard_donut_brand_avatars.png
│   ├── m4_market_insights_weekly_news.png
│   ├── m4_sell_pnl_tax_friction_modal.png
│   ├── m4_stocks_watchlist_brand_colors.png
│   ├── screenshot_dashboard.png
│   ├── screenshot_market.png
│   ├── screenshot_order_modal.png
│   ├── screenshot_portfolio.png
│   └── screenshot_transactions.png
├── Milestone_3_Frontend_Design_and_Architecture.docx
└── Milestone_4_Full_Stack_Integration_and_Backend_Architecture.docx
```

---

## 🚀 How to Run

### Option 1: Instant Standalone Launch (Zero Setup)
1. Double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Safari).
2. The application operates immediately with full client-side state, trading engine, canvas charts, and tax calculations!

### Option 2: Apache HTTP Server + C CGI Backend (Full 3-Tier Production Mode)
1. Install Apache HTTP Server (e.g., via XAMPP).
2. Compile the C backend:
   ```bash
   cd backend
   gcc -O2 -o stockverse.cgi stockverse.c cgi_handler.c
   ```
3. Copy `stockverse.cgi` into Apache's `cgi-bin/` directory.
4. Copy the project root into Apache's `htdocs/stockverse/` directory.
5. Open your browser and navigate to:
   ```
   http://localhost/stockverse/
   ```

---

## 📑 Academic Milestone Reports

- **Milestone 3**: `Milestone_3_Frontend_Design_and_Architecture.docx` — Complete UI design specifications, dark obsidian glassmorphism, responsive viewports, and canvas charting architecture.
- **Milestone 4**: `Milestone_4_Full_Stack_Integration_and_Backend_Architecture.docx` — 3-Tier Client-Server architecture, compiled C CGI engine, Indian statutory tax formulas, behavioral psychology modeling, and 13-point QA test matrix.

---

## 📄 License
This project is licensed under the MIT License — open for academic evaluation, research, and educational development.
