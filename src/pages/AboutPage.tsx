import React from 'react';
import { motion } from 'framer-motion';
import { Book, Code, Coffee, Heart } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                About Me
              </span>
            </h1>
            <p className="text-xl text-gray-600">Passionate about technology and continuous learning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center mb-4">
                <Code className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold">Technical Skills</h2>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Full Stack Development (React, Node.js, TypeScript)</li>
                <li>• Blockchain Development (Solidity, Web3.js)</li>
                <li>• AI/ML (PyTorch, TensorFlow)</li>
                <li>• Cloud Services (AWS, Google Cloud)</li>
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold">Interests</h2>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Cybersecurity & CTF Challenges</li>
                <li>• Open Source Contributing</li>
                <li>• Blockchain Technology</li>
                <li>• Artificial Intelligence</li>
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center mb-4">
                <Book className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold">Education</h2>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Master's in Computer Science</li>
                <li>• Multiple Certifications in Cloud & Security</li>
                <li>• Continuous Learning through Online Platforms</li>
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center mb-4">
                <Coffee className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold">Hobbies</h2>
              </div>
              <ul className="space-y-2 text-gray-600">
                <li>• Writing Technical Blogs</li>
                <li>• Contributing to Open Source</li>
                <li>• Participating in Hackathons</li>
                <li>• Solving CTF Challenges</li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;