import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSets, fetchCardsFromSet } from '../services/api';
import { ArrowLeft, CheckSquare, Download, Printer, Eye, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import CardGrid from '../components/ui/CardGrid';
import { useCollectionStore } from '../stores/collectionStore';
import { cn } from '../utils/cn';

/**
 * Set Checklist Generator Page
 * Allows users to generate printable checklists for any Pokemon TCG set
 */
const SetChecklistPage = () => {
  const navigate = useNavigate();
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { getSetProgress } = useCollectionStore();

  // Fetch all sets for the dropdown
  const { data: setsData, isLoading: setsLoading } = useQuery({
    queryKey: ['sets'],
    queryFn: fetchSets,
  });

  // Fetch cards for the selected set
  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: ['set-cards-checklist', selectedSetId],
    queryFn: () => fetchCardsFromSet(selectedSetId, {
      pageSize: 500, // Get all cards in the set
      orderBy: 'number'
    }),
    enabled: !!selectedSetId,
  });

  // Get selected set data
  const selectedSet = setsData?.data?.find(set => set.id === selectedSetId);
  
  // Filter cards based on search term
  const filteredCards = cardsData?.data?.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.number.includes(searchTerm)
  ) || [];

  // Calculate collection progress
  const collectionProgress = selectedSet ? getSetProgress(selectedSetId, selectedSet.total) : 0;
  const collectedCount = Math.round((collectionProgress / 100) * (selectedSet?.total || 0));

  /**
   * Handle set selection
   */
  const handleSetChange = (setId: string) => {
    setSelectedSetId(setId);
    setSearchTerm(''); // Clear search when changing sets
  };

  /**
   * Handle card click navigation
   */
  const handleCardClick = (cardId: string) => {
    navigate(`/cards/${cardId}?setId=${selectedSetId}`);
  };

  /**
   * Generate printable checklist
   */
  const handlePrintChecklist = () => {
    if (!selectedSet || !cardsData?.data) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cards = filteredCards;
    const checklistHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedSet.name} - Checklist</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .set-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              font-size: 14px;
              color: #666;
            }
            .checklist {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 8px;
            }
            .card-item {
              display: flex;
              align-items: center;
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            .checkbox {
              width: 16px;
              height: 16px;
              border: 2px solid #333;
              margin-right: 12px;
              flex-shrink: 0;
            }
            .card-info {
              flex: 1;
              min-width: 0;
            }
            .card-name {
              font-weight: bold;
              margin-bottom: 2px;
            }
            .card-details {
              font-size: 12px;
              color: #666;
            }
            .rarity {
              display: inline-block;
              padding: 2px 6px;
              background: #f0f0f0;
              border-radius: 3px;
              font-size: 10px;
              margin-left: 8px;
            }
            @media print {
              body { margin: 10px; }
              .header { page-break-after: avoid; }
              .card-item { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedSet.name}</h1>
            <p>${selectedSet.series} Series</p>
          </div>
          
          <div class="set-info">
            <div>Total Cards: ${selectedSet.total}</div>
            <div>Release Date: ${new Date(selectedSet.releaseDate).toLocaleDateString()}</div>
            <div>Generated: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="checklist">
            ${cards.map(card => `
              <div class="card-item">
                <div class="checkbox"></div>
                <div class="card-info">
                  <div class="card-name">${card.name}</div>
                  <div class="card-details">
                    #${card.number}/${selectedSet.printedTotal}
                    ${card.rarity ? `<span class="rarity">${card.rarity}</span>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(checklistHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  /**
   * Export checklist as text
   */
  const handleExportText = () => {
    if (!selectedSet || !cardsData?.data) return;

    const cards = filteredCards;
    const textContent = [
      `${selectedSet.name} - Checklist`,
      `${selectedSet.series} Series`,
      `Total Cards: ${selectedSet.total}`,
      `Release Date: ${new Date(selectedSet.releaseDate).toLocaleDateString()}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      '--- CHECKLIST ---',
      '',
      ...cards.map(card => `☐ ${card.name} (#${card.number}/${selectedSet.printedTotal})${card.rarity ? ` - ${card.rarity}` : ''}`),
    ].join('\n');

    // Create and download text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSet.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_checklist.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-4 text-slate-700 dark:text-slate-300"
            onClick={() => navigate('/tools')}
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            Back to Tools
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
              <CheckSquare className="w-8 h-8 mr-3 text-green-500" />
              Set Checklist Generator
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Generate printable checklists for any Pokémon TCG set to track your collection progress
            </p>
          </div>
        </div>
      </div>

      {/* Set Selection */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Select a Set
        </h2>
        
        {setsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
            <span className="ml-3 text-slate-600 dark:text-slate-400">Loading sets...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <select
              value={selectedSetId}
              onChange={(e) => handleSetChange(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Choose a set...</option>
              {setsData?.data?.map((set) => (
                <option key={set.id} value={set.id}>
                  {set.name} ({set.series}) - {set.total} cards
                </option>
              ))}
            </select>

            {selectedSet && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedSet.total}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Cards</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {collectedCount}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Collected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                    {Math.round(collectionProgress)}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Complete</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Checklist Content */}
      {selectedSetId && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
          {/* Checklist Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {selectedSet?.name} Checklist
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {filteredCards.length} of {selectedSet?.total} cards
                  {searchTerm && ` (filtered by "${searchTerm}")`}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer className="w-4 h-4" />}
                  onClick={handlePrintChecklist}
                  disabled={!cardsData?.data}
                >
                  Print Checklist
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={handleExportText}
                  disabled={!cardsData?.data}
                >
                  Export Text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Eye className="w-4 h-4" />}
                  onClick={() => navigate(`/sets/${selectedSetId}`)}
                >
                  View Set
                </Button>
              </div>
            </div>

            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search cards by name or number..."
                  className="pl-10 pr-4 py-2 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex rounded-md border border-slate-300 dark:border-slate-600 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    viewMode === 'grid'
                      ? "bg-primary-600 text-white"
                      : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                  )}
                >
                  Grid View
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    viewMode === 'list'
                      ? "bg-primary-600 text-white"
                      : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                  )}
                >
                  List View
                </button>
              </div>
            </div>
          </div>

          {/* Checklist Content */}
          <div className="p-6">
            {cardsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
                <span className="ml-3 text-slate-600 dark:text-slate-400">Loading cards...</span>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {searchTerm ? 'No cards match your search' : 'No cards found'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {searchTerm ? 'Try adjusting your search terms' : 'This set appears to be empty'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <CardGrid
                cards={filteredCards}
                onCardClick={(card) => handleCardClick(card.id)}
                collectionSetId={selectedSetId}
                showHoverControls={true}
                className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              />
            ) : (
              /* List View */
              <div className="space-y-2">
                {filteredCards.map((card, index) => (
                  <div
                    key={card.id}
                    className="flex items-center p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                    onClick={() => handleCardClick(card.id)}
                  >
                    <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-600 rounded mr-4 flex-shrink-0" />
                    <img
                      src={card.images.small}
                      alt={card.name}
                      className="w-12 h-auto rounded mr-4 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {card.name}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        #{card.number}/{selectedSet?.printedTotal}
                        {card.rarity && (
                          <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-600 rounded-full text-xs">
                            {card.rarity}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 ml-4">
                      {index + 1} of {filteredCards.length}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedSetId && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
            How to Use the Set Checklist Generator
          </h3>
          <div className="space-y-2 text-blue-800 dark:text-blue-300">
            <p>• <strong>Select a Set:</strong> Choose any Pokémon TCG set from the dropdown above</p>
            <p>• <strong>View Cards:</strong> Browse all cards in the set with collection tracking</p>
            <p>• <strong>Print Checklist:</strong> Generate a printer-friendly checklist with checkboxes</p>
            <p>• <strong>Export Text:</strong> Download a text file version of the checklist</p>
            <p>• <strong>Track Progress:</strong> See your collection progress and add cards directly</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetChecklistPage;