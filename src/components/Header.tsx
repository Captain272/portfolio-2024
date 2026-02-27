import { useState, useEffect } from 'react';
import { Menu, X, Github, Linkedin } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { personalInfo } from '../data/resume';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#050510]/80 backdrop-blur-md border-b border-cyan-400/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link
            to="/"
            className="text-xl font-bold text-cyan-400 font-mono"
          >
            0xC4p
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
            >
              Home
            </Link>
            <button
              onClick={() => scrollToSection('experience')}
              className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
            >
              Experience
            </button>
            <button
              onClick={() => scrollToSection('projects')}
              className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
            >
              Projects
            </button>
            <Link
              to="/about"
              className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
            >
              About
            </Link>
            <Link
              to="/blogs"
              className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
            >
              Blogs
            </Link>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
            >
              Contact
            </button>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <a
              href={personalInfo.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href={personalInfo.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>

          <button
            className="md:hidden text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-[#050510]/95 backdrop-blur-md border-t border-cyan-400/10">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Home
            </Link>
            <button
              onClick={() => scrollToSection('experience')}
              className="block text-gray-300 hover:text-cyan-400 transition-colors w-full text-left"
            >
              Experience
            </button>
            <button
              onClick={() => scrollToSection('projects')}
              className="block text-gray-300 hover:text-cyan-400 transition-colors w-full text-left"
            >
              Projects
            </button>
            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-300 hover:text-cyan-400 transition-colors"
            >
              About
            </Link>
            <Link
              to="/blogs"
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-300 hover:text-cyan-400 transition-colors"
            >
              Blogs
            </Link>
            <button
              onClick={() => scrollToSection('contact')}
              className="block text-gray-300 hover:text-cyan-400 transition-colors w-full text-left"
            >
              Contact
            </button>
            <div className="flex items-center space-x-4 pt-3 border-t border-white/10">
              <a
                href={personalInfo.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={personalInfo.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
