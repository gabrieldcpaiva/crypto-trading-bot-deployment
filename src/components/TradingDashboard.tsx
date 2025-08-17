import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertCircle, Play, Square, Settings } from 'lucide-react';
import { PriceTable } from './PriceTable';
import { TradingChart } from './TradingChart';
import { PortfolioSection } from './PortfolioSection';
import { TradingBot } from '../services/TradingBot';
import { KrakenDataService } from '../services/KrakenDataService';
import { TradingStrategies } from '../services/TradingStrategies';

interface TradingDashboardProps {}

export const TradingDashboard: React.FC<TradingDashboardProps> = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState(['BTC', 'ETH', 'XRP']);
  const [marketData, setMarketData] = useState<any>({});
  const [signals, setSignals] = useState<any>({});
  const [botConfig, setBotConfig] = useState({
    strategies: ['RSI', 'Moving Average Crossover'],
    rsiOversold: 30,
    rsiOverbought: 70,
    maFast: 10,
    maSlow: 50,
    leverage: 1,
    positionSize: 10,
    boldMode: false,
    martingale: false,
    stopLoss: 5,
    takeProfit: 15,
    frequency: 5
  });

  const krakenService = new KrakenDataService();
  const strategies = new TradingStrategies();
  const tradingBot = new TradingBot();

  useEffect(() => {
    const fetchData = async () => {
      const data = await krakenService.getTickerData(selectedAssets);
      setMarketData(data);
      
      if (Object.keys(data).length > 0) {
        const generatedSignals = await strategies.generateSignals(selectedAssets, data, botConfig);
        setSignals(generatedSignals);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [selectedAssets, botConfig]);

  const toggleBot = () => {
    if (isRunning) {
      tradingBot.stop();
      setIsRunning(false);
    } else {
      tradingBot.start(botConfig);
      setIsRunning(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 border-b border-green-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Activity className="h-8 w-8 text-green-400" />
            <div>
              <h1 className="text-3xl font-bold text-green-400">⚡ BOLD CRYPTO TRADING BOT</h1>
              <p className="text-gray-400">Professional High-Risk, High-Reward Trading Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Bot Status */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              isRunning 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400' : 'bg-red-400'} ${isRunning ? 'animate-pulse' : ''}`}></div>
              <span className="font-semibold">{isRunning ? 'ACTIVE' : 'STOPPED'}</span>
            </div>
            
            {/* Bot Control */}
            <button
              onClick={toggleBot}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${
                isRunning 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-black'
              }`}
            >
              {isRunning ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {isRunning ? 'STOP BOT' : 'START BOT'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-green-400">🎯 Trading Config</h3>
              
              {/* API Keys Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold text-yellow-400">API Setup Required</span>
                </div>
                <p className="text-sm text-yellow-300">
                  Add your Kraken API credentials in the environment variables for live trading.
                </p>
              </div>

              {/* Asset Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">💰 Select Assets</label>
                <div className="grid grid-cols-2 gap-2">
                  {['BTC', 'ETH', 'XRP', 'USDT', 'BNB', 'SOL', 'USDC', 'DOGE'].map((asset) => (
                    <button
                      key={asset}
                      onClick={() => {
                        setSelectedAssets(prev => 
                          prev.includes(asset) 
                            ? prev.filter(a => a !== asset)
                            : [...prev, asset]
                        );
                      }}
                      className={`p-2 rounded-lg text-sm font-semibold transition-all ${
                        selectedAssets.includes(asset)
                          ? 'bg-green-500 text-black'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategy Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">🧠 Strategies</label>
                {['RSI', 'Moving Average Crossover', 'MACD', 'Volume Surge'].map((strategy) => (
                  <label key={strategy} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={botConfig.strategies.includes(strategy)}
                      onChange={(e) => {
                        setBotConfig(prev => ({
                          ...prev,
                          strategies: e.target.checked
                            ? [...prev.strategies, strategy]
                            : prev.strategies.filter(s => s !== strategy)
                        }));
                      }}
                      className="w-4 h-4 text-green-500"
                    />
                    <span className="text-sm">{strategy}</span>
                  </label>
                ))}
              </div>

              {/* RSI Parameters */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">RSI Levels</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">Oversold</label>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      value={botConfig.rsiOversold}
                      onChange={(e) => setBotConfig(prev => ({...prev, rsiOversold: Number(e.target.value)}))}
                      className="w-full"
                    />
                    <span className="text-xs text-green-400">{botConfig.rsiOversold}</span>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Overbought</label>
                    <input
                      type="range"
                      min="60"
                      max="90"
                      value={botConfig.rsiOverbought}
                      onChange={(e) => setBotConfig(prev => ({...prev, rsiOverbought: Number(e.target.value)}))}
                      className="w-full"
                    />
                    <span className="text-xs text-green-400">{botConfig.rsiOverbought}</span>
                  </div>
                </div>
              </div>

              {/* Risk Management */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">🎲 Risk Management</label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-400">Position Size: {botConfig.positionSize}%</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={botConfig.positionSize}
                      onChange={(e) => setBotConfig(prev => ({...prev, positionSize: Number(e.target.value)}))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Leverage: {botConfig.leverage}x</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={botConfig.leverage}
                      onChange={(e) => setBotConfig(prev => ({...prev, leverage: Number(e.target.value)}))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Bold Features */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-red-400">⚡ BOLD FEATURES</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={botConfig.boldMode}
                      onChange={(e) => setBotConfig(prev => ({...prev, boldMode: e.target.checked}))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-red-300">🔥 BOLD MODE (All-in)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={botConfig.martingale}
                      onChange={(e) => setBotConfig(prev => ({...prev, martingale: e.target.checked}))}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-red-300">💀 Martingale Recovery</span>
                  </label>
                </div>
              </div>

              {botConfig.boldMode && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                  <div className="text-red-400 font-bold text-center animate-pulse">
                    ⚡ BOLD MODE ACTIVE ⚡
                  </div>
                  <p className="text-red-300 text-xs text-center mt-1">
                    ALL-IN TRADING ENABLED
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9 space-y-6">
            {/* Market Data Table */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">📊 Live Market Data</h3>
              <PriceTable data={marketData} />
            </div>

            {/* Trading Signals */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">🎯 Active Trading Signals</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(signals).map(([asset, assetSignals]: [string, any]) => (
                  <div key={asset} className="space-y-2">
                    <h4 className="font-semibold text-lg">{asset}</h4>
                    {Object.entries(assetSignals || {}).map(([strategy, signal]: [string, any]) => (
                      <div
                        key={strategy}
                        className={`p-3 rounded-lg border ${
                          signal.signal === 'BUY'
                            ? 'bg-green-500/20 border-green-500/30 text-green-300'
                            : signal.signal === 'SELL'
                            ? 'bg-red-500/20 border-red-500/30 text-red-300'
                            : 'bg-gray-700/50 border-gray-600/30 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {signal.signal === 'BUY' && <TrendingUp className="h-4 w-4" />}
                          {signal.signal === 'SELL' && <TrendingDown className="h-4 w-4" />}
                          <span className="font-semibold text-sm">{strategy}</span>
                        </div>
                        <div className="text-xs mt-1">
                          {signal.signal || 'No Signal'}
                        </div>
                        {signal.strength > 0 && (
                          <div className="text-xs mt-1">
                            Strength: {(signal.strength * 100).toFixed(0)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-4">📈 Price Charts</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {selectedAssets.slice(0, 4).map((asset) => (
                  <TradingChart key={asset} asset={asset} signals={signals[asset]} />
                ))}
              </div>
            </div>

            {/* Portfolio Section */}
            <PortfolioSection />
          </div>
        </div>
      </div>
    </div>
  );
};