import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserCircleIcon, PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    preferences: {
      language: user?.preferences?.language || 'fr',
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        sms: user?.preferences?.notifications?.sms ?? false
      }
    }
  });
  const [showPhone, setShowPhone] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('preferences.')) {
      const [preferenceType, preferenceKey] = name.split('.');
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [preferenceKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [name]: checked
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setEditing(false);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Mon profil</h1>
            <p className="text-gray-400">Gérez vos informations personnelles</p>
          </div>

          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            {!editing ? (
              <>
                {/* Profile Display */}
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCircleIcon className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-gray-400 mb-2">{user?.email}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user?.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'
                  }`}>
                    {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </div>

                {/* Profile Info */}
                <div className="space-y-6 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Prénom</span>
                    <span className="text-white">{user?.firstName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Nom</span>
                    <span className="text-white">{user?.lastName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Téléphone</span>
                    <span className="text-white">
                      {user?.phone ? (showPhone ? user.phone : '••••••••••') : 'Non renseigné'}
                    </span>
                    <button
                      onClick={() => setShowPhone(!showPhone)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {showPhone ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Langue</span>
                    <span className="text-white">
                      {user?.preferences?.language === 'fr' ? 'Français' : 'Anglais'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Notifications email</span>
                    <span className={`text-sm ${user?.preferences?.notifications?.email ? 'text-green-400' : 'text-gray-400'}`}>
                      {user?.preferences?.notifications?.email ? 'Activées' : 'Désactivées'}
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setEditing(true)}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <PencilIcon className="h-5 w-5" />
                  <span>Modifier le profil</span>
                </button>
              </>
            ) : (
              <>
                {/* Edit Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Prénom</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Nom</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>

                  <div>
                    <label className="form-label">Langue préférée</label>
                    <select
                      name="preferences.language"
                      value={formData.preferences.language}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="fr">Français</option>
                      <option value="en">Anglais</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">Notifications</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="email"
                          checked={formData.preferences.notifications.email}
                          onChange={handleNotificationChange}
                          className="mr-3"
                        />
                        <span className="text-gray-300">Recevoir les notifications par email</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="sms"
                          checked={formData.preferences.notifications.sms}
                          onChange={handleNotificationChange}
                          className="mr-3"
                        />
                        <span className="text-gray-300">Recevoir les notifications par SMS</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sauvegarde...</span>
                        </div>
                      ) : (
                        'Sauvegarder'
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;