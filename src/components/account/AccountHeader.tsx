import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Share2, Zap } from 'lucide-react';
import Button from '../ui/Button';

interface AccountHeaderProps {
  user: {
    name: string;
    email: string;
    avatar: string;
    joinDate: string;
  };
  userLevel: {
    level: number;
    name: string;
    progress: number;
    next: number | null;
  };
  stats: {
    totalCards: number;
  };
  xp?: number;
}

const AccountHeader: React.FC<AccountHeaderProps> = ({ user, userLevel, stats, xp }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-primary-600 to-secondary-500 rounded-lg shadow-lg p-6 mb-8 text-white">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-20 h-20 rounded-full border-4 border-white/20"
        />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-white/90">
            <span>Level {userLevel.level} • {userLevel.name}</span>
            <span>•</span>
            <span>Member since {new Date(user.joinDate).toLocaleDateString()}</span>
            {xp !== undefined && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  <span>{xp.toLocaleString()} XP</span>
                </div>
              </>
            )}
          </div>
          
          {/* Level Progress */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Progress to Level {userLevel.level + 1}</span>
              {userLevel.next && (
                <span className="text-sm">{stats.totalCards} / {userLevel.next} cards</span>
              )}
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${userLevel.progress}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            leftIcon={<Settings className="w-4 h-4" />}
            onClick={() => navigate('/settings')}
          >
            Settings
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Share2 className="w-4 h-4 mr-2" />
            Share Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountHeader;