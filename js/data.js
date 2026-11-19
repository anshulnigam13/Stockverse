/**
 * Stockverse - Modern Virtual Stock Trading Simulator
 * Predefined Stock Catalog with Realistic Beta, Fundamentals & Quarterly Results
 */

const INITIAL_CAPITAL = 100000.00; // ₹1,00,000 initial virtual capital

const DEFAULT_STOCKS = [
    {
        symbol: "RELIANCE",
        name: "Reliance Industries Ltd",
        sector: "Energy & Conglomerate",
        price: 2942.50,
        prevClose: 2935.00,
        dayHigh: 2955.00,
        dayLow: 2930.20,
        week52High: 3217.90,
        week52Low: 2220.30,
        volume: 4820150,
        pe: 27.4,
        industryPe: 25.1,
        marketCap: "₹19.9 Lakh Cr",
        debtToEquity: 0.38,
        earningsGrowth: "+11.4%",
        quarterlyStatus: "Q2 Net Profit +11.4% YoY; Retail & Jio subscriber growth strong.",
        beta: 0.95,
        brandColor: "#0a4bb3",
        brandColorBg: "rgba(10, 75, 179, 0.22)",
        brandColorBorder: "#2563eb",
        history: [
            2880, 2895, 2905, 2895, 2910, 2900, 2920, 2915, 2930, 2925,
            2940, 2935, 2920, 2930, 2945, 2935, 2940, 2925, 2938, 2942.50
        ]
    },
    {
        symbol: "TCS",
        name: "Tata Consultancy Services",
        sector: "Information Technology",
        price: 4125.80,
        prevClose: 4118.00,
        dayHigh: 4145.00,
        dayLow: 4105.30,
        week52High: 4585.00,
        week52Low: 3313.00,
        volume: 1845200,
        pe: 31.8,
        industryPe: 29.5,
        marketCap: "₹14.9 Lakh Cr",
        debtToEquity: 0.05,
        earningsGrowth: "+6.8%",
        quarterlyStatus: "Q2 Operating margin at 26%; Deal total contract value at $8.6B.",
        beta: 0.75,
        brandColor: "#0072c6",
        brandColorBg: "rgba(0, 114, 198, 0.22)",
        brandColorBorder: "#38bdf8",
        history: [
            4080, 4095, 4110, 4100, 4125, 4115, 4130, 4120, 4140, 4130,
            4120, 4135, 4125, 4140, 4150, 4135, 4130, 4125, 4118.00, 4125.80
        ]
    },
    {
        symbol: "HDFCBANK",
        name: "HDFC Bank Ltd",
        sector: "Banking & Financials",
        price: 1654.25,
        prevClose: 1648.50,
        dayHigh: 1662.00,
        dayLow: 1645.10,
        week52High: 1794.00,
        week52Low: 1363.55,
        volume: 9540120,
        pe: 19.5,
        industryPe: 18.2,
        marketCap: "₹12.6 Lakh Cr",
        debtToEquity: 1.15,
        earningsGrowth: "+15.3%",
        quarterlyStatus: "Q2 NII up 10%; Net NPA improves to 0.33%; loan book up 7%.",
        beta: 0.85,
        brandColor: "#004c8f",
        brandColorBg: "rgba(0, 76, 143, 0.25)",
        brandColorBorder: "#ef4444",
        history: [
            1610, 1618, 1625, 1620, 1635, 1630, 1642, 1638, 1645, 1640,
            1652, 1648, 1642, 1648, 1655, 1648, 1650, 1645, 1648.50, 1654.25
        ]
    },
    {
        symbol: "INFY",
        name: "Infosys Ltd",
        sector: "Information Technology",
        price: 1878.60,
        prevClose: 1870.00,
        dayHigh: 1888.40,
        dayLow: 1865.00,
        week52High: 1991.45,
        week52Low: 1358.35,
        volume: 3890450,
        pe: 28.2,
        industryPe: 29.5,
        marketCap: "₹7.8 Lakh Cr",
        debtToEquity: 0.08,
        earningsGrowth: "+4.7%",
        quarterlyStatus: "Q2 Revenue guidance revised upwards to 3.75-4.50% in constant currency.",
        beta: 0.90,
        brandColor: "#007cc3",
        brandColorBg: "rgba(0, 124, 195, 0.22)",
        brandColorBorder: "#60a5fa",
        history: [
            1830, 1840, 1848, 1842, 1855, 1850, 1862, 1858, 1868, 1860,
            1872, 1868, 1860, 1868, 1875, 1868, 1872, 1868, 1870.00, 1878.60
        ]
    },
    {
        symbol: "ICICIBANK",
        name: "ICICI Bank Ltd",
        sector: "Banking & Financials",
        price: 1248.90,
        prevClose: 1242.00,
        dayHigh: 1255.00,
        dayLow: 1238.50,
        week52High: 1332.90,
        week52Low: 899.00,
        volume: 7420300,
        pe: 18.1,
        industryPe: 18.2,
        marketCap: "₹8.8 Lakh Cr",
        debtToEquity: 0.98,
        earningsGrowth: "+14.5%",
        quarterlyStatus: "Q2 PAT up 14.5% YoY; Return on Assets healthy at 2.36%.",
        beta: 0.90,
        brandColor: "#b8232f",
        brandColorBg: "rgba(184, 35, 47, 0.22)",
        brandColorBorder: "#f87171",
        history: [
            1210, 1218, 1225, 1220, 1232, 1228, 1238, 1235, 1242, 1238,
            1245, 1240, 1236, 1242, 1248, 1242, 1245, 1240, 1242.00, 1248.90
        ]
    },
    {
        symbol: "TATAMOTORS",
        name: "Tata Motors Ltd",
        sector: "Automotive",
        price: 968.40,
        prevClose: 962.00,
        dayHigh: 978.50,
        dayLow: 955.20,
        week52High: 1179.05,
        week52Low: 608.00,
        volume: 8120600,
        pe: 10.9,
        industryPe: 22.4,
        marketCap: "₹3.5 Lakh Cr",
        debtToEquity: 0.62,
        earningsGrowth: "+73.8%",
        quarterlyStatus: "Q2 JLR wholesale volumes up 8%; domestic commercial vehicle margins improve.",
        beta: 1.25,
        brandColor: "#005696",
        brandColorBg: "rgba(0, 86, 150, 0.22)",
        brandColorBorder: "#38bdf8",
        history: [
            940, 952, 945, 958, 965, 955, 970, 962, 955, 968,
            975, 965, 958, 968, 974, 965, 970, 960, 962.00, 968.40
        ]
    },
    {
        symbol: "ITC",
        name: "ITC Limited",
        sector: "FMCG & Diversified",
        price: 498.75,
        prevClose: 497.00,
        dayHigh: 502.00,
        dayLow: 495.50,
        week52High: 528.55,
        week52Low: 399.30,
        volume: 6840100,
        pe: 29.3,
        industryPe: 38.6,
        marketCap: "₹6.2 Lakh Cr",
        debtToEquity: 0.01,
        earningsGrowth: "+3.1%",
        quarterlyStatus: "Q2 Cigarette volume growth stable at 3%; Hotels demerger on track.",
        beta: 0.60,
        brandColor: "#b38029",
        brandColorBg: "rgba(179, 128, 41, 0.22)",
        brandColorBorder: "#fbbf24",
        history: [
            490, 492, 494, 493, 495, 494, 496, 495, 497, 496,
            498, 497, 496, 497, 499, 498, 497, 498, 497.00, 498.75
        ]
    },
    {
        symbol: "BHARTIARTL",
        name: "Bharti Airtel Ltd",
        sector: "Telecommunications",
        price: 1685.20,
        prevClose: 1675.00,
        dayHigh: 1696.00,
        dayLow: 1670.00,
        week52High: 1779.00,
        week52Low: 890.10,
        volume: 4210800,
        pe: 55.4,
        industryPe: 34.0,
        marketCap: "₹9.9 Lakh Cr",
        debtToEquity: 1.85,
        earningsGrowth: "+168.0%",
        quarterlyStatus: "Q2 ARPU rises to ₹233 per month post tariff hike; 5G customer base hits 105M.",
        beta: 0.80,
        brandColor: "#e40000",
        brandColorBg: "rgba(228, 0, 0, 0.22)",
        brandColorBorder: "#ff4d4d",
        history: [
            1640, 1650, 1658, 1652, 1665, 1660, 1672, 1668, 1675, 1670,
            1682, 1678, 1672, 1678, 1686, 1678, 1682, 1675, 1675.00, 1685.20
        ]
    },
    {
        symbol: "SBIN",
        name: "State Bank of India",
        sector: "Banking & Financials",
        price: 828.60,
        prevClose: 824.00,
        dayHigh: 836.10,
        dayLow: 821.50,
        week52High: 912.10,
        week52Low: 555.25,
        volume: 8940200,
        pe: 10.4,
        industryPe: 18.2,
        marketCap: "₹7.4 Lakh Cr",
        debtToEquity: 1.45,
        earningsGrowth: "+28.0%",
        quarterlyStatus: "Q2 Net Profit surpasses ₹18,331 Cr; Gross NPA drops to multi-year low of 2.13%.",
        beta: 1.10,
        brandColor: "#00a3e0",
        brandColorBg: "rgba(0, 163, 224, 0.22)",
        brandColorBorder: "#38bdf8",
        history: [
            805, 812, 818, 814, 822, 818, 826, 822, 830, 825,
            832, 828, 822, 828, 834, 828, 830, 824, 824.00, 828.60
        ]
    },
    {
        symbol: "LT",
        name: "Larsen & Toubro Ltd",
        sector: "Infrastructure & Engineering",
        price: 3560.00,
        prevClose: 3545.00,
        dayHigh: 3585.00,
        dayLow: 3530.50,
        week52High: 3919.90,
        week52Low: 2872.00,
        volume: 1980300,
        pe: 33.6,
        industryPe: 30.1,
        marketCap: "₹4.9 Lakh Cr",
        debtToEquity: 0.88,
        earningsGrowth: "+5.4%",
        quarterlyStatus: "Q2 Order book reaches record ₹5.1 Lakh Cr; international projects constitute 38%.",
        beta: 1.00,
        brandColor: "#e69500",
        brandColorBg: "rgba(230, 149, 0, 0.22)",
        brandColorBorder: "#f59e0b",
        history: [
            3480, 3495, 3510, 3500, 3525, 3515, 3535, 3528, 3545, 3538,
            3552, 3545, 3535, 3545, 3560, 3550, 3555, 3545, 3545.00, 3560.00
        ]
    }
];

