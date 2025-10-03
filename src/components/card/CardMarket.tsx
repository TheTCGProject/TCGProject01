import React from 'react';
import { TrendingUp, ExternalLink } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CardMarketProps {
  card: any;
}

const CardMarket: React.FC<CardMarketProps> = ({ card }) => {
  // Mock price history data for the last 12 months
  const priceHistory = [
    { month: 'Jul 2024', price: 2.10 },
    { month: 'Aug 2024', price: 2.35 },
    { month: 'Sep 2024', price: 2.80 },
    { month: 'Oct 2024', price: 3.15 },
    { month: 'Nov 2024', price: 2.95 },
    { month: 'Dec 2024', price: 3.40 },
    { month: 'Jan 2025', price: 3.75 },
    { month: 'Feb 2025', price: 4.20 },
    { month: 'Mar 2025', price: 3.90 },
    { month: 'Apr 2025', price: 4.50 },
    { month: 'May 2025', price: 4.85 },
    { month: 'Jun 2025', price: 5.20 },
  ];

  // Calculate max price for chart scaling
  const maxPrice = Math.max(...priceHistory.map(p => p.price));
  const minPrice = Math.min(...priceHistory.map(p => p.price));
  const priceRange = maxPrice - minPrice;

  // Buy now links
  const buyNowLinks = [
    {
      name: 'TCGPlayer',
      url: `https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(card?.name || '')}`,
      logo: '🃏',
      description: 'Largest TCG marketplace',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'eBay',
      url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card?.name || '')}+pokemon+card`,
      logo: '🛒',
      description: 'Global marketplace',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      name: 'CardMarket',
      url: `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(card?.name || '')}`,
      logo: '💳',
      description: 'European card market',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current Market Price */}
      <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Current Market Price</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {card.tcgplayer?.prices && Object.entries(card.tcgplayer.prices).map(([variant, prices]) => (
            <div key={variant} className="bg-white dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-medium text-slate-900 dark:text-white capitalize mb-2">
                {variant.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Market:</span>
                  <span className="font-medium text-success-600 dark:text-success-400">
                    ${prices.market?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Low:</span>
                  <span className="text-slate-900 dark:text-white">
                    ${prices.low?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">High:</span>
                  <span className="text-slate-900 dark:text-white">
                    ${prices.high?.toFixed(2) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Price History (Last 12 Months)
        </h3>
        
        <div className="relative h-64 bg-white dark:bg-slate-800 rounded-lg p-4">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 dark:text-slate-400 py-4">
            <span>${maxPrice.toFixed(2)}</span>
            <span>${((maxPrice + minPrice) / 2).toFixed(2)}</span>
            <span>${minPrice.toFixed(2)}</span>
          </div>
          
          {/* Chart area */}
          <div className="ml-12 mr-4 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0">
              <div className="h-full border-l border-slate-200 dark:border-slate-600"></div>
              <div className="absolute top-0 w-full border-t border-slate-200 dark:border-slate-600"></div>
              <div className="absolute top-1/2 w-full border-t border-slate-200 dark:border-slate-600"></div>
              <div className="absolute bottom-0 w-full border-t border-slate-200 dark:border-slate-600"></div>
            </div>
            
            {/* Price line */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="url(#priceGradient)"
                strokeWidth="2"
                points={priceHistory.map((point, index) => {
                  const x = (index / (priceHistory.length - 1)) * 100;
                  const y = 100 - ((point.price - minPrice) / priceRange) * 100;
                  return `${x},${y}`;
                }).join(' ')}
              />
              <defs>
                <linearGradient id="priceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6c4de3" />
                  <stop offset="100%" stopColor="#30d5c8" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Data points */}
            {priceHistory.map((point, index) => {
              const x = (index / (priceHistory.length - 1)) * 100;
              const y = 100 - ((point.price - minPrice) / priceRange) * 100;
              return (
                <div
                  key={index}
                  className="absolute w-3 h-3 bg-primary-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 hover:bg-primary-700 cursor-pointer"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={`${point.month}: $${point.price.toFixed(2)}`}
                />
              );
            })}
          </div>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-12 right-4 flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span>{priceHistory[0]?.month}</span>
            <span>{priceHistory[Math.floor(priceHistory.length / 2)]?.month}</span>
            <span>{priceHistory[priceHistory.length - 1]?.month}</span>
          </div>
        </div>
        
        {/* Price stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-success-600 dark:text-success-400">
              ${priceHistory[priceHistory.length - 1]?.price.toFixed(2)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Current</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              ${maxPrice.toFixed(2)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">12M High</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              ${minPrice.toFixed(2)}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">12M Low</div>
          </div>
        </div>
      </div>

      {/* Buy Now Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Buy Now</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buyNowLinks.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "block p-4 rounded-lg text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1",
                platform.color
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{platform.logo}</span>
                    <span className="font-semibold">{platform.name}</span>
                  </div>
                  <p className="text-sm opacity-90">{platform.description}</p>
                </div>
                <ExternalLink className="w-5 h-5 opacity-75" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardMarket;