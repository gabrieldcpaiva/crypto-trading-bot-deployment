export class KrakenDataService {
  private baseUrl = '/api/kraken';
  
  private pairMappings: Record<string, string> = {
    'BTC': 'XXBTZUSD',
    'ETH': 'XETHZUSD',
    'XRP': 'XXRPZUSD',
    'USDT': 'USDTZUSD',
    'BNB': 'BNBUSD',
    'SOL': 'SOLUSD',
    'USDC': 'USDCUSD',
    'DOGE': 'XDGUSD'
  };

  async getTickerData(assets: string[]): Promise<Record<string, any>> {
    try {
      const tickerData: Record<string, any> = {};
      
      for (const asset of assets) {
        const pair = this.pairMappings[asset];
        if (!pair) continue;

        const response = await fetch(`${this.baseUrl}/Ticker?pair=${pair}`);
        const data = await response.json();

        if (data.error && data.error.length > 0) {
          console.error(`Kraken API error for ${asset}:`, data.error);
          continue;
        }

        if (data.result && data.result[pair]) {
          const tickerInfo = data.result[pair];
          tickerData[asset] = {
            price: parseFloat(tickerInfo.c[0]), // Last price
            volume: parseFloat(tickerInfo.v[1]), // 24h volume
            high: parseFloat(tickerInfo.h[1]), // 24h high
            low: parseFloat(tickerInfo.l[1]), // 24h low
            open: parseFloat(tickerInfo.o), // Open price
            bid: parseFloat(tickerInfo.b[0]), // Best bid
            ask: parseFloat(tickerInfo.a[0]), // Best ask
            change24h: ((parseFloat(tickerInfo.c[0]) - parseFloat(tickerInfo.o)) / parseFloat(tickerInfo.o)) * 100
          };
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return tickerData;
    } catch (error) {
      console.error('Error fetching ticker data:', error);
      return {};
    }
  }

  async getOHLCData(asset: string, interval: number = 1440): Promise<any[] | null> {
    try {
      const pair = this.pairMappings[asset];
      if (!pair) return null;

      const response = await fetch(`${this.baseUrl}/OHLC?pair=${pair}&interval=${interval}`);
      const data = await response.json();

      if (data.error && data.error.length > 0) {
        console.error(`Kraken OHLC API error for ${asset}:`, data.error);
        return null;
      }

      if (data.result && data.result[pair]) {
        return data.result[pair].map((candle: any[]) => ({
          timestamp: candle[0],
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          vwap: parseFloat(candle[5]),
          volume: parseFloat(candle[6]),
          count: candle[7]
        }));
      }

      return null;
    } catch (error) {
      console.error('Error fetching OHLC data:', error);
      return null;
    }
  }

  async getOrderBook(asset: string, count: number = 10): Promise<any | null> {
    try {
      const pair = this.pairMappings[asset];
      if (!pair) return null;

      const response = await fetch(`${this.baseUrl}/Depth?pair=${pair}&count=${count}`);
      const data = await response.json();

      if (data.error && data.error.length > 0) {
        console.error(`Kraken Depth API error for ${asset}:`, data.error);
        return null;
      }

      return data.result?.[pair] || null;
    } catch (error) {
      console.error('Error fetching order book:', error);
      return null;
    }
  }
}