import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useCollectionStore } from '../stores/collectionStore';
import CardGrid from '../components/ui/CardGrid';
import { loadSetDetails } from '../utils/dataLoader';
import { SetDetails } from '../types';

const SetDetailPageDebug = () => {
  const { id } = useParams<{ id: string }>();
  // always call selector with stable key
  const setCollection = useCollectionStore(state => state.collection[id ?? ''] || []);

  const [setDetails, setSetDetails] = useState<SetDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return setIsLoading(false);
      try {
        setIsLoading(true);
        const details = await loadSetDetails(id);
        setSetDetails(details);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const uniqueCardsCollected = new Set(setCollection.map(c => c.cardId)).size;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
        Back to Sets
      </Button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="h-24 w-24 bg-white/10 rounded-lg" />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Debug Set</h1>
              <p className="text-slate-500 dark:text-slate-400">Series • 100 cards</p>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex flex-col items-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {uniqueCardsCollected}/100
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Cards Collected</div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex flex-col items-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((uniqueCardsCollected / 100) * 100)}%
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Set Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-500 dark:bg-blue-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${Math.round((uniqueCardsCollected / 100) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            {100 - uniqueCardsCollected} cards remaining to complete this set
          </div>
        </div>

        {/* Real CardGrid when setDetails loaded */}
        <div className="mt-6">
          {isLoading && <p className="text-sm text-slate-500">Loading cards...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {setDetails && (
            <CardGrid
              cards={setDetails.cards as any}
              onCardClick={() => {}}
              collectionSetId={id}
              showHoverControls={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SetDetailPageDebug;
