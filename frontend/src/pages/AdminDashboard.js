import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  CalendarDaysIcon,
  TicketIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Tableau de bord administrateur
 * Permet la gestion complète des utilisateurs, événements et statistiques
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); // stats, users, events
  
  // États pour les données
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalTickets: 0,
    totalRevenue: 0
  });
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    if (user?.role !== 'admin') {
      toast.error('Accès non autorisé');
      navigate('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user, navigate]);

  // Récupérer toutes les données administrateur
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques
      const statsResponse = await adminAPI.getPlatformStats();
      setStats(statsResponse.data.data.stats);

      // Récupérer les utilisateurs
      const usersResponse = await adminAPI.getAllUsers({ limit: 100 });
      setUsers(usersResponse.data.data.users || []);

      // Récupérer tous les événements
      const eventsResponse = await adminAPI.getAllEvents({ limit: 100 });
      setEvents(eventsResponse.data.data.events || []);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (userId) => {
    try {
      await adminAPI.deleteUser(userId);
      toast.success('Utilisateur supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchAdminData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  // Activer/Désactiver un utilisateur
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      if (currentStatus === 'active') {
        await adminAPI.deactivateUser(userId);
        toast.success('Utilisateur désactivé');
      } else {
        await adminAPI.activateUser(userId);
        toast.success('Utilisateur activé');
      }
      fetchAdminData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  // Supprimer un événement
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await adminAPI.deleteUser(eventId); // TODO: Utiliser la bonne méthode
      toast.success('Événement supprimé avec succès');
      fetchAdminData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'événement');
    }
  };

  // Valider un événement
  const handleValidateEvent = async (eventId) => {
    try {
      await adminAPI.validateEvent(eventId);
      toast.success('Événement validé avec succès');
      fetchAdminData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la validation');
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
            <div className="flex items-center space-x-3 mb-2">
              <ShieldCheckIcon className="h-10 w-10 text-purple-500" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Tableau de bord administrateur
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Gestion complète de la plateforme EventMaster
            </p>
          </motion.div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <UsersIcon className="h-12 w-12 opacity-80" />
              <span className="text-4xl font-bold">{stats.totalUsers}</span>
            </div>
            <p className="text-blue-100 text-lg">Total Utilisateurs</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <CalendarDaysIcon className="h-12 w-12 opacity-80" />
              <span className="text-4xl font-bold">{stats.totalEvents}</span>
            </div>
            <p className="text-green-100 text-lg">Total Événements</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <TicketIcon className="h-12 w-12 opacity-80" />
              <span className="text-4xl font-bold">{stats.totalTickets}</span>
            </div>
            <p className="text-purple-100 text-lg">Tickets Vendus</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <ChartBarIcon className="h-12 w-12 opacity-80" />
              <span className="text-4xl font-bold">{stats.totalRevenue || 0}€</span>
            </div>
            <p className="text-yellow-100 text-lg">Revenu Total</p>
          </motion.div>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'text-purple-500 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Statistiques
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-purple-500 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Utilisateurs ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'events'
                  ? 'text-purple-500 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Événements ({events.length})
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          
          {/* Onglet: Statistiques */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Statistiques de la plateforme
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Statistiques utilisateurs */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <UsersIcon className="h-6 w-6 mr-2 text-blue-400" />
                    Utilisateurs
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total</span>
                      <span className="text-white font-semibold text-lg">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Administrateurs</span>
                      <span className="text-purple-400 font-semibold">
                        {users.filter(u => u.role === 'admin').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Utilisateurs actifs</span>
                      <span className="text-green-400 font-semibold">
                        {users.filter(u => u.status === 'active').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistiques événements */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <CalendarDaysIcon className="h-6 w-6 mr-2 text-green-400" />
                    Événements
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total</span>
                      <span className="text-white font-semibold text-lg">{stats.totalEvents}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Publiés</span>
                      <span className="text-green-400 font-semibold">
                        {events.filter(e => e.status === 'published').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">En attente</span>
                      <span className="text-yellow-400 font-semibold">
                        {events.filter(e => e.status === 'pending').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistiques tickets */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <TicketIcon className="h-6 w-6 mr-2 text-purple-400" />
                    Billetterie
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Tickets vendus</span>
                      <span className="text-white font-semibold text-lg">{stats.totalTickets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Revenu total</span>
                      <span className="text-green-400 font-semibold">{stats.totalRevenue || 0}€</span>
                    </div>
                  </div>
                </div>

                {/* Graphique ou info supplémentaire */}
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6 text-white">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <ChartBarIcon className="h-6 w-6 mr-2" />
                    Performance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-100">Taux de conversion</span>
                      <span className="font-semibold text-lg">
                        {stats.totalEvents > 0 ? ((stats.totalTickets / stats.totalEvents) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-100">Moyenne tickets/événement</span>
                      <span className="font-semibold text-lg">
                        {stats.totalEvents > 0 ? (stats.totalTickets / stats.totalEvents).toFixed(1) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet: Utilisateurs */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Gestion des utilisateurs
              </h2>

              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Utilisateur</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Rôle</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Statut</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Inscription</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userItem) => (
                        <tr key={userItem._id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  {userItem.firstName?.[0]}{userItem.lastName?.[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {userItem.firstName} {userItem.lastName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-300">{userItem.email}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              userItem.role === 'admin' 
                                ? 'bg-purple-600 text-white' 
                                : 'bg-blue-600 text-white'
                            }`}>
                              {userItem.role === 'admin' ? 'Admin' : 'Utilisateur'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              userItem.status === 'active' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-red-600 text-white'
                            }`}>
                              {userItem.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-300">
                            {formatDate(userItem.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleToggleUserStatus(userItem._id, userItem.status)}
                                className={`p-2 rounded-lg transition ${
                                  userItem.status === 'active'
                                    ? 'bg-yellow-600 hover:bg-yellow-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                                title={userItem.status === 'active' ? 'Désactiver' : 'Activer'}
                              >
                                {userItem.status === 'active' ? (
                                  <XMarkIcon className="h-4 w-4 text-white" />
                                ) : (
                                  <CheckCircleIcon className="h-4 w-4 text-white" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                                title="Supprimer"
                              >
                                <TrashIcon className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <UsersIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
          )}

          {/* Onglet: Événements */}
          {activeTab === 'events' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Gestion des événements
              </h2>

              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-700 rounded-lg overflow-hidden border border-gray-600 hover:border-gray-500 transition"
                    >
                      {/* Image */}
                      <div className="h-40 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <CalendarDaysIcon className="h-16 w-16 text-white opacity-50" />
                      </div>

                      {/* Contenu */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white truncate flex-1">
                            {event.title}
                          </h3>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            event.status === 'published' ? 'bg-green-600 text-white' :
                            event.status === 'pending' ? 'bg-yellow-600 text-white' :
                            'bg-red-600 text-white'
                          }`}>
                            {event.status === 'published' ? 'Publié' :
                             event.status === 'pending' ? 'En attente' : 'Brouillon'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4 text-sm">
                          <p className="text-gray-400">
                            Par: {event.organizer?.firstName} {event.organizer?.lastName}
                          </p>
                          <p className="text-gray-400">
                            Date: {formatDate(event.startDate)}
                          </p>
                          <p className="text-gray-400">
                            Places: {event.soldTickets || 0} / {event.totalCapacity}
                          </p>
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
                          {event.status === 'pending' && (
                            <button
                              onClick={() => handleValidateEvent(event._id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              <span>Valider</span>
                            </button>
                          )}
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
                  <p className="text-gray-400">Aucun événement trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-600 bg-opacity-20 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Confirmer la suppression</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ?
              Cette action est irréversible.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
