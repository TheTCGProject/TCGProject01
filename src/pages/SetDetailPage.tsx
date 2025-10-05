import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import CardGrid from '../components/ui/CardGrid';
import { useCollectionStore } from '../stores/collectionStore';
import { loadSetDetails } from '../utils/dataLoader';
import { SetDetails } from '../types';

const SetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Always call hooks at the top level with a stable key.
  // Move the collection selector here so it's invoked on every render and
  // doesn't get skipped by early returns (prevents hook-order warnings).
  const setCollection = useCollectionStore(state => state.collection[id ?? ""] || []);

  const [setDetails, setSetDetails] = useState<SetDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSet = async () => {
      if (!id) {
        setError('No set ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const details = await loadSetDetails(id);
        
        if (!details) {
          setError(`Set ${id} not found`);
          return;
        }

        setSetDetails(details);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load set details');
      } finally {
        setIsLoading(false);
      }
    };

    loadSet();
  }, [id]);

  const handleCardClick = (card: any) => {
    navigate(`/cards/${card.id}?setId=${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary-200 dark:border-secondary-800 border-t-secondary-600 dark:border-t-secondary-400 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Loading set details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  let uniqueCardsCollected = 0;
  let progress = 0;
  let cardsCollected = 0;
  let cardsToCollect = 0;

  if (setDetails && id) {
    uniqueCardsCollected = new Set((setCollection as { cardId: string }[]).map(card => card.cardId)).size;
    progress = setDetails.total > 0 ? (uniqueCardsCollected / setDetails.total) * 100 : 0;
    cardsCollected = uniqueCardsCollected;
    cardsToCollect = setDetails.total - cardsCollected;
  }

  if (!setDetails) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/sets')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Sets
      </Button>

      {/* Set header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <img
            src={setDetails.images.logo}
            alt={`${setDetails.name} logo`}
            className="h-24 object-contain filter drop-shadow-lg"
          />
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{setDetails.name}</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Released {new Date(setDetails.releaseDate).toLocaleDateString()}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                {setDetails.series} Series • {setDetails.total} cards
              </p>
            </div>

            <div className="flex gap-4">
              {/* Collection Stats */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex flex-col items-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {cardsCollected}/{setDetails.total}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Cards Collected</div>
              </div>
              
              {/* Collection Progress */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex flex-col items-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {progress}%
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Set Progress</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-blue-500 dark:bg-blue-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
              {cardsToCollect} cards remaining to complete this set
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="mt-8">
        <CardGrid
          cards={setDetails.cards}
          onCardClick={handleCardClick}
          collectionSetId={id}
          showHoverControls={true}
          className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        />
      </div>
    </div>
  );
};

export default SetDetailPage;