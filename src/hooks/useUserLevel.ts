import { useMemo } from 'react';

interface UserLevel {
  level: number;
  name: string;
  next: number | null;
  progress: number;
  requirements: string[];
  benefits: string[];
}

export const useUserLevel = (totalCards: number, totalValue: number = 0, setsCompleted: number = 0) => {
  
  // Define level thresholds and metadata
  const levelDefinitions = [
    {
      level: 1,
      name: 'Rookie Collector',
      cardThreshold: 0,
      nextThreshold: 100,
      requirements: ['Start your collection'],
      benefits: ['Access to basic features', 'Collection tracking']
    },
    {
      level: 2,
      name: 'Novice Trainer',
      cardThreshold: 100,
      nextThreshold: 300,
      requirements: ['Collect 100 cards'],
      benefits: ['Deck builder access', 'Basic analytics']
    },
    {
      level: 3,
      name: 'Experienced Collector',
      cardThreshold: 300,
      nextThreshold: 600,
      requirements: ['Collect 300 cards', 'Complete 1 set'],
      benefits: ['Advanced filters', 'Price tracking']
    },
    {
      level: 4,
      name: 'Elite Trainer',
      cardThreshold: 600,
      nextThreshold: 1000,
      requirements: ['Collect 600 cards', 'Complete 3 sets', '$500+ collection value'],
      benefits: ['Premium analytics', 'Export features']
    },
    {
      level: 5,
      name: 'Master Collector',
      cardThreshold: 1000,
      nextThreshold: null,
      requirements: ['Collect 1000+ cards', 'Complete 5+ sets', '$1000+ collection value'],
      benefits: ['All features unlocked', 'Master badge', 'Community recognition']
    }
  ];

  // Calculate current user level
  const userLevel = useMemo((): UserLevel => {
    let currentLevel = levelDefinitions[0];
    
    for (const level of levelDefinitions) {
      if (totalCards >= level.cardThreshold) {
        currentLevel = level;
      } else {
        break;
      }
    }

    // Calculate progress to next level
    let progress = 100;
    if (currentLevel.nextThreshold) {
      const currentProgress = totalCards - currentLevel.cardThreshold;
      const totalNeeded = currentLevel.nextThreshold - currentLevel.cardThreshold;
      progress = (currentProgress / totalNeeded) * 100;
    }

    return {
      level: currentLevel.level,
      name: currentLevel.name,
      next: currentLevel.nextThreshold,
      progress: Math.min(100, Math.max(0, progress)),
      requirements: currentLevel.requirements,
      benefits: currentLevel.benefits
    };
  }, [totalCards]);

  // Calculate experience points (XP)
  const calculateXP = useMemo(() => {
    let xp = 0;
    
    // Base XP from cards
    xp += totalCards * 10;
    
    // Bonus XP from sets completed
    xp += setsCompleted * 500;
    
    // Bonus XP from collection value milestones
    const valueMilestones = [100, 250, 500, 1000, 2500, 5000];
    for (const milestone of valueMilestones) {
      if (totalValue >= milestone) {
        xp += milestone;
      }
    }
    
    return xp;
  }, [totalCards, totalValue, setsCompleted]);

  // Get next level requirements
  const getNextLevelRequirements = useMemo(() => {
    const nextLevelIndex = userLevel.level;
    if (nextLevelIndex >= levelDefinitions.length) {
      return [];
    }
    
    const nextLevel = levelDefinitions[nextLevelIndex];
    const requirements = [];
    
    if (totalCards < nextLevel.cardThreshold) {
      requirements.push(`Collect ${nextLevel.cardThreshold - totalCards} more cards`);
    }
    
    // Add other requirements based on level
    if (nextLevel.level >= 3 && setsCompleted < 1) {
      requirements.push('Complete your first set');
    }
    
    if (nextLevel.level >= 4 && setsCompleted < 3) {
      requirements.push(`Complete ${3 - setsCompleted} more sets`);
    }
    
    if (nextLevel.level >= 4 && totalValue < 500) {
      requirements.push(`Increase collection value by $${(500 - totalValue).toFixed(0)}`);
    }
    
    if (nextLevel.level >= 5 && setsCompleted < 5) {
      requirements.push(`Complete ${5 - setsCompleted} more sets`);
    }
    
    if (nextLevel.level >= 5 && totalValue < 1000) {
      requirements.push(`Increase collection value by $${(1000 - totalValue).toFixed(0)}`);
    }
    
    return requirements;
  }, [userLevel.level, totalCards, totalValue, setsCompleted]);

  // Check if user can level up
  const canLevelUp = useMemo(() => {
    return getNextLevelRequirements.length === 0 && userLevel.next !== null;
  }, [getNextLevelRequirements, userLevel.next]);

  // Get level rewards/benefits
  const getLevelBenefits = (level: number) => {
    const levelDef = levelDefinitions.find(l => l.level === level);
    return levelDef?.benefits || [];
  };

  // Calculate time to next level (estimated)
  const estimateTimeToNextLevel = useMemo(() => {
    if (!userLevel.next) return null;
    
    const cardsNeeded = userLevel.next - totalCards;
    
    // Assume average collection rate of 10 cards per week
    const averageCardsPerWeek = 10;
    const weeksNeeded = Math.ceil(cardsNeeded / averageCardsPerWeek);
    
    if (weeksNeeded <= 4) {
      return `${weeksNeeded} week${weeksNeeded !== 1 ? 's' : ''}`;
    } else {
      const monthsNeeded = Math.ceil(weeksNeeded / 4);
      return `${monthsNeeded} month${monthsNeeded !== 1 ? 's' : ''}`;
    }
  }, [userLevel.next, totalCards]);

  return {
    // Current level info
    userLevel,
    xp: calculateXP,
    
    // Progress info
    canLevelUp,
    nextLevelRequirements: getNextLevelRequirements,
    estimatedTimeToNextLevel: estimateTimeToNextLevel,
    
    // Utilities
    getLevelBenefits,
    levelDefinitions,
  };
};