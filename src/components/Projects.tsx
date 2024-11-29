import React, { useState } from 'react';
import { ExternalLink, Github, Play, Code, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const projectCategories = [
  {
    title: "Blockchain",
    projects: [
      {
        title: "DeFi Exchange Platform",
        description: "Decentralized exchange with automated market maker protocol",
        tech: ["Solidity", "Web3.js", "React"],
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800",
        github: "https://github.com",
        demo: "https://demo.com",
        video: "https://example.com/video.mp4"
      },
      {
        title: "NFT Marketplace",
        description: "Platform for minting and trading NFTs",
        tech: ["Ethereum", "IPFS", "Next.js"],
        image: "https://images.unsplash.com/photo-1644760774754-57f2f952ad5c?auto=format&fit=crop&q=80&w=800",
        github: "https://github.com",
        demo: "https://demo.com",
        video: "https://example.com/video2.mp4"
      }
    ]
  },
  {
    title: "Artificial Intelligence",
    projects: [
      {
        title: "AI Image Generator",
        description: "Generate images from text descriptions using DALL-E",
        tech: ["Python", "PyTorch", "FastAPI"],
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
        github: "https://github.com",
        demo: "https://demo.com",
        video: "https://example.com/video3.mp4"
      },
      {
        title: "Sentiment Analysis Tool",
        description: "Real-time sentiment analysis for social media",
        tech: ["TensorFlow", "NLP", "React"],
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800",
        github: "https://github.com",
        demo: "https://demo.com",
        video: "https://example.com/video4.mp4"
      }
    ]
  }
];

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects = activeCategory === "All" 
    ? projectCategories
    : projectCategories.filter(cat => cat.title === activeCategory);

  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Projects
          </span>
        </h2>

        <div className="flex justify-center space-x-4 mb-12">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-6 py-2 rounded-full transition-all duration-200 ${
              activeCategory === "All"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900"
            }`}
          >
            All
          </button>
          {projectCategories.map((category) => (
            <button
              key={category.title}
              onClick={() => setActiveCategory(category.title)}
              className={`px-6 py-2 rounded-full transition-all duration-200 ${
                activeCategory === category.title
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900"
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>

        {filteredProjects.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-16">
            <h3 className="text-2xl font-semibold mb-8 text-gray-800 dark:text-gray-200">{category.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.projects.map((project, projectIndex) => (
                <motion.div
                  key={projectIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: projectIndex * 0.2 }}
                  className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedProject(project)}
                        className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                      >
                        <Play className="w-6 h-6" />
                      </motion.button>
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-900"
                      >
                        <Code className="w-6 h-6" />
                      </motion.a>
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                      >
                        <Eye className="w-6 h-6" />
                      </motion.a>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{project.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech.map((tech, techIndex) => (
                        <span 
                          key={techIndex}
                          className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-3xl w-full"
                onClick={e => e.stopPropagation()}
              >
                <div className="aspect-video relative">
                  <video
                    src={selectedProject.video}
                    controls
                    className="w-full h-full rounded"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Projects;