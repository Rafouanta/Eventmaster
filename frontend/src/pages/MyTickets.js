import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TicketIcon, 
  CalendarDaysIcon, 
  MapPinIcon, 
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { ticketsAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Page "Mes tickets"
 * Affiche tous les tickets achetés par l'utilisateur
 * Permet de filtrer, rechercher et gérer les tickets
 */
const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const [searchQuery, setSearchQuery] = useState('');

  // Charger les tickets au montage du composant
  useEffect(() => {
    fetchTickets();
  }, []);

  /**
   * Récupère les tickets de l'utilisateur depuis l'API
   */
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getMyTickets();
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error);
      toast.error('Impossible de charger vos tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Annule un ticket
   */
  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce ticket ?')) {
      return;
    }

    try {
      await ticketsAPI.cancel(ticketId);
      toast.success('Ticket annulé avec succès');
      fetchTickets(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error('Impossible d\'annuler ce ticket');
    }
  };

  /**
   * Formate une date en français
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Détermine le statut d'un ticket
   */
  const getTicketStatus = (ticket) => {
    if (ticket.status === 'cancelled') {
      return { label: 'Annulé', color: 'bg-red-600', icon: XCircleIcon };
    }
    
    const eventDate = new Date(ticket.event.startDate);
    const now = new Date();
    
    if (eventDate < now) {
      return { label: 'Passé', color: 'bg-gray-600', icon: ClockIcon };
    }
    
    return { label: 'Valide', color: 'bg-green-600', icon: CheckCircleIcon };
  };

  /**
   * Filtre les tickets selon le filtre actif
   */
  const getFilteredTickets = () => {
    let filtered = tickets;

    // Filtre par statut
    if (filter === 'upcoming') {
      filtered = filtered.filter(ticket => {
        const eventDate = new Date(ticket.event.startDate);
        return eventDate > new Date() && ticket.status !== 'cancelled';
      });
    } else if (filter === 'past') {
      filtered = filtered.filter(ticket => {
        const eventDate = new Date(ticket.event.startDate);
        return eventDate < new Date();
      });
    } else if (filter === 'cancelled') {
      filtered = filtered.filter(ticket => ticket.status === 'cancelled');
    }

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(ticket =>
        ticket.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTickets = getFilteredTickets();

  // Statistiques des tickets
  const stats = {
    total: tickets.length,
    upcoming: tickets.filter(t => new Date(t.event.startDate) > new Date() && t.status !== 'cancelled').length,
    past: tickets.filter(t => new Date(t.event.startDate) < new Date()).length,
    cancelled: tickets.filter(t => t.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" text="Chargement de vos tickets..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container-custom">
        
        {/* En-tête */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Mes tickets
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Gérez et consultez tous vos tickets d'événements
            </p>
          </motion.div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center"
          >
            <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
            <div className="text-gray-400 text-sm">Total</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center"
          >
            <div className="text-3xl font-bold text-green-500 mb-2">{stats.upcoming}</div>
            <div className="text-gray-400 text-sm">À venir</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center"
          >
            <div className="text-3xl font-bold text-gray-500 mb-2">{stats.past}</div>
            <div className="text-gray-400 text-sm">Passés</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center"
          >
            <div className="text-3xl font-bold text-red-500 mb-2">{stats.cancelled}</div>
            <div className="text-gray-400 text-sm">Annulés</div>
          </motion.div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-8 space-y-4">
          {/* Recherche */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un ticket par nom d'événement ou numéro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Tous ({stats.total})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              À venir ({stats.upcoming})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Passés ({stats.past})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Annulés ({stats.cancelled})
            </button>
          </div>
        </div>

        {/* Liste des tickets */}
        {filteredTickets.length > 0 ? (
          <div className="space-y-6">
            {filteredTickets.map((ticket, index) => {
              const status = getTicketStatus(ticket);
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={ticket._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      
                      {/* Icône du ticket */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                          <TicketIcon className="h-10 w-10 text-white" />
                        </div>
                      </div>

                      {/* Informations de l'événement */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-1">
                              {ticket.event.title}
                            </h3>
                            <div className="flex items-center text-gray-400 text-sm space-x-4">
                              <span className="flex items-center">
                                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                {formatDate(ticket.event.startDate)}
                              </span>
                              <span className="flex items-center">
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {ticket.event.venue.city}
                              </span>
                            </div>
                          </div>
                          
                          {/* Badge de statut */}
                          <span className={`flex items-center px-3 py-1 ${status.color} text-white rounded-full text-sm font-medium`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {status.label}
                          </span>
                        </div>

                        {/* Détails du ticket */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          <span>
                            <strong className="text-gray-300">Numéro:</strong> {ticket.ticketNumber}
                          </span>
                          <span>
                            <strong className="text-gray-300">Quantité:</strong> {ticket.quantity} ticket(s)
                          </span>
                          <span>
                            <strong className="text-gray-300">Prix total:</strong> {ticket.totalPrice}€
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/events/${ticket.event._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition text-center"
                        >
                          Voir l'événement
                        </Link>
                        
                        {status.label === 'Valide' && (
                          <>
                            <button
                              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center"
                            >
                              <QrCodeIcon className="h-4 w-4 mr-1" />
                              QR Code
                            </button>
                            <button
                              onClick={() => handleCancelTicket(ticket._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                            >
                              Annuler
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          // Message si aucun ticket
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700"
          >
            <TicketIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchQuery ? 'Aucun ticket trouvé' : 'Aucun ticket dans cette catégorie'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'Essayez avec d\'autres mots-clés'
                : tickets.length === 0
                  ? 'Vous n\'avez pas encore acheté de tickets pour des événements'
                  : 'Changez de filtre pour voir vos autres tickets'
              }
            </p>
            {tickets.length === 0 && (
              <Link
                to="/events"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Découvrir des événements
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
