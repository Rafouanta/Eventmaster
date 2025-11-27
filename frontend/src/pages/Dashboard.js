import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  TicketIcon,
  PlusCircleIcon,
  UserCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { usersAPI, eventsAPI, ticketsAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Tableau de bord utilisateur
 * Affiche les événements créés, les tickets achetés et les informations du profil
 */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, events, tickets, profile
  
  // États pour les données
  const [myEvents, setMyEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTickets: 0,
    upcomingEvents: 0,
    totalSpent: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Récupérer toutes les données du dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les événements créés par l'utilisateur
      const eventsResponse = await eventsAPI.getMyEvents({ limit: 100 });
      const events = eventsResponse.data.data.events || [];
      setMyEvents(events);

      // Récupérer les tickets achetés
      try {
        const ticketsResponse = await ticketsAPI.getMyTickets({ limit: 100 });
        const tickets = ticketsResponse.data.data.tickets || [];
        setMyTickets(tickets);
        
        // Calculer les statistiques
        const totalSpent = tickets.reduce((sum, ticket) => sum + (ticket.totalPrice || 0), 0);
        
        setStats({
          totalEvents: events.length,
          totalTickets: tickets.length,
          upcomingEvents: events.filter(e => new Date(e.startDate) > new Date()).length,
          totalSpent: totalSpent
        });
      } catch (error) {
        console.log('Tickets endpoint not available yet');
        setStats({
          totalEvents: events.length,
          totalTickets: 0,
          upcomingEvents: events.filter(e => new Date(e.startDate) > new Date()).length,
          totalSpent: 0
        });
      }

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un événement
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await eventsAPI.delete(eventId);
      toast.success('Événement supprimé avec succès');
      fetchDashboardData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'événement');
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formater le prix
  const formatPrice = (price) => {
    return price === 0 ? 'Gratuit' : `${price.toFixed(2)}€`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" text="Chargement du tableau de bord..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container-custom">
        {/* En-tête */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Tableau de bord
            </h1>
            <p className="text-gray-400 text-lg">
              Bienvenue, {user?.firstName} {user?.lastName} ! 👋
            </p>
          </motion.div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <CalendarDaysIcon className="h-10 w-10 opacity-80" />
              <span className="text-3xl font-bold">{stats.totalEvents}</span>
            </div>
            <p className="text-blue-100">Événements créés</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <TicketIcon className="h-10 w-10 opacity-80" />
              <span className="text-3xl font-bold">{stats.totalTickets}</span>
            </div>
            <p className="text-green-100">Tickets achetés</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="h-10 w-10 opacity-80" />
              <span className="text-3xl font-bold">{stats.upcomingEvents}</span>
            </div>
            <p className="text-purple-100">Événements à venir</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <CurrencyEuroIcon className="h-10 w-10 opacity-80" />
              <span className="text-3xl font-bold">{stats.totalSpent.toFixed(0)}€</span>
            </div>
            <p className="text-yellow-100">Total dépensé</p>
          </motion.div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/create-event"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl p-6 text-white transition-all transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <PlusCircleIcon className="h-8 w-8" />
              <div>
                <h3 className="text-lg font-semibold">Créer un événement</h3>
                <p className="text-sm text-blue-100">Organisez votre prochain événement</p>
              </div>
            </div>
          </Link>

          <Link
            to="/events"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 text-white transition-all"
          >
            <div className="flex items-center space-x-4">
              <CalendarDaysIcon className="h-8 w-8 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold">Explorer</h3>
                <p className="text-sm text-gray-400">Découvrir des événements</p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 text-white transition-all"
          >
            <div className="flex items-center space-x-4">
              <UserCircleIcon className="h-8 w-8 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold">Mon profil</h3>
                <p className="text-sm text-gray-400">Gérer mes informations</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'events'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mes événements ({stats.totalEvents})
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'tickets'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mes tickets ({stats.totalTickets})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mon profil
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          
          {/* Onglet: Mes événements */}
          {activeTab === 'events' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Mes événements créés
                </h2>
                <Link
                  to="/create-event"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                  <span>Nouveau</span>
                </Link>
              </div>

              {myEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myEvents.map((event) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600 hover:border-gray-500 transition"
                    >
                      {/* Image de l'événement */}
                      <div className="h-40 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <CalendarDaysIcon className="h-16 w-16 text-white opacity-50" />
                      </div>

                      {/* Contenu */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2 truncate">
                          {event.title}
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-400 text-sm">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {formatDate(event.startDate)}
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {event.venue?.city || 'Non spécifié'}
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <UserGroupIcon className="h-4 w-4 mr-2" />
                            {event.soldTickets || 0} / {event.totalCapacity} places
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/events/${event._id}`)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span>Voir</span>
                          </button>
                          <button
                            onClick={() => navigate(`/events/${event._id}/edit`)}
                            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition"
                          >
                            <PencilIcon className="h-4 w-4" />
                            <span>Modifier</span>
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Aucun événement créé
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Commencez à organiser vos événements dès maintenant
                  </p>
                  <Link
                    to="/create-event"
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                    <span>Créer mon premier événement</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Onglet: Mes tickets */}
          {activeTab === 'tickets' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Mes tickets achetés
              </h2>

              {myTickets.length > 0 ? (
                <div className="space-y-4">
                  {myTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      className="bg-gray-700 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {ticket.event?.title || 'Événement'}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-gray-400">
                              <TicketIcon className="h-4 w-4 mr-2" />
                              Ticket #{ticket.ticketNumber}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <ClockIcon className="h-4 w-4 mr-2" />
                              {formatDate(ticket.event?.startDate)}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <UserGroupIcon className="h-4 w-4 mr-2" />
                              Quantité: {ticket.quantity}
                            </div>
                            <div className="flex items-center text-gray-400">
                              <CurrencyEuroIcon className="h-4 w-4 mr-2" />
                              {formatPrice(ticket.totalPrice)}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            ticket.status === 'active' ? 'bg-green-600 text-white' :
                            ticket.status === 'used' ? 'bg-blue-600 text-white' :
                            'bg-red-600 text-white'
                          }`}>
                            {ticket.status === 'active' ? 'Actif' :
                             ticket.status === 'used' ? 'Utilisé' : 'Annulé'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TicketIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Aucun ticket acheté
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Explorez nos événements et réservez vos places
                  </p>
                  <Link
                    to="/events"
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
                  >
                    <CalendarDaysIcon className="h-5 w-5" />
                    <span>Découvrir les événements</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Onglet: Mon profil */}
          {activeTab === 'profile' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Informations du profil
                </h2>
                <Link
                  to="/profile"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
                >
                  <PencilIcon className="h-5 w-5" />
                  <span>Modifier</span>
                </Link>
              </div>

              <div className="space-y-6">
                {/* Photo de profil */}
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="h-16 w-16 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-gray-400">{user?.email}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                      user?.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                      {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </span>
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Prénom</p>
                    <p className="text-white font-medium">{user?.firstName}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Nom</p>
                    <p className="text-white font-medium">{user?.lastName}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Email</p>
                    <p className="text-white font-medium">{user?.email}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Téléphone</p>
                    <p className="text-white font-medium">{user?.phone || 'Non renseigné'}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Membre depuis</p>
                    <p className="text-white font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Rôle</p>
                    <p className="text-white font-medium capitalize">{user?.role || 'Utilisateur'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
