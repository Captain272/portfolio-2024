import React from 'react';
import { ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Abhijeeth aka 0xC4p
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8">
            Full Stack Developer | Blockchain Enthusiast | AI Researcher
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-12">
            Passionate about creating innovative solutions at the intersection of blockchain and AI. 
            With expertise in full-stack development, I specialize in building secure, scalable applications 
            that push the boundaries of what's possible in web3 and artificial intelligence.
          </p>
          <div className="flex justify-center space-x-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition-colors"
            >
              View Projects
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-full hover:bg-purple-600 hover:text-white transition-colors"
            >
              Contact Me
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <ArrowDown className="w-6 h-6 text-purple-600" />
      </motion.div>
    </section>
  );
};

export default Hero;