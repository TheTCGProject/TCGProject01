import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZoomIn, Plus, Share2, Heart, Copy } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getEnergySymbol, getEnergyTypeColor } from '../../utils/energyTypes';
import { useDeckStore } from '../../stores/deckStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useToast } from '../ui/Toast';
import type { PokemonCard } from '../../types';
import Button from '../ui/Button';

interface CardInfoProps {
  /** Main card to display */
  card: PokemonCard;
  /** Similar printings from other sets */
  similarPrintings?: PokemonCard[];
  /** Card click handler */
  onCardClick?: (cardId: string) => void;
}

const CardInfo: React.FC<CardInfoProps> = ({ card, similarPrintings, onCardClick }) => {
  const navigate = useNavigate();
  const { decks, addCardToDeck } = useDeckStore();
  const { addToWishlist, removeFromWishlist, isCardInWishlist } = useWishlistStore();
  const { showToast } = useToast();
  const [imageZoomed, setImageZoomed] = useState(false);

  // Check if card is in wishlist
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

  return (
    <div className="space-y-8">
      {/* Main Card Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Image Section */}
        <div className="flex justify-center items-start">
          <div
            className="relative cursor-pointer transition-transform duration-200 hover:scale-105"
            onClick={() => setImageZoomed(!imageZoomed)}
          >
            <img 
              src={imageZoomed ? card.images.large : card.images.large} 
              alt={card.name} 
              className="rounded-lg shadow-lg max-w-full"
            />
            <button 
              className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-opacity"
              aria-label="Zoom image"
            >
              <ZoomIn size={20} />
            </button>
          </div>
        </div>
        
        {/* Card Details Section */}
        <div className="space-y-4">
          {/* Card Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
              {card.name}
              {card.rarity && (
                <span className="ml-2 text-xs px-2 py-1 bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-200 rounded-full">
                  {card.rarity}
                </span>
              )}
            </h1>
            <div className="flex items-center mt-1 space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {card.set.name} · {card.number}/{card.set.printedTotal}
              </span>
              {card.set.images?.symbol && (
                <img src={card.set.images.symbol} alt={card.set.name} className="h-5 w-5" />
              )}
            </div>
          </div>
          
          {/* Card Type Information */}
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Type</h3>
                <p className="font-semibold text-slate-900 dark:text-white">{card.supertype}</p>
              </div>
              
              {card.subtypes && card.subtypes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Subtype</h3>
                  <p className="font-semibold text-slate-900 dark:text-white">{card.subtypes.join(', ')}</p>
                </div>
              )}
              
              {card.hp && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">HP</h3>
                  <p className="font-semibold text-slate-900 dark:text-white">{card.hp}</p>
                </div>
              )}
              
              {card.types && card.types.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Types</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {card.types.map((type) => (
                      <div
                        key={type}
                        className={cn(
                          "flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          getEnergyTypeColor(type)
                        )}
                      >
                        <img 
                          src={getEnergySymbol(type)} 
                          alt={type} 
                          className="w-4 h-4 mr-1"
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
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Attacks</h3>
              <div className="space-y-3">
                {card.attacks.map((attack, index) => (
                  <div key={index} className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{attack.name}</h4>
                      <div className="flex items-center">
                        {(attack.cost ?? []).map((cost, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center -ml-1 first:ml-0 border-2 border-white dark:border-slate-700",
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
                        <span className="text-sm font-medium ml-2">{attack.damage}</span>
                      </div>
                    </div>
                    {attack.text && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{attack.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Abilities Section */}
          {(card as any).abilities && (card as any).abilities.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Abilities</h3>
              <div className="space-y-3">
                {(card as any).abilities.map((ability: any, index: number) => (
                  <div key={index} className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{ability.name}</h4>
                      <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full">
                        {ability.type}
                      </span>
                    </div>
                    {ability.text && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{ability.text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Rules Section */}
          {card.rules && card.rules.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Rules</h3>
              <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                <ul className="list-disc pl-5 space-y-1">
                  {card.rules.map((rule, index) => (
                    <li key={index} className="text-sm text-slate-600 dark:text-slate-300">{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div className="space-y-6">
          {/* Add to Deck Section */}
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add to Deck</h3>
            
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
                    className="text-sm text-primary-600 dark:text-primary-400 mt-2 block hover:underline"
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
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className={cn(
                "flex-1",
                isInWishlist && "bg-red-50 border-red-300 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400"
              )}
              leftIcon={<Heart size={16} className={isInWishlist ? "fill-current" : ""} />}
              onClick={handleWishlistToggle}
            >
              {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1" 
              leftIcon={<Share2 size={16} />}
            >
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Similar Printings Section - Full Width */}
      {similarPrintings && similarPrintings.length > 0 && (
        <div className="w-full">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center">
            <Copy className="w-5 h-5 mr-2 text-primary-500" />
            Similar Printings ({similarPrintings.length})
          </h3>
          <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Other printings of "{card.name}" from different sets:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarPrintings.map((printing) => (
                <div
                  key={printing.id}
                  className="group cursor-pointer transition-transform duration-200 hover:scale-105"
                  onClick={() => onCardClick && onCardClick(printing.id)}
                >
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-600">
                    {/* Card Image */}
                    <div className="aspect-[2.5/3.5] mb-3 overflow-hidden rounded-md">
                      <img
                        src={printing.images.small}
                        alt={`${printing.set.name} printing`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    {/* Card Name */}
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-2 truncate">
                      {printing.name}
                    </h4>
                    
                    {/* Set Information */}
                    <div className="flex items-center space-x-2">
                      <img
                        src={printing.set.images.symbol}
                        alt={printing.set.name}
                        className="w-4 h-4 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {printing.set.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                          #{printing.number}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardInfo;