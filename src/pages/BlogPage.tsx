import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const blogs = [
  {
    slug: 'understanding-zk-proofs',
    title: "Understanding Zero-Knowledge Proofs",
    description: "A comprehensive guide to ZK-SNARKs and their applications in blockchain privacy.",
    category: "Blockchain",
    readTime: "10 min read",
    date: "2024-02-20",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800",
  },
  {
    slug: 'htb-machine-walkthrough',
    title: "HTB Walkthrough: Machine Name",
    description: "Step-by-step guide to solving the latest Hack The Box challenge.",
    category: "CTF",
    readTime: "15 min read",
    date: "2024-02-18",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800",
  }
];

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-900/50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Blog Posts
            </span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.map((blog, index) => (
              <Link to={`/blogs/${blog.slug}`} key={index}>
                <motion.article
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-purple-500/20"
                >
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="flex items-center text-sm text-gray-300">
                        <Tag className="w-4 h-4 mr-1" />
                        {blog.category}
                      </span>
                      <span className="flex items-center text-sm text-gray-300">
                        <Clock className="w-4 h-4 mr-1" />
                        {blog.readTime}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold mb-2 text-white">{blog.title}</h2>
                    <p className="text-gray-300 mb-4">{blog.description}</p>
                    <div className="flex items-center text-purple-400 hover:text-purple-300">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Read More
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPage;