import { motion } from 'framer-motion';
import { Book, Code, Coffee, Cpu } from 'lucide-react';
import { personalInfo, education, skills } from '../data/resume';

const AboutPage = () => {
  return (
    <div className="min-h-screen pt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent text-glow-cyan">
                About Me
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {personalInfo.bio}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6"
            >
              <div className="flex items-center mb-4">
                <Book className="w-6 h-6 text-cyan-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Education</h2>
              </div>
              <div className="text-gray-300 space-y-1">
                <p className="font-medium">{education.institution}</p>
                <p className="text-gray-400">
                  {education.degree} ({education.year})
                </p>
                <p className="text-cyan-400">CGPA: {education.cgpa}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6"
            >
              <div className="flex items-center mb-4">
                <Code className="w-6 h-6 text-cyan-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Languages</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.languages.map((s) => (
                  <span
                    key={s}
                    className="text-sm px-3 py-1 rounded-full border border-cyan-400/30 text-cyan-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6"
            >
              <div className="flex items-center mb-4">
                <Cpu className="w-6 h-6 text-cyan-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">
                  Frameworks & Libraries
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.frameworks.map((s) => (
                  <span
                    key={s}
                    className="text-sm px-3 py-1 rounded-full border border-cyan-400/30 text-cyan-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6"
            >
              <div className="flex items-center mb-4">
                <Coffee className="w-6 h-6 text-cyan-300 mr-2" />
                <h2 className="text-xl font-semibold text-white">
                  Platforms & Databases
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...skills.platforms, ...skills.databases].map((s) => (
                  <span
                    key={s}
                    className="text-sm px-3 py-1 rounded-full border border-cyan-400/30 text-cyan-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
