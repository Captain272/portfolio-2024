import { motion } from 'framer-motion';
import { BookOpen, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blogs } from '../data/blogs';

const CATEGORY_COLORS: Record<string, string> = {
  'Move Language': 'text-pink-400',
  Blockchain: 'text-cyan-400',
  DeFi: 'text-violet-400',
  Indexing: 'text-green-400',
};

const BlogPage = () => {
  return (
    <div className="min-h-screen pt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent text-glow-cyan">
              Blog Posts
            </span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <Link to={`/blogs/${blog.slug}`} key={blog.slug}>
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="glass-card overflow-hidden h-full flex flex-col"
                >
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className={`flex items-center text-sm ${CATEGORY_COLORS[blog.category] || 'text-gray-400'}`}>
                        <Tag className="w-4 h-4 mr-1" />
                        {blog.category}
                      </span>
                      <span className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {blog.readTime}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold mb-2 text-white leading-snug">
                      {blog.title}
                    </h2>
                    <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3">
                      {blog.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                      <span className="text-gray-500 text-xs">{blog.date}</span>
                      <span className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors text-sm">
                        <BookOpen className="w-4 h-4 mr-1" />
                        Read
                      </span>
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