// Realistic Market Catalysts / News Engine
const MARKET_NEWS_FEED = [
    {
        week: 1,
        headline: "Week 1: RBI Monetary Policy — Repo rate steady at 6.50%; growth outlook stays buoyant.",
        desc: "The Reserve Bank maintained its accommodative stance. Banks rally as credit growth outlook improves, especially for HDFC Bank, ICICI Bank and SBI.",
        impact: { all: 0.002, HDFCBANK: 0.004, ICICIBANK: 0.005, SBIN: 0.006 },
        sentiment: "bullish"
    },
    {
        week: 2,
        headline: "Week 2: Global IT Spending Review — US enterprises optimize cloud spends; cautious deal pipelines.",
        desc: "Slower discretionary spending hits Indian IT outsourcers. TCS and Infosys may see near-term margin pressure as deal ramp-ups delay.",
        impact: { TCS: -0.006, INFY: -0.007 },
        sentiment: "bearish"
    },
    {
        week: 3,
        headline: "Week 3: Crude Oil — Brent trades steady at $73/barrel; downstream margin boost expected.",
        desc: "Stable crude benefits Reliance's petrochemical margins. Auto sector also gains from lower input costs driving vehicle price stability.",
        impact: { RELIANCE: 0.007, TATAMOTORS: 0.004 },
        sentiment: "bullish"
    },
    {
        week: 4,
        headline: "Week 4: Monsoon Impact — FMCG rural volume indicators firm up after above-normal rainfall.",
        desc: "Rural demand recovery is visible across FMCG and auto dealerships. ITC's agri-business division benefits from strong Kharif output.",
        impact: { ITC: 0.006, TATAMOTORS: 0.004 },
        sentiment: "bullish"
    },
    {
        week: 5,
        headline: "Week 5: Infrastructure Push — Govt greenlights major port & highway expansion packages.",
        desc: "Order book visibility improves for L&T. SBI benefits from infrastructure lending pipeline. Construction and capital goods sectors rally.",
        impact: { LT: 0.009, SBIN: 0.004 },
        sentiment: "bullish"
    },
    {
        week: 6,
        headline: "Week 6: Telecom ARPU Expansion — Postpaid subscriber additions surge across carriers.",
        desc: "Bharti Airtel leads ARPU uplift cycle. Jio's 5G monetization showing early traction. Sector re-rating expected over next 2 quarters.",
        impact: { BHARTIARTL: 0.008, RELIANCE: 0.003 },
        sentiment: "bullish"
    },
    {
        week: 7,
        headline: "Week 7: FII Outflow Alert — Foreign investors book profits after consecutive accumulation weeks.",
        desc: "Short-term pressure on large-caps as FIIs reduce exposure. HDFC Bank and Reliance see selling. Domestic institutions absorb partial flows.",
        impact: { all: -0.003, HDFCBANK: -0.004, RELIANCE: -0.004 },
        sentiment: "bearish"
    },
    {
        week: 8,
        headline: "Week 8: Auto Sector Festive Season — Channel checks show strong retail demand for SUVs & EVs.",
        desc: "Tata Motors records best-ever monthly dispatches. EV penetration crosses 6% mark. Festive discounts drive volume but margins stay healthy.",
        impact: { TATAMOTORS: 0.008 },
        sentiment: "bullish"
    }
];

