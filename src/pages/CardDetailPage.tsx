import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { loadCardById, loadSetDetails } from '../utils/dataLoader';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useCollectionStore } from '../stores/collectionStore';
import { useSimilarPrintings } from '../hooks/useSimilarPrintings';
import { cn } from '../utils/cn';

// Import new components
import CardInfo from '../components/card/CardInfo';
import CardCollection from '../components/card/CardCollection';
import CardMarket from '../components/card/CardMarket';

/**
 * Card Detail Page Component
 * Displays comprehensive information about a specific Pokemon card
 * Includes tabs for card info, collection tracking, and market data
 */
const CardDetailPage = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'collection' | 'market'>('info');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    addToCollection, 
    removeFromCollection, 
    updateCardQuantity, 
    getCardQuantity, 
    getCardVariants 
  } = useCollectionStore();
  
  // Get setId from URL query params for collection context
  const searchParams = new URLSearchParams(location.search);
  const setId = searchParams.get('setId');
  
  // Fetch current card data using local data loader
  const { data: card, isLoading: isCardLoading } = useQuery({
    queryKey: ['card', id],
    queryFn: () => loadCardById(id!),
    enabled: !!id,
  });

  // Fetch true reprints of the current card
  const { data: trueReprints } = useSimilarPrintings(
    card?.name || '',
    card?.id || '',
    setId || '',
    card || undefined
  );

  // Fetch all cards in the set for navigation
  const { data: setDetails } = useQuery({
    queryKey: ['set-details', setId],
    queryFn: () => loadSetDetails(setId!),
    enabled: !!setId,
  });

  // Calculate navigation indices
  const cards = setDetails?.cards ?? [];
  const currentIndex = cards.findIndex(c => c.id === id);
  const previousCard = currentIndex > 0 ? cards[currentIndex - 1] : null;
  const nextCard = currentIndex < cards.length - 1 ? cards[currentIndex + 1] : null;

  // Handle loading and error states
  if (isCardLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-4">Card not found</h2>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2" size={16} />
          Go Back
        </Button>
      </div>
    );
  }

  // Get card variants for collection tracking
  const cardVariants = setId ? getCardVariants(setId, id!) : {};
  
  // Define available variants based on card rarity and type
  const availableVariants = [
    { id: 'regular', name: 'Normal' },
    { id: 'reverse-holo', name: 'Reverse Holo' },
    { id: 'holo', name: 'Holo' },
    { id: 'full-art', name: 'Full Art' },
    { id: 'alt-art', name: 'Alt Art' },
    { id: 'rainbow', name: 'Rainbow Rare' },
    { id: 'gold', name: 'Gold Rare' },
    { id: 'secret', name: 'Secret Rare' }
  ].filter(variant => {
    if (!card?.rarity) return false;
    
    // Filter variants based on card rarity
    if (card.rarity === 'Common' || card.rarity === 'Uncommon') {
      return ['regular', 'reverse-holo'].includes(variant.id);
    }
    
    if (card.rarity === 'Rare') {
      return ['regular', 'reverse-holo', 'holo'].includes(variant.id);
    }

    // Special illustration rares should only show as holo
    if (card.rarity === 'Illustration Rare' || card.rarity === 'Special Illustration Rare') {
      return ['holo'].includes(variant.id);
    }
    
    // Other rarities exclude reverse holo
    return variant.id !== 'reverse-holo';
  });

  /**
   * Handle collection quantity changes
   */
  const handleQuantityChange = (variantId: string, newQuantity: number) => {
    if (!setId || !card) return;

    if (newQuantity <= 0) {
      removeFromCollection(setId, card.id, variantId, getCardQuantity(setId, card.id, variantId));
    } else {
      const currentQuantity = getCardQuantity(setId, card.id, variantId);
      if (currentQuantity === 0) {
        addToCollection(setId, card, variantId, newQuantity);
      } else {
        updateCardQuantity(setId, card.id, variantId, newQuantity);
      }
    }
  };
  
  /**
   * Navigate back to previous page
   */
  const handleGoBack = () => {
    navigate(-1);
  };
  
  /**
   * Add card to a specific deck
   */
  

  /**
   * Navigate to another card with set context preserved
   */
  const navigateToCard = (cardId: string) => {
    navigate(`/cards/${cardId}${setId ? `?setId=${setId}` : ''}`);
  };
  
  // Loading state
  if (isCardLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Error state - card not found
  if (!card) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Card Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          We couldn't find the card you're looking for.
        </p>
        <Button variant="primary" onClick={handleGoBack}>
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center text-slate-700 dark:text-slate-300"
        onClick={handleGoBack}
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back
      </Button>
      
      {/* Main Card Content */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              "flex-1 px-6 py-4 text-sm font-medium transition-colors rounded-tl-lg",
              activeTab === 'info'
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
            )}
          >
            Card Info
          </button>
          {setId && (
            <button
              onClick={() => setActiveTab('collection')}
              className={cn(
                "flex-1 px-6 py-4 text-sm font-medium transition-colors",
                activeTab === 'collection'
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
              )}
            >
              Collection
            </button>
          )}
          <button
            onClick={() => setActiveTab('market')}
            className={cn(
              "flex-1 px-6 py-4 text-sm font-medium transition-colors rounded-tr-lg",
              activeTab === 'market'
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
            )}
          >
            Market
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <CardInfo 
              card={card}
              similarPrintings={trueReprints}
              onCardClick={(cardId) => navigate(`/cards/${cardId}`)}
            />
          )}

          {activeTab === 'collection' && setId && (
            <CardCollection
              card={card}
              setId={setId}
              cardVariants={cardVariants}
              availableVariants={availableVariants}
              onQuantityChange={handleQuantityChange}
              getCardQuantity={getCardQuantity}
            />
          )}

          {activeTab === 'market' && (
            <CardMarket card={card} />
          )}
        </div>
        
        {/* Artist and Set Information Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap justify-between text-sm text-slate-600 dark:text-slate-400">
            <div>
              {card.artist && (
                <span>Illustrated by <span className="font-medium">{card.artist}</span></span>
              )}
            </div>
            <div>
              <span>Release Date: <span className="font-medium">{setDetails ? new Date(setDetails.releaseDate).toLocaleDateString() : 'Unknown'}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Navigation within Set */}
      {cards.length > 0 && (
        <div className="mt-8 flex justify-between items-center">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => previousCard && navigateToCard(previousCard.id)}
            disabled={!previousCard}
          >
            <ChevronLeft size={20} />
            <span>Previous Card</span>
          </Button>

          <span className="text-sm text-slate-600 dark:text-slate-400">
            Card {currentIndex + 1} of {cards.length}
          </span>

          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => nextCard && navigateToCard(nextCard.id)}
            disabled={!nextCard}
          >
            <span>Next Card</span>
            <ChevronRight size={20} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CardDetailPage;