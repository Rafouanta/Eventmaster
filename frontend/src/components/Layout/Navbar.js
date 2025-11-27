import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  PlusCircleIcon,
  TicketIcon,
  CalendarDaysIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

/**
 * Composant Navbar - Barre de navigation principale de l'application
 * Gère la navigation, l'authentification et le menu utilisateur
 */
const Navbar = () => {
  // États locaux pour gérer l'ouverture des menus
  const [isOpen, setIsOpen] = useState(false); // Menu mobile
  const [showUserMenu, setShowUserMenu] = useState(false); // Menu dropdown utilisateur
  
  // Hooks pour l'authentification et la navigation
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Gère la déconnexion de l'utilisateur
   * Déconnecte, redirige vers l'accueil et ferme le menu
   */
  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  // Navigation pour les utilisateurs non connectés
  const publicNavigation = [
    { name: 'Événements', href: '/events', current: location.pathname === '/events' },
    { name: 'Contact', href: '/contact', current: location.pathname === '/contact' }
  ];

  // Navigation pour les utilisateurs connectés (avec Dashboard)
  const authenticatedNavigation = [
    { name: 'Événements', href: '/events', current: location.pathname === '/events' },
    { name: 'Dashboard', href: '/dashboard', current: location.pathname === '/dashboard' },
    { name: 'Contact', href: '/contact', current: location.pathname === '/contact' }
  ];

  // Menu utilisateur dans le dropdown
  const userNavigation = [
    { name: 'Mes événements', href: '/my-events', icon: CalendarDaysIcon },
    { name: 'Mes tickets', href: '/my-tickets', icon: TicketIcon },
    { name: 'Créer un événement', href: '/create-event', icon: PlusCircleIcon }
  ];

  // Menu administrateur (visible uniquement pour les admins)
  const adminNavigation = [
    { name: 'Administration', href: '/admin', icon: Cog6ToothIcon }
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          
          {/* Section gauche: Bouton retour + Logo */}
          <div className="flex items-center space-x-4">
            {/* Bouton retour à l'accueil - visible uniquement si on n'est pas sur la page d'accueil */}
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
                title="Retour à l'accueil"
              >
                <div className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <ArrowLeftIcon className="h-5 w-5" />
                </div>
              </Link>
            )}
            
            {/* Logo EventMaster */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EM</span>
              </div>
              <span className="text-xl font-bold text-white">EventMaster</span>
            </Link>
          </div>

          {/* Navigation principale - Desktop uniquement */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {/* Affiche la navigation selon l'état d'authentification */}
              {(isAuthenticated ? authenticatedNavigation : publicNavigation).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Section droite - Menu utilisateur ou boutons d'authentification */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isAuthenticated ? (
                // Menu utilisateur connecté
                <div className="relative">
                  {/* Bouton du menu utilisateur */}
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 px-3 py-2 rounded-md"
                  >
                    {/* Avatar ou icône par défaut */}
                    {user?.avatar ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                    ) : (
                      <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>

                  {/* Menu dropdown utilisateur */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                      {/* Informations utilisateur */}
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                        {/* Badge du rôle */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                        </span>
                      </div>

                      {/* Liens du menu */}
                      <div className="py-1">
                        {/* Menu utilisateur standard */}
                        {userNavigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                              <Icon className="h-4 w-4 mr-3" />
                              {item.name}
                            </Link>
                          );
                        })}

                        {/* Menu administrateur (visible uniquement pour les admins) */}
                        {user?.role === 'admin' && (
                          <>
                            <div className="border-t border-gray-700 my-1"></div>
                            {adminNavigation.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.name}
                                  to={item.href}
                                  onClick={() => setShowUserMenu(false)}
                                  className="flex items-center px-4 py-2 text-sm text-purple-300 hover:bg-gray-700 hover:text-white"
                                >
                                  <Icon className="h-4 w-4 mr-3" />
                                  {item.name}
                                </Link>
                              );
                            })}
                          </>
                        )}

                        <div className="border-t border-gray-700 my-1"></div>
                        
                        {/* Lien vers le profil */}
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <UserCircleIcon className="h-4 w-4 mr-3" />
                          Profil
                        </Link>

                        {/* Bouton de déconnexion */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-gray-700 hover:text-white"
                        >
                          <ArrowRightStartOnRectangleIcon className="h-4 w-4 mr-3" />
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Boutons pour utilisateurs non connectés
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" />
              ) : (
                <Bars3Icon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile - visible uniquement sur petits écrans */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-800">
              {/* Liens de navigation mobile */}
              {(isAuthenticated ? authenticatedNavigation : publicNavigation).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    item.current
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthenticated ? (
                // Section utilisateur connecté
                <>
                  <div className="border-t border-gray-800 my-4"></div>
                  
                  {/* Informations utilisateur */}
                  <div className="px-3 py-2">
                    <div className="flex items-center">
                      {user?.avatar ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                        />
                      ) : (
                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      )}
                      <div className="ml-3">
                        <p className="text-white font-medium">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu utilisateur mobile */}
                  <div className="space-y-1">
                    {userNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="h-5 w-5 mr-3" />
                          {item.name}
                        </Link>
                      );
                    })}

                    {/* Menu admin mobile (si admin) */}
                    {user?.role === 'admin' && (
                      <>
                        <div className="border-t border-gray-800 my-2"></div>
                        {adminNavigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-purple-300 hover:bg-gray-700 hover:text-white"
                              onClick={() => setIsOpen(false)}
                            >
                              <Icon className="h-5 w-5 mr-3" />
                              {item.name}
                            </Link>
                          );
                        })}
                      </>
                    )}

                    <div className="border-t border-gray-800 my-2"></div>

                    {/* Lien profil mobile */}
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserCircleIcon className="h-5 w-5 mr-3" />
                      Profil
                    </Link>

                    {/* Bouton déconnexion mobile */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-gray-700 hover:text-white"
                    >
                      <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-3" />
                      Se déconnecter
                    </button>
                  </div>
                </>
              ) : (
                // Boutons pour utilisateurs non connectés (mobile)
                <div className="border-t border-gray-800 my-4 space-y-1">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => setIsOpen(false)}
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fond sombre pour fermer le menu utilisateur en cliquant à l'extérieur */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;