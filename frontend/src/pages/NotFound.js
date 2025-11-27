import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-500">404</h1>
          <div className="text-6xl mb-4">🎭</div>
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-4">
          Page non trouvée
        </h2>
        
        <p className="text-xl text-gray-400 mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition inline-block"
          >
            Retour à l'accueil
          </Link>
          
          <Link
            to="/events"
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition inline-block"
          >
            Voir les événements
          </Link>
        </div>
        
        <div className="mt-12">
          <p className="text-gray-500 text-sm">
            Besoin d'aide? <Link to="/contact" className="text-blue-500 hover:text-blue-400">Contactez-nous</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
