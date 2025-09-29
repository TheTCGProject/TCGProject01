import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCards } from '../services/api';
import { Search, Database, Layers, Share2, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import CardGrid from '../components/ui/CardGrid';
import SearchBar from "../components/ui/SearchBar";

const HomePage = () => {
  const { data: featuredCards, isLoading } = useQuery({
    queryKey: ['featuredCards'],
    queryFn: () => fetchCards({ 
      pageSize: 12, 
      orderBy: 'set.releaseDate',
      q: 'rarity:"Rare Holo" OR rarity:"Rare Ultra"'
    }),
  });
  
  const features = [
    {
      title: 'Comprehensive Card Database',
      description: 'Search and browse through thousands of Pokémon TCG cards with powerful filtering options and real-time market data.',
      icon: <Database className="w-8 h-8" />,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Intuitive Deck Builder',
      description: 'Create, edit and analyze your decks with our advanced deck builder featuring format validation and performance metrics.',
      icon: <Layers className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Share Your Creations',
      description: 'Export and share your decks with the Pokémon TCG community in multiple formats including PTCGO.',
      icon: <Share2 className="w-8 h-8" />,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const stats = [
    { label: 'Cards Available', value: '15,000+', icon: '🃏' },
    { label: 'Sets Covered', value: '100+', icon: '📚' },
    { label: 'Active Users', value: '50,000+', icon: '👥' },
    { label: 'Decks Created', value: '1M+', icon: '🎯' },
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-600 via-secondary-700 to-secondary-800">
        {/* Background Pattern */}
        <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20`}></div>
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <div className="animate-slide-up mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
                <Sparkles className="w-4 h-4 mr-2" />
                The most advanced Pokémon TCG platform
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Build Your Perfect{' '}
                <span className="bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
                  Pokémon
                </span>{' '}
                Deck
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl leading-relaxed">
                Explore thousands of cards, create powerful decks, and share them with the community. 
                The ultimate toolkit for Pokémon TCG enthusiasts.
              </p>
            </div>

            <div className="animate-slide-up w-full max-w-2xl mb-8" style={{ animationDelay: '200ms' }}>
              <SearchBar />
            </div>

            <div className="animate-slide-up flex flex-col sm:flex-row gap-4" style={{ animationDelay: '400ms' }}>
              <Button 
                variant="accent" 
                size="lg"
                as={Link}
                to="/cards"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="shadow-2xl hover:shadow-accent-500/25"
              >
                Explore Cards
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                as={Link}
                to="/decks/builder"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Start Building
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent-400/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need for Pokémon TCG
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              From casual collecting to competitive play, our platform provides all the tools you need to excel in the Pokémon Trading Card Game.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Cards Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-full text-secondary-700 dark:text-secondary-300 text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              Latest & Greatest
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Cards
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover the latest rare and ultra-rare Pokémon TCG releases with real-time market pricing and detailed information.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-12 h-12 border-4 border-secondary-200 dark:border-secondary-800 border-t-secondary-600 dark:border-t-secondary-400 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <CardGrid 
                cards={featuredCards?.data || []} 
                onCardClick={(card) => window.location.href = `/cards/${card.id}`}
                showDetails={true}
                className="mb-12"
              />
              
              <div className="text-center">
                <Button 
                  variant="primary" 
                  size="lg"
                  as={Link}
                  to="/cards"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="shadow-lg hover:shadow-xl"
                >
                  View All Cards
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary-600 to-secondary-700 relative overflow-hidden">
        <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20`}></div>
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Build Your Dream Deck?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of trainers who trust PokeNexus for their Pokémon TCG needs. Start building today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="accent" 
                size="lg"
                as={Link}
                to="/register"
                className="shadow-2xl hover:shadow-accent-500/25"
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                as={Link}
                to="/help"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;