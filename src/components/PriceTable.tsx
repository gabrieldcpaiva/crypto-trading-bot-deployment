import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceTableProps {
  data: Record<string, any>;
}

export const PriceTable: React.FC<PriceTableProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading market data...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-300 font-semibold">Asset</th>
            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Price</th>
            <th className="text-right py-3 px-4 text-gray-300 font-semibold">24h Change</th>
            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Volume</th>
            <th className="text-right py-3 px-4 text-gray-300 font-semibold">High</th>
            <th className="text-right py-3 px-4 text-gray-300 font-semibold">Low</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([asset, info]: [string, any]) => {
            const change = info.change24h || 0;
            const isPositive = change > 0;
            
            return (
              <tr key={asset} className="border-b border-gray-800 hover:bg-gray-700/30 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
                      {asset.slice(0, 2)}
                    </div>
                    <span className="font-semibold text-white">{asset}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-white font-mono text-lg">
                    ${info.price?.toFixed(2) || '0.00'}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className={`flex items-center justify-end space-x-1 ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-semibold">
                      {isPositive ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right text-gray-300 font-mono">
                  {info.volume?.toLocaleString() || '0'}
                </td>
                <td className="py-4 px-4 text-right text-gray-300 font-mono">
                  ${info.high?.toFixed(2) || '0.00'}
                </td>
                <td className="py-4 px-4 text-right text-gray-300 font-mono">
                  ${info.low?.toFixed(2) || '0.00'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};