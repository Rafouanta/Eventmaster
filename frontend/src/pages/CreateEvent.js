import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarDaysIcon, 
  TicketIcon, 
  UserGroupIcon,
  PhotoIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { eventsAPI } from '../services/api';

/**
 * Page de création d'événement
 * Permet aux utilisateurs d'enregistrer un nouvel événement avec tous les détails
 */
const CreateEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État du formulaire avec tous les champs requis
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    category: 'conference',
    startDate: '',
    endDate: '',
    venueName: '',
    venueStreet: '',
    venueCity: '',
    venuePostalCode: '',
    venueCountry: 'France',
    ticketPrice: '',
    totalCapacity: '',
    image: null,
    imagePreview: null
  });

  // Gestion des changements dans les champs texte
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion de l'upload d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }

      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation des dates
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end <= start) {
        toast.error('La date de fin doit être après la date de début');
        setIsSubmitting(false);
        return;
      }

      // Préparer les données pour l'API
      const eventData = {
        title: formData.title,
        description: formData.description,
        theme: formData.theme,
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate,
        venue: {
          name: formData.venueName,
          address: {
            street: formData.venueStreet,
            city: formData.venueCity,
            postalCode: formData.venuePostalCode,
            country: formData.venueCountry
          }
        },
        ticketPrice: parseFloat(formData.ticketPrice),
        totalCapacity: parseInt(formData.totalCapacity)
      };

      // TODO: Gérer l'upload de l'image si nécessaire
      // Pour l'instant, on envoie les données sans l'image
      
      const response = await eventsAPI.create(eventData);
      
      toast.success('Événement créé avec succès!');
      navigate('/my-events');
      
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la création de l\'événement');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Statistiques à afficher
  const stats = [
    {
      icon: CalendarDaysIcon,
      value: '200',
      label: 'Événements annuels',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: TicketIcon,
      value: '1000',
      label: 'Billets vendus annuellement',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: UserGroupIcon,
      value: '5000+',
      label: 'Participants satisfaits',
      color: 'from-green-500 to-green-600'
    }
  ];

  // Catégories d'événements disponibles
  const categories = [
    { value: 'conference', label: 'Conférence' },
    { value: 'workshop', label: 'Atelier' },
    { value: 'seminar', label: 'Séminaire' },
    { value: 'concert', label: 'Concert' },
    { value: 'festival', label: 'Festival' },
    { value: 'sports', label: 'Sport' },
    { value: 'networking', label: 'Networking' },
    { value: 'exhibition', label: 'Exhibition' },
    { value: 'party', label: 'Soirée' },
    { value: 'other', label: 'Autre' }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Section Hero */}
      <section className="bg-gradient-to-b from-gray-800 to-gray-900 py-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Créer un événement
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-300 mb-8">
              Nous sommes là pour vous aider à organiser votre événement. 
              Remplissez simplement le formulaire ci-dessous.
            </h2>
          </motion.div>
        </div>
      </section>

      {/* Section Chiffres Clés */}
      <section className="py-16 bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center hover:border-gray-600 transition-all"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-6`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-3">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-lg">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Formulaire */}
      <section className="py-16 bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                📝 Détails de l'événement
              </h2>
              <p className="text-gray-400 text-lg">
                Remplissez toutes les informations nécessaires
              </p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8 md:p-10 border border-gray-700">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Informations de base */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                    Informations de base
                  </h3>

                  {/* Titre */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                      Titre de l'événement <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      minLength={5}
                      maxLength={200}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Conférence Tech 2024"
                    />
                  </div>

                  {/* Thème */}
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-300 mb-2">
                      Thème <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="theme"
                      name="theme"
                      value={formData.theme}
                      onChange={handleChange}
                      required
                      minLength={3}
                      maxLength={100}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Innovation et Technologie"
                    />
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      minLength={10}
                      maxLength={2000}
                      rows="5"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Décrivez votre événement en détail..."
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      {formData.description.length}/2000 caractères
                    </p>
                  </div>

                  {/* Image */}
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
                      Image de l'événement
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 hover:bg-gray-600 transition flex items-center justify-center">
                          <PhotoIcon className="h-5 w-5 mr-2" />
                          {formData.image ? formData.image.name : 'Choisir une image'}
                        </div>
                        <input
                          type="file"
                          id="image"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {formData.imagePreview && (
                      <div className="mt-4">
                        <img
                          src={formData.imagePreview}
                          alt="Prévisualisation"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates et horaires */}
                <div className="space-y-6 pt-6 border-t border-gray-700">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                    Dates et horaires
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date de début */}
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
                        Date et heure de début <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="datetime-local"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Date de fin */}
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
                        Date et heure de fin <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="datetime-local"
                          id="endDate"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lieu */}
                <div className="space-y-6 pt-6 border-t border-gray-700">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                    Lieu de l'événement
                  </h3>

                  {/* Nom du lieu */}
                  <div>
                    <label htmlFor="venueName" className="block text-sm font-medium text-gray-300 mb-2">
                      Nom du lieu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        id="venueName"
                        name="venueName"
                        value={formData.venueName}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Centre de Conférences Paris"
                      />
                    </div>
                  </div>

                  {/* Adresse */}
                  <div>
                    <label htmlFor="venueStreet" className="block text-sm font-medium text-gray-300 mb-2">
                      Adresse <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="venueStreet"
                      name="venueStreet"
                      value={formData.venueStreet}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Rue de la République"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ville */}
                    <div>
                      <label htmlFor="venueCity" className="block text-sm font-medium text-gray-300 mb-2">
                        Ville <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="venueCity"
                        name="venueCity"
                        value={formData.venueCity}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Paris"
                      />
                    </div>

                    {/* Code postal */}
                    <div>
                      <label htmlFor="venuePostalCode" className="block text-sm font-medium text-gray-300 mb-2">
                        Code postal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="venuePostalCode"
                        name="venuePostalCode"
                        value={formData.venuePostalCode}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="75001"
                      />
                    </div>

                    {/* Pays */}
                    <div>
                      <label htmlFor="venueCountry" className="block text-sm font-medium text-gray-300 mb-2">
                        Pays <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="venueCountry"
                        name="venueCountry"
                        value={formData.venueCountry}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="France"
                      />
                    </div>
                  </div>
                </div>

                {/* Billetterie */}
                <div className="space-y-6 pt-6 border-t border-gray-700">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
                    Billetterie
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Prix du ticket */}
                    <div>
                      <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-300 mb-2">
                        Prix du ticket (€) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <CurrencyEuroIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          id="ticketPrice"
                          name="ticketPrice"
                          value={formData.ticketPrice}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-gray-500 text-sm mt-1">
                        Mettez 0 pour un événement gratuit
                      </p>
                    </div>

                    {/* Nombre de places */}
                    <div>
                      <label htmlFor="totalCapacity" className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre de places disponibles <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          id="totalCapacity"
                          name="totalCapacity"
                          value={formData.totalCapacity}
                          onChange={handleChange}
                          required
                          min="1"
                          max="10000"
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note informative */}
                <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-4">
                  <p className="text-blue-400 text-sm">
                    <strong>Note :</strong> Tous les champs marqués d'un astérisque (*) sont obligatoires. 
                    Vous pourrez modifier votre événement après sa création.
                  </p>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => navigate('/my-events')}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-8 rounded-lg transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? 'Création en cours...' : 'Créer l\'événement'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CreateEvent;
