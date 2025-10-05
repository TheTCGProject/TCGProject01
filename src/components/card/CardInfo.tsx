import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZoomIn, Plus, Share2, Heart, Copy } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getEnergySymbol, getEnergyTypeColor } from '../../utils/energyTypes';
import { useDeckStore } from '../../stores/deckStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useToast } from '../ui/Toast';
import { PokemonCard } from '../../types';
import Button from '../ui/Button';

interface CardInfoProps {
  card: PokemonCard;
  similarPrintings?: PokemonCard[];
  onCardClick?: (cardId: string) => void;
}

const CardInfo: React.FC<CardInfoProps> = ({ card, similarPrintings, onCardClick }) => {
  const navigate = useNavigate();
  const { decks, addCardToDeck } = useDeckStore();
  const { addToWishlist, removeFromWishlist, isCardInWishlist } = useWishlistStore();
  const { showToast } = useToast();
  const [imageZoomed, setImageZoomed] = useState(false);

  const isInWishlist = isCardInWishlist(card.id);

  const handleAddToDeck = (deckId: string) => {
    if (card) {
      const deck = decks.find(d => d.id === deckId);
      addCardToDeck(deckId, card);
      
      showToast(
        `Added "${card.name}" to "${deck?.name || 'deck'}"!`,
        'success',
        {
          duration: 3000,
          action: {
            label: 'View Deck',
            onClick: () => navigate(`/decks/${deckId}`)
          }
        }
      );
    }
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(card.id);
      showToast(`Removed "${card.name}" from wishlist`, 'info', { duration: 2000 });
    } else {
      addToWishlist(card);
      showToast(`Added "${card.name}" to wishlist`, 'success', { 
        duration: 2000,
        action: {
          label: 'View Wishlist',
          onClick: () => navigate('/wishlist')
        }
      });
    }
  };

  if (!card) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        {/* Image Column */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-4">
            <div
              className="relative cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={() => setImageZoomed(!imageZoomed)}
            >
              <img 
                src={card.images?.large || ''} 
                alt={card.name || 'Card image'} 
                className="rounded-xl shadow-lg max-w-full mx-auto"
              />
              <button 
                className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-opacity"
                aria-label="Zoom image"
              >
                <ZoomIn size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Details Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Header */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
              {card.name}
              {card.rarity && (
                <span className="text-sm px-3 py-1 bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-200 rounded-full">
                  {card.rarity}
                </span>
              )}
            </h1>
            <div className="flex items-center mt-3 space-x-3">
              <span className="text-lg text-slate-600 dark:text-slate-400">
                {card.set?.name || 'Unknown Set'}
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-slate-600 dark:text-slate-400">
                {card.number || '?'}/{card.set?.printedTotal || '?'}
              </span>
              {card.set?.images?.symbol && (
                <img src={card.set.images.symbol} alt={card.set.name} className="h-6 w-6" />
              )}
            </div>
          </div>

          {/* Card Type Information */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Type</h3>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{card.supertype}</p>
              </div>
              
              {card.subtypes && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Subtype</h3>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{card.subtypes.join(', ')}</p>
                </div>
              )}
              
              {card.hp && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">HP</h3>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{card.hp}</p>
                </div>
              )}
              
              {card.types && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {card.types.map((type) => (
                      <div
                        key={type}
                        className={cn(
                          "flex items-center px-3 py-1.5 rounded-full text-sm font-medium",
                          getEnergyTypeColor(type)
                        )}
                      >
                        <img 
                          src={getEnergySymbol(type)} 
                          alt={type} 
                          className="w-5 h-5 mr-2"
                        />
                        <span>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attacks Section */}
          {card.attacks && card.attacks.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Attacks</h3>
              <div className="space-y-4">
                {card.attacks.map((attack, index) => (
                  <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-4 rounded-lg transition-colors hover:border-slate-300 dark:hover:border-slate-600">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{attack.name}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          {attack.cost.map((cost, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800",
                                getEnergyTypeColor(cost)
                              )}
                              title={cost}
                            >
                              <img
                                src={getEnergySymbol(cost)}
                                alt={cost}
                                className="w-4 h-4"
                              />
                            </div>
                          ))}
                        </div>
                        <span className="text-lg font-bold ml-3">{attack.damage}</span>
                      </div>
                    </div>
                    {attack.text && (
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{attack.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Abilities Section */}
          {card.abilities && card.abilities.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Abilities</h3>
              <div className="space-y-4">
                {card.abilities.map((ability, index) => (
                  <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-4 rounded-lg transition-colors hover:border-slate-300 dark:hover:border-slate-600">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{ability.name}</h4>
                      <span className="text-sm px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full">
                        {ability.type}
                      </span>
                    </div>
                    {ability.text && (
                      <p className="text-slate-600 dark:text-slate-300">{ability.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules Section */}
          {card.rules && card.rules.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Rules</h3>
              <div className="space-y-2">
                {card.rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                    <span className="text-primary-500 mt-1">•</span>
                    <p className="text-slate-600 dark:text-slate-300">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Column */}
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-4 space-y-6">
            {/* Add to Deck Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Add to Deck</h3>
              
              {decks.length > 0 ? (
                <div className="space-y-3">
                  {decks.slice(0, 3).map((deck) => (
                    <Button
                      key={deck.id}
                      variant="outline"
                      className="w-full justify-start"
                      leftIcon={<Plus size={16} />}
                      onClick={() => handleAddToDeck(deck.id)}
                    >
                      {deck.name}
                    </Button>
                  ))}
                  
                  {decks.length > 3 && (
                    <button 
                      className="text-sm text-primary-600 dark:text-primary-400 w-full text-center mt-3 hover:underline"
                      onClick={() => navigate('/decks')}
                    >
                      View all decks ({decks.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    You don't have any decks yet
                  </p>
                  <Button 
                    variant="primary"
                    leftIcon={<Plus size={16} />}
                    className="mx-auto"
                    onClick={() => navigate('/decks/builder')}
                  >
                    Create a Deck
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                leftIcon={<Share2 size={16} />}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  showToast('Link copied to clipboard!', 'success', { duration: 2000 });
                }}
              >
                Share
              </Button>
              <Button
                variant={isInWishlist ? 'primary' : 'outline'}
                className="flex-1"
                leftIcon={<Heart size={16} />}
                onClick={handleWishlistToggle}
              >
                {isInWishlist ? 'Wishlisted' : 'Wishlist'}
              </Button>
            </div>

            {/* Similar Printings */}
            {similarPrintings && similarPrintings.length > 0 && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Similar Printings</h3>
                <div className="space-y-4">
                  {similarPrintings.map((printing) => (
                    <div
                      key={printing.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700/50"
                      onClick={() => onCardClick?.(printing.id)}
                    >
                      <div className="w-12 h-16 flex-shrink-0">
                        <img
                          src={printing.images.small}
                          alt={printing.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={printing.set.images.symbol}
                            alt={printing.set.name}
                            className="w-4 h-4 flex-shrink-0"
                          />
                          <p className="text-sm text-slate-900 dark:text-white font-medium truncate">
                            {printing.set.name}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          #{printing.number}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardInfo;