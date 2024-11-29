import React from 'react';
import { Menu, X, Github, Linkedin, Twitter, User, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Portfolio
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Home</Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">About</Link>
            <Link to="/experience" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Experience</Link>
            <Link to="/projects" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Projects</Link>
            <Link to="/blogs" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Blogs</Link>
            <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
              <Github className="w-6 h-6" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
              <Twitter className="w-6 h-6" />
            </a>
            <button
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
              <User className="w-6 h-6" />
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900">
            <Link to="/" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">Home</Link>
            <Link to="/about" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">About</Link>
            <Link to="/experience" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">Experience</Link>
            <Link to="/projects" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">Projects</Link>
            <Link to="/blogs" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">Blogs</Link>
            <Link to="/contact" className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">Contact</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;