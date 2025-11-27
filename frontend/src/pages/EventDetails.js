import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  ClockIcon,
  TicketIcon,
  ArrowLeftIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { eventsAPI, ticketsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await eventsAPI.getById(id);
      setEvent(response.data.data.event);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'événement:', error);
      toast.error('Événement introuvable');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Gratuit' : `${price}€`;
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour acheter des tickets');
      navigate('/login');
      return;
    }

    setPurchasing(true);
    try {
      const ticketData = {
        eventId: event._id,
        quantity,
        customerInfo: isAuthenticated ? null : customerInfo
      };

      const response = await ticketsAPI.purchase(ticketData);
      
      toast.success('Tickets achetés avec succès !');
      setShowPurchaseModal(false);
      setQuantity(1);
      
      // Rediriger vers les tickets de l'utilisateur
      navigate('/my-tickets');
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'achat';
      toast.error(errorMessage);
    } finally {
      setPurchasing(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback - copier l'URL
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" text="Chargement de l'événement..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Événement introuvable</h2>
          <Link to="/events" className="btn-primary">
            Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  const isEventOwner = user && event.organizer._id === user._id;
  const canPurchase = event.availableTickets > 0 && event.status === 'published';

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container-custom">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="bg-gray-800 rounded-xl overflow-hidden mb-8">
              {/* Event Image */}
              <div className="relative h-64 md:h-96 bg-gradient-to-br from-blue-500 to-purple-600">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CalendarDaysIcon className="h-24 w-24 text-white opacity-50" />
                  </div>
                )}
                
                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Event Info */}
              <div className="p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                    {event.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    event.status === 'published' ? 'bg-green-600 text-white' :
                    event.status === 'draft' ? 'bg-yellow-600 text-white' :
                    'bg-red-600 text-white'
                  }`}>
                    {event.status === 'published' ? 'Publié' :
                     event.status === 'draft' ? 'Brouillon' : 'Annulé'}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {event.title}
                </h1>

                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CalendarDaysIcon className="h-6 w-6 text-blue-400 mt-1" />
                      <div>
                        <h3 className="text-white font-semibold">Dates</h3>
                        <p className="text-gray-400">
                          Début: {formatDate(event.startDate)}
                        </p>
                        <p className="text-gray-400">
                          Fin: {formatDate(event.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-6 w-6 text-blue-400 mt-1" />
                      <div>
                        <h3 className="text-white font-semibold">Lieu</h3>
                        <p className="text-gray-400">{event.venue.name}</p>
                        <p className="text-gray-400">
                          {event.venue.address.street}, {event.venue.address.city}
                        </p>
                        <p className="text-gray-400">
                          {event.venue.address.country}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CurrencyEuroIcon className="h-6 w-6 text-blue-400 mt-1" />
                      <div>
                        <h3 className="text-white font-semibold">Prix</h3>
                        <p className="text-gray-400">{formatPrice(event.ticketPrice)}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <UserGroupIcon className="h-6 w-6 text-blue-400 mt-1" />
                      <div>
                        <h3 className="text-white font-semibold">Capacité</h3>
                        <p className="text-gray-400">
                          {event.soldTickets} places vendues
                        </p>
                        <p className="text-gray-400">
                          {event.availableTickets} places disponibles
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizer Info */}
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">Organisateur</h3>
                  <p className="text-gray-400">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </p>
                  <p className="text-gray-400">{event.organizer.email}</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {event.objectives && event.objectives.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Objectifs</h3>
                <ul className="space-y-2">
                  {event.objectives.map((objective, index) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.requirements && event.requirements.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Prérequis</h3>
                <ul className="space-y-2">
                  {event.requirements.map((requirement, index) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <span className="text-yellow-400 mr-2">•</span>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Purchase Card */}
              <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Réserver vos places
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Prix unitaire</span>
                    <span className="text-white font-semibold">
                      {formatPrice(event.ticketPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Quantité</span>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                    >
                      {Array.from({ length: Math.min(event.availableTickets, 10) }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total</span>
                      <span className="text-xl font-bold text-white">
                        {formatPrice(event.ticketPrice * quantity)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowPurchaseModal(true)}
                  disabled={!canPurchase}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    canPurchase
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {!canPurchase
                    ? event.availableTickets === 0 ? 'Complet' : 'Non disponible'
                    : 'Acheter des tickets'
                  }
                </button>

                {event.availableTickets === 0 && (
                  <p className="text-red-400 text-sm mt-2 text-center">
                    Cet événement est complet
                  </p>
                )}
              </div>

              {/* Event Stats */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Informations
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Places totales</span>
                    <span className="text-white">{event.totalCapacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Places vendues</span>
                    <span className="text-white">{event.soldTickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Places restantes</span>
                    <span className="text-white">{event.availableTickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taux de remplissage</span>
                    <span className="text-white">
                      {Math.round((event.soldTickets / event.totalCapacity) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Confirmation d'achat
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Événement</span>
                <span className="text-white">{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Quantité</span>
                <span className="text-white">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Prix unitaire</span>
                <span className="text-white">{formatPrice(event.ticketPrice)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-gray-700 pt-2">
                <span className="text-white">Total</span>
                <span className="text-white">{formatPrice(event.ticketPrice * quantity)}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {purchasing ? 'Achat...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;