import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Shuffle, 
  CheckSquare, 
  Bell, 
  Zap, 
  TrendingUp, 
  Target, 
  BarChart3,
  ArrowRight,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';

/**
 * Tool interface definition
 */
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'deck' | 'collection' | 'trading' | 'analysis';
  status: 'available' | 'coming-soon' | 'beta';
  color: string;
  features: string[];
  estimatedTime?: string;
}

/**
 * Available tools configuration
 */
const tools: Tool[] = [
  {
    id: 'set-checklist-generator',
    name: 'Set Checklist Generator',
    description: 'Generate printable checklists for any set to track your collection progress offline.',
    icon: <CheckSquare className="w-6 h-6" />,
    category: 'collection',
    status: 'available',
    color: 'bg-green-500',
    features: [
      'Customizable checklist formats',
      'Print-friendly layouts',
      'Progress tracking',
      'Rarity-based organization'
    ],
    estimatedTime: '2 min'
  },
  {
    id: 'trade-value-estimator',
    name: 'Trade Value Estimator',
    description: 'Calculate fair trade values between cards and collections to ensure balanced trades.',
    icon: <Calculator className="w-6 h-6" />,
    category: 'trading',
    status: 'coming-soon',
    color: 'bg-blue-500',
    features: [
      'Real-time market price comparison',
      'Condition-based value adjustments',
      'Multi-card trade calculations',
      'Trade fairness scoring'
    ],
    estimatedTime: '5 min'
  },
  {
    id: 'deck-mulligan-simulator',
    name: 'Deck Mulligan Simulator',
    description: 'Test your deck\'s opening hand consistency and mulligan decisions with statistical analysis.',
    icon: <Shuffle className="w-6 h-6" />,
    category: 'deck',
    status: 'coming-soon',
    color: 'bg-purple-500',
    features: [
      'Opening hand simulation',
      'Mulligan decision analysis',
      'Consistency statistics',
      'Optimal card ratios'
    ],
    estimatedTime: '3 min'
  },
  {
    id: 'price-alert-system',
    name: 'Price Alert System',
    description: 'Set up alerts for when cards reach your target buy or sell prices.',
    icon: <Bell className="w-6 h-6" />,
    category: 'trading',
    status: 'coming-soon',
    color: 'bg-orange-500',
    features: [
      'Custom price thresholds',
      'Email & browser notifications',
      'Price trend analysis',
      'Watchlist management'
    ],
    estimatedTime: '1 min setup'
  },
  {
    id: 'deck-analyzer',
    name: 'Advanced Deck Analyzer',
    description: 'Deep analysis of your deck\'s performance metrics, curve, and optimization suggestions.',
    icon: <BarChart3 className="w-6 h-6" />,
    category: 'deck',
    status: 'beta',
    color: 'bg-indigo-500',
    features: [
      'Mana curve analysis',
      'Type distribution charts',
      'Win condition assessment',
      'Meta comparison'
    ],
    estimatedTime: '4 min'
  },
  {
    id: 'collection-optimizer',
    name: 'Collection Optimizer',
    description: 'Optimize your collection value and identify the best cards to buy, sell, or trade.',
    icon: <Target className="w-6 h-6" />,
    category: 'collection',
    status: 'beta',
    color: 'bg-red-500',
    features: [
      'Value optimization suggestions',
      'Duplicate identification',
      'Investment recommendations',
      'Portfolio diversification'
    ],
    estimatedTime: '6 min'
  }
];

/**
 * Tools Page Component
 * Provides access to various Pokemon TCG tools and utilities
 */
const ToolsPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  // Get unique categories
  const categories = [
    { id: 'all', name: 'All Tools', icon: <Zap className="w-4 h-4" /> },
    { id: 'deck', name: 'Deck Building', icon: <Shuffle className="w-4 h-4" /> },
    { id: 'collection', name: 'Collection', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'trading', name: 'Trading', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'analysis', name: 'Analysis', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  // Filter tools by category
  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  // Get status badge styling
  const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'beta':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'coming-soon':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Get status text
  const getStatusText = (status: Tool['status']) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'beta':
        return 'Beta';
      case 'coming-soon':
        return 'Coming Soon';
      default:
        return 'Unknown';
    }
  };

  // Handle tool selection
  const handleToolClick = (tool: Tool) => {
    if (tool.status === 'available') {
      // Navigate to tool page
      navigate(`/tools/${tool.id}`);
    } else {
      // Show tool details modal
      setSelectedTool(tool);
    }
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Pokemon TCG Tools
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Powerful tools to enhance your Pokemon TCG experience. From deck analysis to collection management, 
          we've got everything you need to become a better player and collector.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all",
              selectedCategory === category.id
                ? "bg-primary-600 text-white shadow-md"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
            )}
          >
            {category.icon}
            <span className="ml-2">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {filteredTools.map((tool) => (
          <motion.div
            key={tool.id}
            variants={item}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => handleToolClick(tool)}
            whileHover={{ y: -4 }}
          >
            {/* Tool Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white", tool.color)}>
                  {tool.icon}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusBadge(tool.status))}>
                    {getStatusText(tool.status)}
                  </span>
                  {tool.estimatedTime && (
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {tool.estimatedTime}
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {tool.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {tool.description}
              </p>

              {/* Features List */}
              <div className="space-y-2">
                {tool.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                    {feature}
                  </div>
                ))}
                {tool.features.length > 3 && (
                  <div className="text-sm text-slate-500 dark:text-slate-500">
                    +{tool.features.length - 3} more features
                  </div>
                )}
              </div>
            </div>

            {/* Tool Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {tool.category} Tool
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Coming Soon Banner */}
      <div className="mt-16 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">More Tools Coming Soon!</h2>
        <p className="text-lg opacity-90 mb-6">
          We're constantly working on new tools to improve your Pokemon TCG experience. 
          Have an idea for a tool you'd like to see?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Users className="w-4 h-4 mr-2" />
            Join Our Community
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Request a Feature
          </Button>
        </div>
      </div>

      {/* Tool Details Modal */}
      {selectedTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white mr-4", selectedTool.color)}>
                    {selectedTool.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedTool.name}
                    </h3>
                    <span className={cn("inline-block px-2 py-1 rounded-full text-xs font-medium mt-1", getStatusBadge(selectedTool.status))}>
                      {getStatusText(selectedTool.status)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTool(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {selectedTool.description}
              </p>

              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {selectedTool.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                    {feature}
                  </div>
                ))}
              </div>

              {selectedTool.status === 'coming-soon' && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-800 dark:text-orange-400 mb-2">
                    Coming Soon
                  </h5>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    This tool is currently in development. We'll notify you when it becomes available!
                  </p>
                </div>
              )}

              {selectedTool.status === 'beta' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
                    Beta Version
                  </h5>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This tool is in beta testing. Some features may be limited or experimental.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedTool(null)}
              >
                Close
              </Button>
              {selectedTool.status === 'available' && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    setSelectedTool(null);
                    navigate(`/tools/${selectedTool.id}`);
                  }}
                >
                  Use Tool
                </Button>
              )}
              {selectedTool.status === 'coming-soon' && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => setSelectedTool(null)}
                >
                  Get Notified
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsPage;