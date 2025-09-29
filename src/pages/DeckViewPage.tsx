import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Share2 } from 'lucide-react';
import { useDeckStore } from '../stores/deckStore';
import Button from '../components/ui/Button';
import CardGrid from '../components/ui/CardGrid';

const DeckViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { decks } = useDeckStore();
  
  const deck = decks.find(d => d.id === id);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleEdit = () => {
    navigate(`/decks/builder?id=${id}`);
  };
  
  // Calculate deck stats
  const calculateDeckStats = () => {
    if (!deck) return { totalCards: 0, pokemon: 0, trainer: 0, energy: 0 };
    
    let stats = {
      totalCards: 0,
      pokemon: 0,
      trainer: 0,
      energy: 0,
      types: {} as Record<string, number>,
    };
    
    deck.cards.forEach((deckCard) => {
      const card = deckCard.card;
      const qty = deckCard.quantity;
      
      stats.totalCards += qty;
      
      if (card.supertype === 'Pokémon') {
        stats.pokemon += qty;
        
        // Count by type
        if (card.types) {
          card.types.forEach((type) => {
            stats.types[type] = (stats.types[type] || 0) + qty;
          });
        } else {
          // Handle typeless Pokémon
          stats.types['Colorless'] = (stats.types['Colorless'] || 0) + qty;
        }
      } else if (card.supertype === 'Trainer') {
        stats.trainer += qty;
      } else if (card.supertype === 'Energy') {
        stats.energy += qty;
      }
    });
    
    return stats;
  };
  
  const deckStats = calculateDeckStats();
  
  // Organize cards by type
  const getPokemonCards = () => deck?.cards.filter(c => c.card.supertype === 'Pokémon') || [];
  const getTrainerCards = () => deck?.cards.filter(c => c.card.supertype === 'Trainer') || [];
  const getEnergyCards = () => deck?.cards.filter(c => c.card.supertype === 'Energy') || [];
  
  // Prepare quantities for display
  const getCardQuantities = () => {
    if (!deck) return {};
    return deck.cards.reduce((acc: Record<string, number>, card) => {
      acc[card.cardId] = card.quantity;
      return acc;
    }, {});
  };
  
  if (!deck) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Deck Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          We couldn't find the deck you're looking for.
        </p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center text-slate-700 dark:text-slate-300"
        onClick={handleGoBack}
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back
      </Button>
      
      {/* Deck Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{deck.name}</h1>
              {deck.description && (
                <p className="text-slate-600 dark:text-slate-400 mt-2">{deck.description}</p>
              )}
              <div className="flex items-center mt-3 text-sm text-slate-500 dark:text-slate-400">
                <span>Created: {new Date(deck.createdAt).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>Last updated: {new Date(deck.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" leftIcon={<Edit size={16} />} onClick={handleEdit}>
                Edit Deck
              </Button>
              <Button variant="outline" leftIcon={<Download size={16} />}>
                Export
              </Button>
              <Button variant="outline" leftIcon={<Share2 size={16} />}>
                Share
              </Button>
            </div>
          </div>
        </div>
        
        {/* Deck Stats */}
        <div className="bg-slate-50 dark:bg-slate-700 p-4 border-t border-slate-200 dark:border-slate-600">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{deckStats.totalCards}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Cards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{deckStats.pokemon}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Pokémon</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary-500 dark:text-secondary-400">{deckStats.trainer}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Trainer</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent-500 dark:text-accent-400">{deckStats.energy}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Energy</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Deck Contents */}
      <div className="space-y-10">
        {/* Pokémon Cards */}
        <section>
          <div className="flex items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pokémon</h2>
            <span className="ml-3 px-2.5 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
              {deckStats.pokemon} cards
            </span>
          </div>
          
          {getPokemonCards().length > 0 ? (
            <CardGrid 
              cards={getPokemonCards().map(c => c.card)} 
              showQuantity={true}
              cardQuantities={getCardQuantities()}
              onCardClick={(card) => navigate(`/cards/${card.id}`)}
            />
          ) : (
            <p className="text-slate-600 dark:text-slate-400 py-4">No Pokémon cards in this deck.</p>
          )}
        </section>
        
        {/* Trainer Cards */}
        <section>
          <div className="flex items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trainer</h2>
            <span className="ml-3 px-2.5 py-0.5 bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 rounded-full text-sm font-medium">
              {deckStats.trainer} cards
            </span>
          </div>
          
          {getTrainerCards().length > 0 ? (
            <CardGrid 
              cards={getTrainerCards().map(c => c.card)} 
              showQuantity={true}
              cardQuantities={getCardQuantities()}
              onCardClick={(card) => navigate(`/cards/${card.id}`)}
            />
          ) : (
            <p className="text-slate-600 dark:text-slate-400 py-4">No Trainer cards in this deck.</p>
          )}
        </section>
        
        {/* Energy Cards */}
        <section>
          <div className="flex items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Energy</h2>
            <span className="ml-3 px-2.5 py-0.5 bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-200 rounded-full text-sm font-medium">
              {deckStats.energy} cards
            </span>
          </div>
          
          {getEnergyCards().length > 0 ? (
            <CardGrid 
              cards={getEnergyCards().map(c => c.card)} 
              showQuantity={true}
              cardQuantities={getCardQuantities()}
              onCardClick={(card) => navigate(`/cards/${card.id}`)}
            />
          ) : (
            <p className="text-slate-600 dark:text-slate-400 py-4">No Energy cards in this deck.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default DeckViewPage;