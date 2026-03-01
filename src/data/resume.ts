export const personalInfo = {
  name: "Abhijeeth Baba Lopinti",
  title: "Backend & Blockchain Developer",
  email: "www.abhijeeeth@gmail.com",
  phone: "+91 9100196360",
  location: "Andhra Pradesh, India",
  bio: "Backend engineer building on-chain infrastructure and DeFi systems. From indexing AAVE V3 across EVM and Aptos chains to breaking smart contracts in CTFs, I work at the intersection of protocol engineering, data pipelines, and AI. 300K+ users served, multiple CTF clears, and production indexers running against live mainnets.",
  social: {
    github: "https://github.com/captain272",
    linkedin: "https://www.linkedin.com/in/lopinti-abhijeeth-90942b178/",
  }
};

export const education = {
  institution: "Rajiv Gandhi University of Knowledge Technologies, Nuzvid",
  degree: "B.Tech in Computer Science & Engineering",
  year: "2023",
  cgpa: "8.5",
};

export const experiences = [
  {
    title: "Founding Engineer",
    company: "Hamhey",
    location: "Hyderabad",
    period: "JUN 2025 - Present",
    description: "Built the entire Relocation system from scratch, serving 500+ monthly users.",
    responsibilities: [
      "Architected and built the complete relocation platform from ground up",
      "Designed Next.js frontend with LangGraph-powered AI system deployed on AWS",
      "Scaled to 500+ monthly active users within the first months of launch",
    ],
    techStack: ["Next.js", "LangGraph", "AWS", "TypeScript", "AI"],
  },
  {
    title: "Python - AI Developer",
    company: "KNInnovate",
    location: "Bengaluru",
    period: "Dec 2024 - May 2025",
    description: "Developed AI-powered automation systems for enterprise clients.",
    responsibilities: [
      "Built automated bidding bot securing 80% of Singapore Airlines passenger accommodation biddings",
      "Developed mail automation system for Royal Plaza Singapore",
      "Created automated finance and investment planner with AI-driven insights",
    ],
    techStack: ["Python", "AI/ML", "Automation", "FastAPI"],
  },
  {
    title: "Backend Developer",
    company: "Vtopia | NFT Marketplace",
    location: "Remote",
    period: "JUL 2024 - Oct 2024",
    description: "Optimized backend infrastructure for an NFT marketplace platform.",
    responsibilities: [
      "Built Express.js APIs with load testing and monitoring, achieving 3x loading time reduction",
      "Integrated Tensor APIs improving data processing efficiency by 30%",
      "Developed automated data update scripts maintaining 98% system uptime",
    ],
    techStack: ["Express.js", "Node.js", "Tensor APIs", "MongoDB"],
  },
  {
    title: "Full Stack Web Developer",
    company: "StormHatt Technologies",
    location: "Bengaluru",
    period: "JAN 2024 - JULY 2024",
    description: "Led migration and modernization of web application stack.",
    responsibilities: [
      "Migrated legacy Python codebase to React, SQL databases to Prisma ORM",
      "Integrated NextAuth, Stripe payments, Cloudinary, and Mailjet services",
      "Developed internal APIs for streamlined business process automation",
    ],
    techStack: ["React", "Prisma", "NextAuth", "Stripe", "Cloudinary"],
  },
  {
    title: "Python Backend & AI Developer",
    company: "ModelsLabAI",
    location: "Bengaluru",
    period: "JUNE 2023 - JAN 2024",
    description: "Built high-traffic AI APIs serving 300K+ users.",
    responsibilities: [
      "Developed FastAPI/Flask APIs serving 300K+ users with Celery task queuing",
      "Built ML pipelines for image and 3D model generation, improving response time by 25%",
      "Optimized model serving infrastructure for high-traffic production environments",
    ],
    techStack: ["FastAPI", "Flask", "Celery", "Python", "ML/AI", "Docker"],
  },
];

export const skills = {
  languages: ["Go", "Python", "Solidity", "TypeScript", "Move", "Bash", "Node.js"],
  frameworks: ["FastAPI", "Flask", "React", "Next.js", "Express.js", "TensorFlow", "HuggingFace", "LangGraph"],
  blockchain: ["AAVE V3", "Compound", "The Graph", "Ethernaut", "Aptos / Move", "EVM", "Solana"],
  platforms: ["AWS", "Docker", "Vercel", "DigitalOcean", "Git", "Linux"],
  databases: ["SQLite", "PostgreSQL", "MongoDB", "Prisma", "Redis"],
};

export const projects = [
  {
    title: "Aptos AAVE V3 Indexer",
    description: "Production blockchain indexer for AAVE V3 on Aptos — the first non-EVM AAVE deployment. Custom Go RPC client scanning Move events, tracking supply/borrow/liquidation/flashloan events with checkpoint recovery and rate-limited retries. Reads on-chain SmartTable buckets to enumerate user positions and health factors.",
    tech: ["Go", "Aptos RPC", "Move", "SQLite", "AAVE V3"],
    category: "Blockchain / DeFi",
  },
  {
    title: "Multi-Chain AAVE Indexer",
    description: "Cross-chain DeFi data pipeline indexing AAVE V2/V3 across Ethereum, Polygon, Arbitrum, Optimism, and Avalanche. Pulls historical lending data via The Graph subgraphs, normalizes across protocol versions, and persists to SQLite for analytics.",
    tech: ["Go", "The Graph", "GraphQL", "SQLite", "Multi-chain"],
    category: "Blockchain / DeFi",
  },
  {
    title: "On-Chain Lending Protocol",
    description: "Solidity-based lending/borrowing protocol implementing collateralized loans with dynamic interest rates, liquidation mechanics, and flash loan support. Includes Chainlink oracle integration for asset pricing and a health factor monitoring system.",
    tech: ["Solidity", "Hardhat", "Chainlink", "OpenZeppelin", "Ethers.js"],
    category: "Blockchain / DeFi",
  },
  {
    title: "Ethernaut CTF — All Levels Cleared",
    description: "Completed all 30+ Ethernaut challenges exploiting reentrancy, tx.origin phishing, delegate call attacks, storage slot manipulation, proxy vulnerabilities, and more. Documented attack vectors and wrote mitigation patterns for each level.",
    tech: ["Solidity", "Foundry", "EVM Internals", "Security"],
    category: "Smart Contract Security",
  },
  {
    title: "Neodym CTF Challenges",
    description: "Solved Neodym blockchain CTF challenges targeting DeFi protocol exploits, flash loan attack vectors, price oracle manipulation, and governance takeovers. Built proof-of-concept exploit contracts with Foundry test suites.",
    tech: ["Solidity", "Foundry", "DeFi Exploits", "Flash Loans"],
    category: "Smart Contract Security",
  },
  {
    title: "E-Voting on Blockchain",
    description: "Decentralized voting application deployed on local Ganache network with transparent ballot casting, tamper-proof vote storage, and real-time result tallying via smart contracts.",
    tech: ["Solidity", "Ganache", "Web3.js", "JavaScript"],
    category: "Blockchain / dApp",
  },
  {
    title: "Natural Disaster Detection",
    description: "Real-time detection system analyzing spatial video feeds, supporting emergency response teams with accurate location and severity data.",
    tech: ["Python", "TensorFlow", "Computer Vision", "Real-time Processing"],
    category: "AI / Machine Learning",
  },
  {
    title: "Skin Disease Detection App",
    description: "Deep learning model achieving 95% detection accuracy for skin conditions, increasing early diagnosis rates in testing.",
    tech: ["Python", "Deep Learning", "TensorFlow", "Mobile"],
    category: "AI / Machine Learning",
  },
  {
    title: "NFT Marketplace Recommendation System",
    description: "AI-driven recommendation models enhancing user engagement through personalized suggestions, contributing to a 20% increase in user interactions.",
    tech: ["Python", "ML", "Recommendation Engines", "NFT", "Data Science"],
    category: "Blockchain / AI",
  },
];
