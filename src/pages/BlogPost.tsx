import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import { getBlogBySlug } from '../data/blogs';

// Configure marked for safe rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

const BlogPost = () => {
  const { slug } = useParams();
  const post = slug ? getBlogBySlug(slug) : undefined;
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (post) {
      const result = marked(post.content);
      if (typeof result === 'string') {
        setHtml(result);
      } else {
        result.then(setHtml);
      }
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Post not found</h1>
          <Link to="/blogs" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/blogs"
            className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Link>

          <div className="glass-card overflow-hidden">
            <div className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <span className="flex items-center text-sm text-gray-400">
                  <Calendar className="w-4 h-4 mr-1 text-cyan-400" />
                  {post.date}
                </span>
                <span className="flex items-center text-sm text-gray-400">
                  <Clock className="w-4 h-4 mr-1 text-cyan-400" />
                  {post.readTime}
                </span>
                <span className="flex items-center text-sm text-gray-400">
                  <Tag className="w-4 h-4 mr-1 text-cyan-400" />
                  {post.category}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-white mb-8">
                {post.title}
              </h1>

              <div
                className="prose prose-invert prose-lg max-w-none
                  [&_h1]:text-cyan-400 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:mt-10 [&_h1]:first:hidden
                  [&_h2]:text-cyan-400 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-8
                  [&_h3]:text-cyan-300 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-6
                  [&_h4]:text-cyan-200 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:mt-4
                  [&_p]:text-gray-300 [&_p]:mb-4 [&_p]:leading-relaxed
                  [&_ul]:space-y-2 [&_ul]:mb-4 [&_ul]:pl-6
                  [&_ol]:space-y-2 [&_ol]:mb-4 [&_ol]:pl-6
                  [&_li]:text-gray-300
                  [&_strong]:text-white
                  [&_a]:text-cyan-400 [&_a]:underline [&_a:hover]:text-cyan-300
                  [&_code]:text-cyan-400 [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
                  [&_pre]:bg-[#0a0a1a] [&_pre]:border [&_pre]:border-cyan-400/10 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:mb-4 [&_pre]:overflow-x-auto
                  [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-gray-300
                  [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-400/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400
                  [&_table]:w-full [&_table]:mb-4 [&_table]:border-collapse
                  [&_th]:bg-cyan-400/10 [&_th]:text-cyan-400 [&_th]:font-semibold [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:border [&_th]:border-white/10
                  [&_td]:px-4 [&_td]:py-2 [&_td]:text-gray-300 [&_td]:border [&_td]:border-white/10
                  [&_hr]:border-white/10 [&_hr]:my-8"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPost;
