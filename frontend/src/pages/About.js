import React from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarDaysIcon, 
  UsersIcon, 
  ShieldCheckIcon, 
  LightBulbIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const features = [
    {
      icon: CalendarDaysIcon,
      title: 'Organisation simplifiée',
      description: 'Créez et gérez vos événements en quelques clics avec notre interface intuitive.'
    },
    {
      icon: UsersIcon,
      title: 'Gestion des participants',
      description: 'Suivez les inscriptions, gérez les listes de participants et communicate facilement.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Sécurité renforcée',
      description: 'Vos données sont protégées avec les dernières technologies de sécurité.'
    },
    {
      icon: LightBulbIcon,
      title: 'Innovation continue',
      description: 'Des fonctionnalités toujours plus modernes pour améliorer votre expérience.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Événements créés' },
    { number: '50,000+', label: 'Utilisateurs actifs' },
    { number: '500,000+', label: 'Tickets vendus' },
    { number: '4.9/5', label: 'Note moyenne' }
  ];

  const team = [
    {
      name: 'Équipe EventMaster',
      role: 'Fondateurs',
      description: 'Passionnés par l\'organisation d\'événements et la technologie.',
      avatar: '👥'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      {/* Hero Section */}
      <section className="py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              À propos d'<span className="text-gradient">EventMaster</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
              Nous révolutionnons l'organisation d'événements en offrant une plateforme 
              intuitive, moderne et complète pour tous vos besoins événementiels.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Notre mission
              </h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Chez EventMaster, nous croyons que chaque événement mérite d'être exceptionnel. 
                Notre mission est de démocratiser l'organisation d'événements en fournissant 
                des outils puissants et accessibles à tous.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Que vous organisiez une conférence professionnelle, une soirée privée, 
                un festival ou un atelier, nous vous accompagnons de la création à la 
                réalisation de votre événement.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-center">
                <HeartIcon className="h-16 w-16 text-white mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Fait avec passion</h3>
                <p className="text-blue-100">
                  Chaque fonctionnalité est conçue avec amour pour vous offrir 
                  la meilleure expérience possible.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Découvrez ce qui fait d'EventMaster la plateforme de référence pour l'organisation d'événements
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
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
      <section className="py-16 bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Nos chiffres parlent d'eux-mêmes
            </h2>
            <p className="text-xl text-gray-400">
              La confiance que nous accordent nos utilisateurs
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Notre équipe
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Une équipe passionnée dédiée à votre succès
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700"
              >
                <div className="text-6xl mb-4">{member.avatar}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                <p className="text-blue-400 mb-4">{member.role}</p>
                <p className="text-gray-400">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Nos valeurs
            </h2>
            <p className="text-xl text-gray-400">
              Les principes qui guident notre travail
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-3">Excellence</h3>
              <p className="text-gray-400">
                Nous visons l'excellence dans chaque fonctionnalité que nous développons.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-white mb-3">Collaboration</h3>
              <p className="text-gray-400">
                Nous travaillons ensemble avec nos utilisateurs pour améliorer constamment notre plateforme.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-semibold text-white mb-3">Innovation</h3>
              <p className="text-gray-400">
                Nous innovons constamment pour rester à la pointe de la technologie.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à commencer votre aventure avec nous ?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'organisateurs qui font déjà confiance à EventMaster
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="btn-primary"
              >
                Créer un compte gratuit
              </a>
              <a
                href="/events"
                className="btn-secondary"
              >
                Découvrir les événements
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;