import React, { useEffect, useState } from 'react';
import { KrakenDataService } from '../services/KrakenDataService';

interface TradingChartProps {
  asset: string;
  signals?: any;
}

export const TradingChart: React.FC<TradingChartProps> = ({ asset, signals }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      const service = new KrakenDataService();
      const data = await service.getOHLCData(asset);
      if (data) {
        setChartData(data.slice(-7)); // Last 7 days
      }
      setLoading(false);
    };

    fetchChartData();
  }, [asset]);

  if (loading) {
    return (
      <div className="h-64 bg-gray-700/50 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">Loading {asset} chart...</div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-64 bg-gray-700/50 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">No chart data available for {asset}</div>
      </div>
    );
  }

  // Simple ASCII-style chart representation
  const prices = chartData.map(d => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  return (
    <div className="bg-gray-700/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-lg">{asset}</h4>
        <div className="flex items-center space-x-4">
          {signals && Object.entries(signals).map(([strategy, signal]: [string, any]) => (
            signal.signal && (
              <div
                key={strategy}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  signal.signal === 'BUY'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {signal.signal}
              </div>
            )
          ))}
        </div>
      </div>

      {/* Simple price chart visualization */}
      <div className="h-32 relative">
        <div className="absolute inset-0 flex items-end space-x-1">
          {prices.map((price, index) => {
            const height = ((price - minPrice) / priceRange) * 100;
            const isUp = index > 0 && price > prices[index - 1];
            
            return (
              <div
                key={index}
                className={`flex-1 rounded-t ${
                  isUp ? 'bg-green-400' : 'bg-red-400'
                }`}
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`$${price.toFixed(2)}`}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-between text-sm text-gray-400">
        <span>${minPrice.toFixed(2)}</span>
        <span className="text-white font-semibold">
          ${prices[prices.length - 1]?.toFixed(2)}
        </span>
        <span>${maxPrice.toFixed(2)}</span>
      </div>
    </div>
  );
};