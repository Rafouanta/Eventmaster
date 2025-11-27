import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'À propos', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Événements', href: '/events' },
      { name: 'Créer un événement', href: '/create-event' }
    ],
    support: [
      { name: 'Centre d\'aide', href: '/help' },
      { name: 'Politique de confidentialité', href: '/privacy' },
      { name: 'Conditions d\'utilisation', href: '/terms' },
      { name: 'Cookies', href: '/cookies' }
    ],
    social: [
      { name: 'Facebook', href: '#', icon: 'fab fa-facebook' },
      { name: 'Twitter', href: '#', icon: 'fab fa-twitter' },
      { name: 'LinkedIn', href: '#', icon: 'fab fa-linkedin' },
      { name: 'Instagram', href: '#', icon: 'fab fa-instagram' }
    ]
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">EM</span>
              </div>
              <span className="text-2xl font-bold text-white">EventMaster</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              La plateforme ultime pour organiser, gérer et réserver vos événements. 
              Créez des expériences mémorables avec EventMaster.
            </p>
            <div className="flex space-x-4">
              {footerLinks.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={`${item.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} EventMaster. Tous droits réservés.
          </p>
          <div className="mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">
              Fait avec ❤️ pour les passionnés d'événements
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;