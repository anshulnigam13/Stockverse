/**
 * Stockverse - Modern Virtual Stock Trading Simulator
 * Stock Market Data Definitions & Predefined Stock Catalog
 */

const INITIAL_CAPITAL = 100000.00; // ₹1,00,000 initial virtual capital

const DEFAULT_STOCKS = [
    {
        symbol: "RELIANCE",
        name: "Reliance Industries Ltd",
        sector: "Energy & Conglomerate",
        price: 2942.50,
        prevClose: 2915.00,
        dayHigh: 2965.80,
        dayLow: 2908.20,
        week52High: 3217.90,
        week52Low: 2220.30,
        volume: 4820150,
        pe: 27.4,
        marketCap: "₹19.9 Lakh Cr",
        history: [
            2780, 2795, 2810, 2805, 2830, 2820, 2845, 2860, 2850, 2875,
            2890, 2880, 2905, 2895, 2920, 2910, 2935, 2915, 2940, 2930,
            2955, 2940, 2925, 2935, 2950, 2920, 2915, 2938, 2915.00, 2942.50
        ]
    },
    {
        symbol: "TCS",
        name: "Tata Consultancy Services",
        sector: "Information Technology",
        price: 4125.80,
        prevClose: 4160.00,
        dayHigh: 4175.50,
        dayLow: 4102.30,
        week52High: 4585.00,
        week52Low: 3313.00,
        volume: 1845200,
        pe: 31.8,
        marketCap: "₹14.9 Lakh Cr",
        history: [
            3950, 3975, 4010, 3990, 4030, 4050, 4020, 4060, 4080, 4065,
            4110, 4095, 4130, 4120, 4150, 4135, 4170, 4150, 4180, 4160,
            4190, 4175, 4150, 4185, 4200, 4180, 4170, 4165, 4160.00, 4125.80
        ]
    },
    {
        symbol: "HDFCBANK",
        name: "HDFC Bank Ltd",
        sector: "Banking & Financials",
        price: 1654.25,
        prevClose: 1638.50,
        dayHigh: 1668.00,
        dayLow: 1632.10,
        week52High: 1794.00,
        week52Low: 1363.55,
        volume: 9540120,
        pe: 19.5,
        marketCap: "₹12.6 Lakh Cr",
        history: [
            1520, 1535, 1540, 1525, 1550, 1565, 1555, 1575, 1590, 1580,
            1605, 1595, 1615, 1610, 1630, 1620, 1640, 1625, 1645, 1635,
            1650, 1640, 1630, 1645, 1660, 1645, 1638, 1642, 1638.50, 1654.25
        ]
    },
    {
        symbol: "INFY",
        name: "Infosys Ltd",
        sector: "Information Technology",
        price: 1878.60,
        prevClose: 1855.00,
        dayHigh: 1892.40,
        dayLow: 1848.00,
        week52High: 1991.45,
        week52Low: 1358.35,
        volume: 3890450,
        pe: 28.2,
        marketCap: "₹7.8 Lakh Cr",
        history: [
            1710, 1725, 1740, 1730, 1755, 1770, 1760, 1785, 1800, 1790,
            1815, 1805, 1830, 1820, 1845, 1835, 1860, 1845, 1870, 1855,
            1875, 1860, 1850, 1865, 1880, 1860, 1855, 1862, 1855.00, 1878.60
        ]
    },
    {
        symbol: "ICICIBANK",
        name: "ICICI Bank Ltd",
        sector: "Banking & Financials",
        price: 1248.90,
        prevClose: 1235.20,
        dayHigh: 1259.00,
        dayLow: 1230.50,
        week52High: 1332.90,
        week52Low: 899.00,
        volume: 7420300,
        pe: 18.1,
        marketCap: "₹8.8 Lakh Cr",
        history: [
            1120, 1130, 1145, 1140, 1160, 1175, 1165, 1185, 1195, 1190,
            1210, 1205, 1225, 1215, 1235, 1225, 1245, 1230, 1250, 1240,
            1255, 1245, 1235, 1248, 1260, 1240, 1235, 1240, 1235.20, 1248.90
        ]
    },
    {
        symbol: "TATAMOTORS",
        name: "Tata Motors Ltd",
        sector: "Automotive",
        price: 968.40,
        prevClose: 982.00,
        dayHigh: 989.50,
        dayLow: 955.20,
        week52High: 1179.05,
        week52Low: 608.00,
        volume: 8120600,
        pe: 10.9,
        marketCap: "₹3.5 Lakh Cr",
        history: [
            880, 895, 910, 905, 925, 940, 930, 950, 965, 955,
            975, 965, 990, 980, 1005, 995, 1015, 1000, 1010, 995,
            1005, 990, 980, 995, 1010, 990, 985, 990, 982.00, 968.40
        ]
    },
    {
        symbol: "ITC",
        name: "ITC Limited",
        sector: "FMCG & Diversified",
        price: 498.75,
        prevClose: 494.30,
        dayHigh: 504.00,
        dayLow: 491.50,
        week52High: 528.55,
        week52Low: 399.30,
        volume: 6840100,
        pe: 29.3,
        marketCap: "₹6.2 Lakh Cr",
        history: [
            455, 460, 465, 462, 470, 475, 472, 480, 485, 482,
            488, 485, 492, 490, 495, 492, 498, 494, 501, 496,
            502, 498, 494, 499, 505, 498, 495, 497, 494.30, 498.75
        ]
    },
    {
        symbol: "BHARTIARTL",
        name: "Bharti Airtel Ltd",
        sector: "Telecommunications",
        price: 1685.20,
        prevClose: 1665.00,
        dayHigh: 1702.00,
        dayLow: 1658.00,
        week52High: 1779.00,
        week52Low: 890.10,
        volume: 4210800,
        pe: 55.4,
        marketCap: "₹9.9 Lakh Cr",
        history: [
            1480, 1500, 1515, 1510, 1535, 1550, 1540, 1565, 1580, 1575,
            1600, 1590, 1615, 1610, 1635, 1625, 1650, 1635, 1660, 1650,
            1670, 1655, 1645, 1665, 1680, 1660, 1655, 1668, 1665.00, 1685.20
        ]
    },
    {
        symbol: "SBIN",
        name: "State Bank of India",
        sector: "Banking & Financials",
        price: 828.60,
        prevClose: 835.40,
        dayHigh: 842.10,
        dayLow: 821.50,
        week52High: 912.10,
        week52Low: 555.25,
        volume: 8940200,
        pe: 10.4,
        marketCap: "₹7.4 Lakh Cr",
        history: [
            760, 770, 780, 775, 790, 800, 795, 810, 820, 815,
            830, 825, 840, 835, 850, 840, 855, 845, 858, 848,
            860, 848, 840, 852, 865, 845, 840, 842, 835.40, 828.60
        ]
    },
    {
        symbol: "LT",
        name: "Larsen & Toubro Ltd",
        sector: "Infrastructure & Engineering",
        price: 3560.00,
        prevClose: 3525.00,
        dayHigh: 3595.00,
        dayLow: 3510.50,
        week52High: 3919.90,
        week52Low: 2872.00,
        volume: 1980300,
        pe: 33.6,
        marketCap: "₹4.9 Lakh Cr",
        history: [
            3310, 3330, 3350, 3340, 3380, 3400, 3390, 3430, 3450, 3440,
            3480, 3465, 3500, 3490, 3530, 3515, 3550, 3535, 3570, 3550,
            3585, 3560, 3540, 3570, 3600, 3565, 3550, 3562, 3525.00, 3560.00
        ]
    }
];

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
