import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSetById, fetchCardsFromSet } from '../services/api';
import { ArrowLeft, Eye, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import CardGrid from '../components/ui/CardGrid';
import { useCollectionStore } from '../stores/collectionStore';
import { useSettingsStore } from '../stores/settingsStore';
import type { SetBrief, Card } from '../types';

const SetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Uncomment these lines if implemented in your stores:
  // const { getSetProgress, getSetValue } = useCollectionStore();
  // const { collectionMode } = useSettingsStore();

  // Fetch set details
  const { data: setData, isLoading: isSetLoading } = useQuery<SetBrief | undefined>({
    queryKey: ['set', id],
    queryFn: () => (id ? fetchSetById(id) : Promise.resolve(undefined)),
    enabled: !!id,
  });

  // Fetch all cards for this set
const { data: allCards, ...rest } = useQuery<Card[] | undefined>({
  queryKey: ['set-cards', id],
  queryFn: () =>
    id
      ? fetchCardsFromSet(id).then(res => res.data)
      : Promise.resolve([]),
  enabled: !!id,
});


  const isLoading = isSetLoading || isCardsLoading;

  const handleCardClick = (cardId: string) => {
    navigate(`/cards/${cardId}?setId=${id}`);
  };

  if (isLoading && !allCards) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="animate-spin w-12 h-12 text-primary-600" />
      </div>
    );
  }

  if (!setData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Set Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">No matching set found.</p>
        <Button variant="primary" onClick={() => navigate('/sets')}>
          View All Sets
        </Button>
      </div>
    );
  }

  if (cardsError) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Error Loading Cards</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          There was an error loading set cards. Please try again.
        </p>
        <Button variant="primary" onClick={() => navigate('/sets')}>
          Back to Sets
        </Button>
      </div>
    );
  }

  // You may want to implement these calculations fully if your stores support them:
  // const progress = getSetProgress(id!, setData.total);
  // const collectionValue = getSetValue(id!);
  // Example fallback values if not yet implemented:
  const progress = 0;
  const collectionValue = 0;

  // Card data
  const cards = allCards ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6 flex items-center text-slate-700 dark:text-slate-300"
        onClick={() => navigate('/sets')}
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Sets
      </Button>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="aspect-[3/1] relative overflow-hidden bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
          {setData.logo && (
            <img
              src={setData.logo}
              alt={`${setData.name} logo`}
              className="absolute inset-0 w-full h-full object-contain p-8"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{setData.name}</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Set ID: {setData.id}</p>
              {/* Show other set info if available */}
            </div>
            {setData.symbol && (
              <img
                src={setData.symbol}
                alt={`${setData.name} symbol`}
                className="w-12 h-12 object-contain"
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6" id="cards-section">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cards in this Set</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Showing {cards.length} cards
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        {cards.length > 0 ? (
          <CardGrid
            cards={cards}
            onCardClick={(card) => handleCardClick(card.id)}
            collectionSetId={id}
            showHoverControls={true}
            className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          />
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">No cards found</p>
            <p className="text-slate-500 dark:text-slate-500">
              This set appears to be empty or unavailable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetDetailPage;