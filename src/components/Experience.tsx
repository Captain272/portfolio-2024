import React from 'react';
import { Briefcase, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const experiences = [
  {
    title: "Senior Full Stack Developer",
    company: "Tech Innovators Inc.",
    period: "2021 - Present",
    description: "Leading development of enterprise-scale web applications.",
    responsibilities: [
      "Architected and implemented microservices using Node.js and Docker",
      "Led a team of 5 developers in delivering critical features",
      "Reduced application load time by 40% through optimization"
    ],
    techStack: [
      "React", "Node.js", "TypeScript", "Docker", "AWS", "MongoDB",
      "Redis", "GraphQL", "Jest", "CI/CD"
    ]
  },
  {
    title: "Blockchain Developer",
    company: "Crypto Solutions",
    period: "2019 - 2021",
    description: "Developed decentralized applications and smart contracts.",
    responsibilities: [
      "Implemented smart contracts for DeFi protocols",
      "Developed NFT marketplace with 100K+ monthly users",
      "Integrated multiple blockchain networks and wallets"
    ],
    techStack: [
      "Solidity", "Web3.js", "Ethereum", "Hardhat", "IPFS",
      "React", "Node.js", "PostgreSQL", "Truffle"
    ]
  },
  {
    title: "AI Research Engineer",
    company: "Future AI Labs",
    period: "2018 - 2019",
    description: "Researched and implemented cutting-edge AI solutions.",
    responsibilities: [
      "Developed computer vision models with 95% accuracy",
      "Published 2 research papers on deep learning applications",
      "Created ML pipeline processing 1M+ images daily"
    ],
    techStack: [
      "Python", "PyTorch", "TensorFlow", "OpenCV", "scikit-learn",
      "Docker", "AWS SageMaker", "MLflow", "Kubernetes"
    ]
  }
];

const Experience = () => {
  return (
    <section id="experience" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Professional Experience
          </span>
        </h2>
        
        <div className="space-y-12">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-start">
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <Briefcase className="w-8 h-8 text-purple-600" />
                </div>
                <div className="md:ml-6 flex-grow">
                  <h3 className="text-2xl font-semibold">{exp.title}</h3>
                  <div className="flex items-center text-gray-600 mt-1 mb-4">
                    <span className="font-medium">{exp.company}</span>
                    <span className="mx-2">•</span>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{exp.period}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{exp.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3">Key Responsibilities:</h4>
                    <ul className="space-y-2">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-1" />
                          <span className="text-gray-700">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Tech Stack:</h4>
                    <div className="flex flex-wrap gap-2">
                      {exp.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;