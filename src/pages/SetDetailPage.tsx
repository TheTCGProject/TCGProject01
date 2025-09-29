import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchCardsFromSet, fetchSetById } from '../services/api';
import { ArrowLeft, DollarSign, Star, Eye, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import CardGrid from '../components/ui/CardGrid';
import { useCollectionStore } from '../stores/collectionStore';
import { useSettingsStore } from '../stores/settingsStore';

const SetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSetProgress, getSetValue } = useCollectionStore();
  const { collectionMode } = useSettingsStore();
  
  // Cards per page for infinite loading
  const cardsPerPage = 24;
  
  // Intersection observer ref for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Fetch set information
  const { data: setData, isLoading: isSetLoading } = useQuery({
    queryKey: ['set', id],
    queryFn: () => fetchSetById(id!),
    enabled: !!id,
  });
  
  // Fetch cards with infinite query
  const {
    data: cardsData,
    isLoading: isCardsLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error: cardsError
  } = useInfiniteQuery({
    queryKey: ['set-cards-infinite', id],
    queryFn: ({ pageParam = 1 }) => fetchCardsFromSet(id!, {
      page: pageParam,
      pageSize: cardsPerPage,
      orderBy: 'number'
    }),
    enabled: !!id,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer cards than pageSize, we've reached the end
      if (lastPage.data.length < cardsPerPage) {
        return undefined;
      }
      // Otherwise, return the next page number
      return allPages.length + 1;
    },
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Flatten all pages into a single array of cards
  const allCards = cardsData?.pages.flatMap(page => page.data) || [];
  
  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '100px', // Start loading 100px before the element is visible
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  const handleCardClick = (cardId: string) => {
    navigate(`/cards/${cardId}?setId=${id}`);
  };
  
  const isLoading = isSetLoading || isCardsLoading;
  
  if (isLoading && !cardsData) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!setData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Set Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          We couldn't find the set you're looking for.
        </p>
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
          There was an error loading the cards for this set. Please try again later.
        </p>
        <Button variant="primary" onClick={() => navigate('/sets')}>
          Back to Sets
        </Button>
      </div>
    );
  }
  
  const progress = getSetProgress(id!, setData.total);
  const collectionValue = getSetValue(id!);
  
  // Calculate estimated master set value from available cards
  const sampleSetValue = allCards.reduce((total, card) => {
    if (card.tcgplayer?.prices) {
      const firstPrice = Object.values(card.tcgplayer.prices)[0];
      return total + (firstPrice?.market || firstPrice?.mid || firstPrice?.low || 0);
    }
    return total;
  }, 0);
  
  // Estimate total set value based on sample
  const estimatedMasterSetValue = allCards.length > 0 ? (sampleSetValue / allCards.length) * setData.total : sampleSetValue;
  
  // Calculate cards to collect (remaining cards needed)
  const cardsCollected = Math.round((progress / 100) * setData.total);
  const cardsToCollect = setData.total - cardsCollected;
  
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
          <img 
            src={setData.images.logo} 
            alt={`${setData.name} logo`}
            className="absolute inset-0 w-full h-full object-contain p-8"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{setData.name}</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">{setData.series} Series</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Released: {new Date(setData.releaseDate).toLocaleDateString()}
              </p>
            </div>
            <img 
              src={setData.images.symbol} 
              alt={`${setData.name} symbol`}
              className="w-12 h-12 object-contain"
            />
          </div>
          
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{setData.total}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Cards</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{cardsToCollect}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Cards to Collect</div>
            </div>
            <div 
              className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg cursor-help"
              title="Estimated value of the complete set based on average market price of loaded cards, extrapolated to the total number of cards in the set."
            >
              <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                ${estimatedMasterSetValue.toFixed(2)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Estimated Full Set Value</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ${collectionValue.toFixed(2)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Your Collection Value</div>
            </div>
          </div>
          
          {/* Collection Progress */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Collection Progress
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-primary-600 to-secondary-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {cardsCollected} of {setData.total} unique cards collected
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            {setData.legalities?.standard === 'Legal' && (
              <span className="px-3 py-1 text-sm rounded-full bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200">
                Standard Legal
              </span>
            )}
            {setData.legalities?.expanded === 'Legal' && (
              <span className="px-3 py-1 text-sm rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                Expanded Legal
              </span>
            )}
            {setData.ptcgoCode && (
              <span className="px-3 py-1 text-sm rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                PTCGO: {setData.ptcgoCode}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-6" id="cards-section">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cards in this Set</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Showing {allCards.length} of {setData.total} cards
              {hasNextPage && (
                <span className="ml-2 text-primary-600 dark:text-primary-400">
                  • Scroll down to load more
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {collectionMode && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                <Eye className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  Collection Mode Active
                </span>
              </div>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Hover over cards to quickly add to your collection
            </p>
          </div>
        </div>
        
        {/* Cards Grid */}
        {allCards.length > 0 ? (
          <div className="animate-fade-in">
            <CardGrid
              cards={allCards}
              onCardClick={(card) => handleCardClick(card.id)}
              collectionSetId={id}
              showHoverControls={true}
              hoverEffect={true}
              className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
            />
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-2">No cards found</p>
            <p className="text-slate-500 dark:text-slate-500">This set appears to be empty or unavailable.</p>
          </div>
        )}
        
        {/* Infinite Scroll Loading Indicator */}
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg font-medium">Loading more cards...</span>
            </div>
          )}
          {!hasNextPage && allCards.length > 0 && (
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                🎉 You've reached the end! All {allCards.length} cards loaded.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Scroll back up to browse the collection
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetDetailPage;