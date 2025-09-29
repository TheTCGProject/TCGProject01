import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trophy, Award, Calendar } from 'lucide-react';

interface AccountActivityProps {
  recentCards: Array<{
    cardId: string;
    card: any;
    variant: string;
    quantity: number;
    dateAdded: string;
    setId: string;
  }>;
  userLevel: {
    level: number;
    name: string;
  };
  earnedBadges: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

const AccountActivity: React.FC<AccountActivityProps> = ({
  recentCards,
  userLevel,
  earnedBadges
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        Recent Activity
      </h2>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-white">
                Added {recentCards.length} new cards this week
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Keep up the great collecting!
              </p>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Recent
            </span>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-white">
                Reached Level {userLevel.level}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You're now a {userLevel.name}!
              </p>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              1 week ago
            </span>
          </div>
          
          {earnedBadges.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white">
                  Earned "{earnedBadges[earnedBadges.length - 1].name}" badge
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {earnedBadges[earnedBadges.length - 1].description}
                </p>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                2 weeks ago
              </span>
            </div>
          )}

          {/* Recently Added Cards Section */}
          {recentCards.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                Recently Added Cards
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCards.slice(0, 6).map((card) => (
                  <div 
                    key={`${card.cardId}-${card.variant}-${card.dateAdded}`} 
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    onClick={() => navigate(`/cards/${card.cardId}?setId=${card.setId}`)}
                  >
                    <img
                      src={card.card.images.small}
                      alt={card.card.name}
                      className="w-12 h-auto rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {card.card.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <img
                          src={card.card.set.images.symbol}
                          alt=""
                          className="w-4 h-4"
                        />
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(card.dateAdded).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountActivity;