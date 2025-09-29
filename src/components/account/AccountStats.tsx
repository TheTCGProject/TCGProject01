import React from 'react';

interface AccountStatsProps {
  stats: {
    totalCards: number;
    totalValue: number;
    setsCompleted: number;
    uniqueCards: number;
  };
}

const AccountStats: React.FC<AccountStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {stats.totalCards}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">Total Cards</div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-success-600 dark:text-success-400">
          ${stats.totalValue.toFixed(0)}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">Collection Value</div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
          {stats.setsCompleted}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">Sets Completed</div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 text-center">
        <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">
          {stats.uniqueCards}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">Unique Cards</div>
      </div>
    </div>
  );
};

export default AccountStats;