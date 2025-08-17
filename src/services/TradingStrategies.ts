export class TradingStrategies {
  
  calculateRSI(prices: number[], period: number = 14): number[] {
    if (prices.length < period + 1) return [];
    
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Calculate initial average gain and loss
    let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;

    // Calculate RSI for the first period
    let rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));

    // Calculate RSI for subsequent periods
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }

    return rsi;
  }

  calculateMovingAverage(prices: number[], period: number): number[] {
    if (prices.length < period) return [];
    
    const ma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((acc, price) => acc + price, 0);
      ma.push(sum / period);
    }
    return ma;
  }

  calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
    macd: number[];
    signal: number[];
    histogram: number[];
  } {
    const emaFast = this.calculateEMA(prices, fastPeriod);
    const emaSlow = this.calculateEMA(prices, slowPeriod);
    
    const macd: number[] = [];
    for (let i = 0; i < Math.min(emaFast.length, emaSlow.length); i++) {
      macd.push(emaFast[i] - emaSlow[i]);
    }
    
    const signal = this.calculateEMA(macd, signalPeriod);
    const histogram: number[] = [];
    
    for (let i = 0; i < Math.min(macd.length, signal.length); i++) {
      histogram.push(macd[i] - signal[i]);
    }
    
    return { macd, signal, histogram };
  }

  calculateEMA(prices: number[], period: number): number[] {
    if (prices.length < period) return [];
    
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA for the first value
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += prices[i];
    }
    ema.push(sum / period);
    
    // Calculate EMA for subsequent values
    for (let i = period; i < prices.length; i++) {
      ema.push((prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
    }
    
    return ema;
  }

  generateRSISignal(prices: number[], config: any): { signal: string | null; strength: number; details: string } {
    const rsi = this.calculateRSI(prices);
    if (rsi.length === 0) return { signal: null, strength: 0, details: 'Insufficient data' };
    
    const currentRSI = rsi[rsi.length - 1];
    
    if (currentRSI < config.rsiOversold) {
      return {
        signal: 'BUY',
        strength: (config.rsiOversold - currentRSI) / config.rsiOversold,
        details: `RSI: ${currentRSI.toFixed(2)} (Oversold)`
      };
    } else if (currentRSI > config.rsiOverbought) {
      return {
        signal: 'SELL',
        strength: (currentRSI - config.rsiOverbought) / (100 - config.rsiOverbought),
        details: `RSI: ${currentRSI.toFixed(2)} (Overbought)`
      };
    }
    
    return { signal: null, strength: 0, details: `RSI: ${currentRSI.toFixed(2)} (Neutral)` };
  }

  generateMASignal(prices: number[], config: any): { signal: string | null; strength: number; details: string } {
    const fastMA = this.calculateMovingAverage(prices, config.maFast);
    const slowMA = this.calculateMovingAverage(prices, config.maSlow);
    
    if (fastMA.length < 2 || slowMA.length < 2) {
      return { signal: null, strength: 0, details: 'Insufficient data' };
    }
    
    const currentFast = fastMA[fastMA.length - 1];
    const currentSlow = slowMA[slowMA.length - 1];
    const prevFast = fastMA[fastMA.length - 2];
    const prevSlow = slowMA[slowMA.length - 2];
    
    if (prevFast <= prevSlow && currentFast > currentSlow) {
      return {
        signal: 'BUY',
        strength: Math.min((currentFast - currentSlow) / currentSlow, 0.1) * 10,
        details: `MA Crossover: Fast(${currentFast.toFixed(2)}) > Slow(${currentSlow.toFixed(2)})`
      };
    } else if (prevFast >= prevSlow && currentFast < currentSlow) {
      return {
        signal: 'SELL',
        strength: Math.min((currentSlow - currentFast) / currentFast, 0.1) * 10,
        details: `MA Crossover: Fast(${currentFast.toFixed(2)}) < Slow(${currentSlow.toFixed(2)})`
      };
    }
    
    return { 
      signal: null, 
      strength: 0, 
      details: `MA: Fast(${currentFast.toFixed(2)}) | Slow(${currentSlow.toFixed(2)})` 
    };
  }

  generateMACDSignal(prices: number[], config: any): { signal: string | null; strength: number; details: string } {
    const { macd, signal: signalLine } = this.calculateMACD(prices);
    
    if (macd.length < 2 || signalLine.length < 2) {
      return { signal: null, strength: 0, details: 'Insufficient data' };
    }
    
    const currentMACD = macd[macd.length - 1];
    const currentSignal = signalLine[signalLine.length - 1];
    const prevMACD = macd[macd.length - 2];
    const prevSignal = signalLine[signalLine.length - 2];
    
    if (prevMACD <= prevSignal && currentMACD > currentSignal) {
      return {
        signal: 'BUY',
        strength: Math.min(Math.abs(currentMACD - currentSignal) / Math.abs(currentSignal), 1),
        details: `MACD Bullish Crossover`
      };
    } else if (prevMACD >= prevSignal && currentMACD < currentSignal) {
      return {
        signal: 'SELL',
        strength: Math.min(Math.abs(currentMACD - currentSignal) / Math.abs(currentSignal), 1),
        details: `MACD Bearish Crossover`
      };
    }
    
    return { 
      signal: null, 
      strength: 0, 
      details: `MACD: ${currentMACD.toFixed(6)} | Signal: ${currentSignal.toFixed(6)}` 
    };
  }

  generateVolumeSignal(ohlcData: any[], config: any): { signal: string | null; strength: number; details: string } {
    if (ohlcData.length < 20) {
      return { signal: null, strength: 0, details: 'Insufficient data' };
    }
    
    const volumes = ohlcData.map(d => d.volume);
    const avgVolume = volumes.slice(-20, -1).reduce((sum, vol) => sum + vol, 0) / 19;
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / avgVolume;
    
    if (volumeRatio > 1.5) {
      // Volume surge detected - follow price direction
      const currentPrice = ohlcData[ohlcData.length - 1].close;
      const prevPrice = ohlcData[ohlcData.length - 2].close;
      const priceChange = (currentPrice - prevPrice) / prevPrice;
      
      const signal = priceChange > 0 ? 'BUY' : 'SELL';
      return {
        signal,
        strength: Math.min((volumeRatio - 1) / 1.5, 1),
        details: `Volume Surge: ${volumeRatio.toFixed(2)}x average`
      };
    }
    
    return { 
      signal: null, 
      strength: 0, 
      details: `Volume: ${volumeRatio.toFixed(2)}x average (Normal)` 
    };
  }

  async generateSignals(assets: string[], marketData: any, config: any): Promise<Record<string, any>> {
    const signals: Record<string, any> = {};
    
    for (const asset of assets) {
      if (!marketData[asset]) continue;
      
      const assetSignals: any = {};
      
      // Generate mock price history for strategies (in real implementation, fetch actual OHLC data)
      const mockPrices = this.generateMockPrices(marketData[asset].price, 50);
      const mockOHLC = this.generateMockOHLC(marketData[asset], 20);
      
      // Generate signals based on selected strategies
      if (config.strategies.includes('RSI')) {
        assetSignals.RSI = this.generateRSISignal(mockPrices, config);
      }
      
      if (config.strategies.includes('Moving Average Crossover')) {
        assetSignals.MA = this.generateMASignal(mockPrices, config);
      }
      
      if (config.strategies.includes('MACD')) {
        assetSignals.MACD = this.generateMACDSignal(mockPrices, config);
      }
      
      if (config.strategies.includes('Volume Surge')) {
        assetSignals.Volume = this.generateVolumeSignal(mockOHLC, config);
      }
      
      signals[asset] = assetSignals;
    }
    
    return signals;
  }

  private generateMockPrices(currentPrice: number, count: number): number[] {
    const prices: number[] = [];
    let price = currentPrice * 0.95; // Start 5% below current
    
    for (let i = 0; i < count; i++) {
      const change = (Math.random() - 0.5) * 0.02; // ±1% random change
      price *= (1 + change);
      prices.push(price);
    }
    
    // Ensure the last price is close to current
    prices[prices.length - 1] = currentPrice;
    return prices;
  }

  private generateMockOHLC(marketData: any, count: number): any[] {
    const ohlc: any[] = [];
    let basePrice = marketData.price * 0.98;
    
    for (let i = 0; i < count; i++) {
      const change = (Math.random() - 0.5) * 0.03; // ±1.5% change
      const open = basePrice;
      const close = basePrice * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = marketData.volume * (0.5 + Math.random());
      
      ohlc.push({ open, high, low, close, volume });
      basePrice = close;
    }
    
    return ohlc;
  }
}