import React, { useState } from 'react';
import { Wallet, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';

export const PortfolioSection: React.FC = () => {
  const [apiConfigured, setApiConfigured] = useState(false);

  // Mock portfolio data for demonstration
  const mockPortfolio = {
    totalValue: 25750.89,
    dailyChange: 1247.32,
    dailyChangePercent: 5.09,
    positions: [
      { asset: 'BTC', amount: 0.5234, value: 18450.23, change: 3.24 },
      { asset: 'ETH', amount: 2.8934, value: 5890.45, change: -1.89 },
      { asset: 'XRP', amount: 1245.67, value: 1410.21, change: 8.45 }
    ],
    openOrders: [
      { pair: 'BTC/USD', type: 'LIMIT', side: 'BUY', amount: 0.1, price: 34500 },
      { pair: 'ETH/USD', type: 'LIMIT', side: 'SELL', amount: 0.5, price: 2100 }
    ]
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center space-x-2">
          <Wallet className="h-6 w-6 text-green-400" />
          <span>💼 Portfolio Management</span>
        </h3>
      </div>

      {!apiConfigured ? (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-yellow-400 mb-2">API Configuration Required</h4>
          <p className="text-yellow-300 mb-4">
            Add your Kraken API credentials to view live portfolio data and enable trading.
          </p>
          <div className="bg-gray-900/50 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-300 mb-2">Environment Variables:</p>
            <code className="text-green-400 text-sm">
              KRAKEN_API_KEY=your_api_key_here<br />
              KRAKEN_API_SECRET=your_api_secret_here
            </code>
          </div>
          <button
            onClick={() => setApiConfigured(true)}
            className="mt-4 px-6 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-600 transition-colors"
          >
            Simulate Portfolio (Demo)
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-300">Total Value</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${mockPortfolio.totalValue.toLocaleString()}
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-300">24h Change</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                +${mockPortfolio.dailyChange.toLocaleString()}
              </div>
              <div className="text-sm text-green-300">
                +{mockPortfolio.dailyChangePercent}%
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-300">Risk Level</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                HIGH
              </div>
              <div className="text-sm text-yellow-300">
                Bold Mode Active
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Positions */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-green-400">Current Positions</h4>
              <div className="space-y-3">
                {mockPortfolio.positions.map((position, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/30 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">{position.asset}</div>
                      <div className="text-sm text-gray-400">
                        {position.amount.toFixed(4)} {position.asset}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${position.value.toLocaleString()}</div>
                      <div className={`text-sm ${
                        position.change > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.change > 0 ? '+' : ''}{position.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Orders */}
            <div>
              <h4 className="text-lg font-semibold mb-3 text-blue-400">Open Orders</h4>
              <div className="space-y-3">
                {mockPortfolio.openOrders.map((order, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/30 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold">{order.pair}</div>
                      <div className="text-sm text-gray-400">
                        {order.type} {order.side}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{order.amount} @ ${order.price.toLocaleString()}</div>
                      <button className="text-red-400 text-sm hover:text-red-300">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
              🔄 Rebalance Portfolio
            </button>
            <button className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors">
              🎲 Monte Carlo Simulation
            </button>
            <button className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors">
              📧 Setup Alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};