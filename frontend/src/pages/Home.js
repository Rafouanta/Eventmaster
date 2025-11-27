import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  CalendarDaysIcon,
  TicketIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  StarIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Features data
  const features = [
    {
      icon: CalendarDaysIcon,
      title: 'Organisation simplifiée',
      description: 'Créez et gérez vos événements en quelques clics avec notre interface intuitive.'
    },
    {
      icon: UsersIcon,
      title: 'Gestion des participants',
      description: 'Suivez les inscriptions, gérez les listes de participants et communicates facilement.'
    },
    {
      icon: TicketIcon,
      description: 'Système de billetterie intégré pour vendre et distribuer vos tickets en toute sécurité.'
    },
    {
      icon: StarIcon,
      title: 'Expérience premium',
      description: 'Interface moderne et responsive pour une expérience utilisateur exceptionnelle.'
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Organisatrice d\'événements',
      content: 'EventMaster a révolutionné la façon dont j\'organise mes conférences. Simple, efficace et professionnel.',
      avatar: '👩‍💼'
    },
    {
      name: 'Pierre Martin',
      role: 'Festival Manager',
      content: 'La billetterie intégrée nous a fait gagner un temps précieux. Nos clients adorent l\'expérience !',
      avatar: '👨‍🎨'
    },
    {
      name: 'Sophie Laurent',
      role: 'Responsable communication',
      content: 'Interface magnifique et fonctionnalités complètes. Exactly ce qu\'il nous fallait pour nos événements.',
      avatar: '👩‍💻'
    }
  ];

  // Stats data
  const stats = [
    { label: 'Événements créés', value: '10,000+' },
    { label: 'Utilisateurs actifs', value: '50,000+' },
    { label: 'Tickets vendus', value: '500,000+' },
    { label: 'Note moyenne', value: '4.9/5' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with 3D animated background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 hero-bg">
          {/* Floating elements */}
          <div className="absolute top-20 left-20 w-4 h-4 bg-blue-500 rounded-full opacity-60 float"></div>
          <div className="absolute top-40 right-32 w-6 h-6 bg-purple-500 rounded-full opacity-40 float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-32 left-1/4 w-8 h-8 bg-indigo-500 rounded-full opacity-30 float" style={{ animationDelay: '4s' }}></div>
          <div className="absolute top-1/3 right-20 w-5 h-5 bg-pink-500 rounded-full opacity-50 float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 right-1/3 w-7 h-7 bg-cyan-500 rounded-full opacity-40 float" style={{ animationDelay: '3s' }}></div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8">
              Bienvenue sur{' '}
              <span className="text-gradient">EventMaster</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Organisez vos conférences, soirées, festivals ou rencontres en toute simplicité.
              Une plateforme élégante, rapide et pensée pour offrir une expérience optimale à chaque utilisateur.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button
                onClick={handleGetStarted}
                className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
              >
                <span>🔷 Créer un événement</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              
              <Link
                to="/events"
                className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
              >
                <span>🔷 Réserver un ticket</span>
                <TicketIcon className="h-5 w-5" />
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher des événements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pl-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-300" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors"
                >
                  Rechercher
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pourquoi choisir EventMaster ?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Une solution complète pour tous vos besoins en matière d'événements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Des milliers d'organisateurs nous font confiance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-2xl p-8 border border-gray-700"
              >
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-gray-400 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Prêt à créer votre premier événement ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'organisateurs qui font confiance à EventMaster
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>Commencer gratuitement</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              <Link
                to="/events"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <span>Explorer les événements</span>
                <PlayCircleIcon className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;