// Friction & Tax Calculation Helper (Real Indian Market Regulations)
function calculateTradeFriction(orderType, totalAmount, grossPnL = 0) {
    // Standard Indian Equity Delivery Rates:
    // Brokerage: ₹20 flat or 0.05% (whichever is lower)
    const brokerage = Math.min(20, Number((totalAmount * 0.0005).toFixed(2)));
    
    // STT (Securities Transaction Tax): 0.1% on Buy & Sell for delivery
    const stt = Number((totalAmount * 0.001).toFixed(2));
    
    // Exchange Turnover Charges (~0.00345%) + SEBI turnover fee (~0.0001%) + Stamp Duty (~0.003%)
    const exchangeAndGovtCharges = Number((totalAmount * 0.000065).toFixed(2));
    
    // GST @ 18% on (Brokerage + Exchange Charges)
    const gst = Number(((brokerage + exchangeAndGovtCharges) * 0.18).toFixed(2));
    
    const totalFriction = Number((brokerage + stt + exchangeAndGovtCharges + gst).toFixed(2));

    // STCG Tax (Short-Term Capital Gains Tax @ 20% under updated Indian Budget rules on positive realized gains)
    let stcgTax = 0;
    if (orderType === 'SELL' && grossPnL > 0) {
        stcgTax = Number((grossPnL * 0.20).toFixed(2));
    }

    return {
        brokerage,
        stt,
        exchangeAndGovtCharges,
        gst,
        totalFriction,
        stcgTax,
        netDeduction: Number((totalFriction + stcgTax).toFixed(2))
    };
}

// Helper to format Indian currency: ₹1,00,000.00
function formatINR(amount, includeSymbol = true) {
    if (isNaN(amount) || amount === null || amount === undefined) {
        amount = 0;
    }
    const isNegative = amount < 0;
    const absVal = Math.abs(amount).toFixed(2);
    const [intPart, decPart] = absVal.split(".");
    
    let lastThree = intPart.substring(intPart.length - 3);
    const otherNumbers = intPart.substring(0, intPart.length - 3);
    if (otherNumbers !== "") {
        lastThree = "," + lastThree;
    }
    const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
    const formatted = `${formattedInt}.${decPart}`;
    
    const sign = isNegative ? "-" : "";
    return includeSymbol ? `${sign}₹${formatted}` : `${sign}${formatted}`;
}

// Helper to format percentage: +2.45% or -1.12%
function formatPercent(pct) {
    if (isNaN(pct) || pct === null || pct === undefined) {
        pct = 0;
    }
    const sign = pct > 0 ? "+" : "";
    return `${sign}${pct.toFixed(2)}%`;
}
