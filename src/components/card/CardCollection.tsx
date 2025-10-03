import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getCardPrice } from '../../services/api';

interface CardCollectionProps {
  card: any;
  setId: string;
  cardVariants: Record<string, number>;
  availableVariants: Array<{ id: string; name: string }>;
  onQuantityChange: (variantId: string, newQuantity: number) => void;
  getCardQuantity: (setId: string, cardId: string, variant: string) => number;
}

const CardCollection: React.FC<CardCollectionProps> = ({
  card,
  setId,
  cardVariants,
  availableVariants,
  onQuantityChange,
  getCardQuantity
}) => {
  const getCollectionProgress = () => {
    const ownedVariants = Object.values(cardVariants).filter(quantity => quantity > 0).length;
    const totalVariants = availableVariants.length;
    return {
      owned: ownedVariants,
      total: totalVariants,
      percentage: totalVariants > 0 ? (ownedVariants / totalVariants) * 100 : 0
    };
  };

  const getTotalCollectionValue = () => {
    return Object.entries(cardVariants).reduce((total, [variant, quantity]) => {
      const price = getCardPrice(card, variant);
      return total + (price * quantity);
    }, 0);
  };

  const progress = getCollectionProgress();

  return (
    <div className="space-y-6">
      {/* Collection Progress Bar */}
      <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Collection Progress</h3>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {progress.owned} / {progress.total} variants
          </span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300 ease-out flex items-center justify-center"
              style={{ width: `${progress.percentage}%` }}
            >
              {progress.percentage > 20 && (
                <span className="text-xs font-bold text-white">
                  {Math.round(progress.percentage)}%
                </span>
              )}
            </div>
          </div>
          {progress.percentage <= 20 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {Math.round(progress.percentage)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Variant Controls */}
      <div className="space-y-3">
        {availableVariants.map((variant) => {
          const quantity = getCardQuantity(setId, card.id, variant.id);
          const price = getCardPrice(card, variant.id);
          const isOwned = quantity > 0;
          
          return (
            <div
              key={variant.id}
              className={cn(
                "p-4 rounded-lg border-2 transition-all",
                isOwned
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                  : "border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-600 opacity-60"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className={cn(
                    "font-medium",
                    isOwned 
                      ? "text-slate-900 dark:text-white" 
                      : "text-slate-500 dark:text-slate-400"
                  )}>
                    {variant.name}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                    – ${price.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onQuantityChange(variant.id, Math.max(0, quantity - 1))}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      quantity > 0
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed"
                    )}
                    disabled={quantity === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <span className={cn(
                    "w-8 text-center font-bold",
                    isOwned 
                      ? "text-slate-900 dark:text-white" 
                      : "text-slate-500 dark:text-slate-400"
                  )}>
                    {quantity}
                  </span>
                  
                  <button
                    onClick={() => onQuantityChange(variant.id, quantity + 1)}
                    className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Collection Summary */}
      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-success-600 dark:text-success-400">
            ${getTotalCollectionValue().toFixed(2)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Collection Value
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardCollection;