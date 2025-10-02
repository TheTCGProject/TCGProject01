import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCardById, fetchCardsFromSet } from '../services/api';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useDeckStore } from '../stores/deckStore';
import { useCollectionStore } from '../stores/collectionStore';
import { cn } from '../utils/cn';
import CardInfo from '../components/card/CardInfo';
import CardCollection from '../components/card/CardCollection';
import CardMarket from '../components/card/CardMarket';
import { Card } from '../types';
import { isLegal } from '../utils/cardLegality';

const VARIANT_OPTIONS = [
  { id: 'normal', name: 'Normal' },
  { id: 'reverse-holo', name: 'Reverse Holo' },
  { id: 'holofoil', name: 'Holofoil' },
  { id: 'full-art', name: 'Full Art' },
  { id: 'alt-art', name: 'Alt Art' },
  { id: 'rainbow', name: 'Rainbow Rare' },
  { id: 'gold', name: 'Gold Rare' },
  { id: 'secret', name: 'Secret Rare' }
];

const CardDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'collection' | 'market'>('info');
  const { id: cardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const setId = searchParams.get('setId');

  const { addCardToDeck } = useDeckStore();
  const { 
    addToCollection, 
    removeFromCollection, 
    updateCardQuantity, 
    getCardQuantity, 
    getCardVariants 
  } = useCollectionStore();

  // Fetch card data
  const { data: card, isLoading: isCardLoading } = useQuery<Card>({
    queryKey: ['card', cardId],
    queryFn: () => fetchCardById(cardId!),
    enabled: !!cardId,
  });

  // Fetch all cards in set for navigation
  const { data: setCardsData } = useQuery<{ data: Card[] }>({
    queryKey: ['set-cards', card?.set.id],
    queryFn: () => card?.set.id ? fetchCardsFromSet(card.set.id) : Promise.resolve({ data: [] }),
    enabled: !!card?.set.id,
  });

  // Collection tracking
  const cardVariants = setId && card ? getCardVariants(setId, card.id) : {};

  // Filter available variants based on tcgdex card's actual field presence
  const availableVariants = VARIANT_OPTIONS.filter(v => {
    if (!card?.variants) return false;
    if (v.id === 'normal') return !!card.variants.normal;
    if (v.id === 'holofoil') return !!card.variants.holo;
    if (v.id === 'reverse-holo') return !!card.variants.reverse;
    if (v.id === 'firstEdition') return !!card.variants.firstEdition;
    return true;  // Show other types, can be customized
  });

  // Pagination logic for set navigation
  const cardsInSet = setCardsData?.data ?? [];
  const currentIndex = cardsInSet.findIndex(c => c.id === cardId);
  const previousCard = currentIndex > 0 ? cardsInSet[currentIndex - 1] : null;
  const nextCard = currentIndex < cardsInSet.length - 1 ? cardsInSet[currentIndex + 1] : null;

  // Handle quantity change for collection tracking
  const handleQuantityChange = (variantId: string, newQuantity: number) => {
    if (!setId || !card) return;
    const currentQty = getCardQuantity(setId, card.id, variantId);
    if (newQuantity <= 0) {
      removeFromCollection(setId, card.id, variantId, currentQty);
    } else if (currentQty === 0) {
      addToCollection(setId, card, variantId, newQuantity);
    } else {
      updateCardQuantity(setId, card.id, variantId, newQuantity);
    }
  };

  const handleGoBack = () => navigate(-1);

  const handleAddToDeck = (deckId: string) => {
    if (card) addCardToDeck(deckId, card);
  };

  const navigateToCard = (cid: string) => {
    navigate(`/cards/${cid}${setId ? `?setId=${setId}` : ''}`);
  };

  if (isCardLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Card Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          We couldn't find the card you're looking for.
        </p>
        <Button variant="primary" onClick={handleGoBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Nav Bar */}
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center text-slate-700 dark:text-slate-300"
        onClick={handleGoBack}
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back
      </Button>

      {/* Info Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              "flex-1 px-6 py-4 text-sm font-medium transition-colors rounded-tl-lg",
              activeTab === 'info'
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
            )}
          >Card Info</button>
          {setId && (
            <button
              onClick={() => setActiveTab('collection')}
              className={cn(
                "flex-1 px-6 py-4 text-sm font-medium transition-colors",
                activeTab === 'collection'
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
              )}
            >Collection</button>
          )}
          <button
            onClick={() => setActiveTab('market')}
            className={cn(
              "flex-1 px-6 py-4 text-sm font-medium transition-colors rounded-tr-lg",
              activeTab === 'market'
                ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
            )}
          >Market</button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <CardInfo 
              card={card}
              onCardClick={navigateToCard}
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

        {/* Card/set meta info */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 flex flex-wrap justify-between text-xs text-slate-600 dark:text-slate-400">
          {card.illustrator && (
            <span>Illustrated by <span className="font-medium">{card.illustrator}</span></span>
          )}
          {card.set?.releaseDate && (
            <span>Release Date: <span className="font-medium">{new Date(card.set.releaseDate).toLocaleDateString()}</span></span>
          )}
          <span>
            <span className={`px-2 py-1 rounded ${isLegal(card, 'standard') ? "bg-green-200 dark:bg-green-700 text-green-900 dark:text-green-300" : "bg-red-100 dark:bg-red-700 text-red-900 dark:text-red-200"}`}>
              Standard: {isLegal(card, 'standard') ? "Legal" : "Not Legal"}
            </span>
            <span className={`ml-2 px-2 py-1 rounded ${isLegal(card, 'expanded') ? "bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-blue-300" : "bg-red-100 dark:bg-red-700 text-red-900 dark:text-red-200"}`}>
              Expanded: {isLegal(card, 'expanded') ? "Legal" : "Not Legal"}
            </span>
          </span>
        </div>
      </div>

      {/* Card Navigation within Set */}
      {cardsInSet.length > 0 && (
        <div className="mt-8 flex justify-between items-center">
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => previousCard && navigateToCard(previousCard.id)}
            disabled={!previousCard}
          >
            <ChevronLeft size={20} />
            Previous Card
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Card {currentIndex + 1} of {cardsInSet.length}
          </span>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => nextCard && navigateToCard(nextCard.id)}
            disabled={!nextCard}
          >
            Next Card
            <ChevronRight size={20} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default CardDetailPage;