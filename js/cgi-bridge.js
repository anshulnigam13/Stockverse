/**
 * Stockverse - CGI Connection Layer Bridge (CGI via XAMPP)
 * Connects the web frontend with the compiled C binary (stockverse.cgi)
 * 
 * Supports both:
 * 1. Standalone Client Simulator Mode (instant zero-configuration in any browser)
 * 2. C Backend CGI Mode (talking to /cgi-bin/stockverse.cgi on Apache / XAMPP)
 */

class CGIBridge {
    constructor(engine) {
        this.engine = engine;
        this.mode = localStorage.getItem('STOCKVERSE_MODE') || 'standalone'; // 'standalone' | 'cgi'
        this.cgiEndpoint = localStorage.getItem('STOCKVERSE_CGI_URL') || '/cgi-bin/stockverse.cgi';
        this.lastRequest = null;
        this.lastResponse = null;
        this.isConnected = false;
    }

    setMode(mode) {
        this.mode = mode;
        localStorage.setItem('STOCKVERSE_MODE', mode);
    }

    setCgiEndpoint(url) {
        this.cgiEndpoint = url;
        localStorage.setItem('STOCKVERSE_CGI_URL', url);
    }

    async testConnection() {
        if (this.mode === 'standalone') {
            return {
                connected: false,
                mode: 'standalone',
                message: 'Running in Standalone Client Mode. All business logic executes instantaneously in browser.'
            };
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${this.cgiEndpoint}?action=status`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                this.isConnected = true;
                return {
                    connected: true,
                    mode: 'cgi',
                    message: `Connected to C Backend! [${data.version || 'CGI v1.0'}]`,
                    data
                };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (err) {
            this.isConnected = false;
            return {
                connected: false,
                mode: 'cgi',
                message: `Could not reach C CGI backend at '${this.cgiEndpoint}'. Falling back to Client Engine. (${err.message})`,
                error: err
            };
        }
    }

    // Generic request executor that routes to C CGI or Fallback Local Engine
    async executeTrade(action, symbol, quantity) {
        const payload = { action, symbol, quantity };
        this.lastRequest = {
            timestamp: new Date().toLocaleTimeString(),
            url: `${this.cgiEndpoint}?action=${action}&symbol=${symbol}&qty=${quantity}`,
            payload
        };

        if (this.mode === 'cgi') {
            try {
                const response = await fetch(`${this.cgiEndpoint}?action=${action}&symbol=${encodeURIComponent(symbol)}&qty=${encodeURIComponent(quantity)}`);
                if (!response.ok) throw new Error(`Server returned ${response.status}`);
                const data = await response.json();
                this.lastResponse = {
                    timestamp: new Date().toLocaleTimeString(),
                    data
                };
                return data;
            } catch (err) {
                console.warn('CGI request failed, executing through local engine:', err);
                // Fallback to local engine
                return action === 'buy' 
                    ? this.engine.buyStock(symbol, quantity) 
                    : this.engine.sellStock(symbol, quantity);
            }
        } else {
            // Standalone client mode
            const result = (action === 'buy')
                ? this.engine.buyStock(symbol, quantity)
                : this.engine.sellStock(symbol, quantity);

            this.lastResponse = {
                timestamp: new Date().toLocaleTimeString(),
                data: result
            };
            return result;
        }
    }
}
