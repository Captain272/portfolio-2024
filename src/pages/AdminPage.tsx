import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';
import {
  LogOut, Plus, Eye, EyeOff, Lock,
  Trash2, Save, X, FileText,
} from 'lucide-react';
import { login, logout, isAuthenticated } from '../utils/adminAuth';
import {
  getAllBlogs, getDynamicBlogs, saveDynamicBlogs,
  getVisibilityMap, saveVisibilityMap,
  estimateReadTime, extractDescription,
  type BlogMeta, type VisibilityMap,
} from '../data/blogs';

marked.setOptions({ breaks: true, gfm: true });

const CATEGORIES = [
  'Blockchain',
  'DeFi',
  'Move Language',
  'Indexing',
  'Smart Contract Security',
];

const AdminPage = () => {
  // Auth
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Blog management
  const [allBlogs, setAllBlogs] = useState<BlogMeta[]>(getAllBlogs());
  const [visibility, setVisibility] = useState<VisibilityMap>(getVisibilityMap());

  // New blog form
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Blockchain');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newContent, setNewContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleLogin = () => {
    if (login(username, password)) {
      setAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const toggleVisibility = (slug: string) => {
    const updated = { ...visibility };
    if (updated[slug] === false) {
      delete updated[slug]; // restore to default (visible)
    } else {
      updated[slug] = false; // hide
    }
    setVisibility(updated);
    saveVisibilityMap(updated);
  };

  const deleteBlog = (slug: string) => {
    const dynamic = getDynamicBlogs().filter((b) => b.slug !== slug);
    saveDynamicBlogs(dynamic);
    const updatedVis = { ...visibility };
    delete updatedVis[slug];
    setVisibility(updatedVis);
    saveVisibilityMap(updatedVis);
    setAllBlogs(getAllBlogs());
  };

  const handleAddBlog = () => {
    let slug = newTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check for duplicate slugs
    const existingSlugs = getAllBlogs().map((b) => b.slug);
    if (existingSlugs.includes(slug)) {
      slug = `${slug}-${Date.now()}`;
    }

    const content = newContent.startsWith('# ')
      ? newContent
      : `# ${newTitle}\n\n${newContent}`;

    const newBlog: BlogMeta = {
      slug,
      title: newTitle,
      description: extractDescription(content) || newTitle,
      category: newCategory,
      date: newDate,
      readTime: estimateReadTime(content),
      content,
      isDynamic: true,
    };

    const existing = getDynamicBlogs();
    saveDynamicBlogs([...existing, newBlog]);
    setAllBlogs(getAllBlogs());

    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewCategory('Blockchain');
    setNewDate(new Date().toISOString().split('T')[0]);
    setShowForm(false);
    setShowPreview(false);
  };

  // ─── Login Screen ───
  if (!authenticated) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 w-full max-w-md"
        >
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-6 h-6 text-cyan-400 mr-2" />
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                Admin Access
              </span>
            </h1>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Username"
              className="w-full bg-white/5 border border-cyan-400/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 glow-input outline-none focus:border-cyan-400/50 transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Password"
              className="w-full bg-white/5 border border-cyan-400/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 glow-input outline-none focus:border-cyan-400/50 transition-colors"
            />

            <AnimatePresence>
              {loginError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm"
                >
                  {loginError}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-white font-semibold hover:from-cyan-400 hover:to-violet-500 transition-all active:scale-[0.98]"
            >
              Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Admin Dashboard ───
  const visibleCount = allBlogs.filter((b) => visibility[b.slug] !== false).length;

  return (
    <div className="min-h-screen pt-20 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {allBlogs.length} total blogs &middot; {visibleCount} visible
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 glass-card text-red-400 hover:text-red-300 transition-colors rounded-lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Actions bar */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <FileText className="w-5 h-5 text-cyan-400 mr-2" />
              Blog Posts
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-white text-sm font-medium hover:from-cyan-400 hover:to-violet-500 transition-all active:scale-[0.98]"
            >
              {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {showForm ? 'Cancel' : 'Add New Blog'}
            </button>
          </div>

          {/* Add Blog Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">New Blog Post</h3>

                  <div className="space-y-4">
                    {/* Title */}
                    <input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Blog title..."
                      className="w-full bg-white/5 border border-cyan-400/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 glow-input outline-none focus:border-cyan-400/50 transition-colors"
                    />

                    {/* Category + Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="bg-white/5 border border-cyan-400/20 rounded-lg px-4 py-3 text-white glow-input outline-none focus:border-cyan-400/50 transition-colors [&>option]:bg-[#0a0a1a] [&>option]:text-white"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="bg-white/5 border border-cyan-400/20 rounded-lg px-4 py-3 text-white glow-input outline-none focus:border-cyan-400/50 transition-colors [color-scheme:dark]"
                      />
                    </div>

                    {/* Editor header */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Markdown Content</span>
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </button>
                    </div>

                    {/* Textarea + Preview */}
                    <div className={showPreview ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}>
                      <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        rows={16}
                        placeholder="Write your markdown here..."
                        className="w-full bg-white/5 border border-cyan-400/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 glow-input outline-none focus:border-cyan-400/50 transition-colors font-mono text-sm resize-y min-h-[200px]"
                      />
                      {showPreview && (
                        <div
                          className="glass-card p-4 overflow-y-auto max-h-[450px] prose prose-invert prose-sm max-w-none
                            [&_h1]:text-cyan-400 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
                            [&_h2]:text-cyan-400 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3
                            [&_h3]:text-cyan-300 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2
                            [&_p]:text-gray-300 [&_p]:mb-3 [&_p]:leading-relaxed
                            [&_code]:text-cyan-400 [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
                            [&_pre]:bg-[#0a0a1a] [&_pre]:border [&_pre]:border-cyan-400/10 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:mb-3 [&_pre]:overflow-x-auto
                            [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-gray-300
                            [&_ul]:space-y-1 [&_ul]:mb-3 [&_ul]:pl-5 [&_li]:text-gray-300
                            [&_strong]:text-white
                            [&_blockquote]:border-l-2 [&_blockquote]:border-cyan-400/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-400"
                          dangerouslySetInnerHTML={{ __html: marked(newContent || '*Start typing to see preview...*') as string }}
                        />
                      )}
                    </div>

                    {/* Publish */}
                    <button
                      onClick={handleAddBlog}
                      disabled={!newTitle.trim() || !newContent.trim()}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-white font-semibold hover:from-cyan-400 hover:to-violet-500 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Publish Blog
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Blog List */}
          <div className="space-y-3">
            {allBlogs.map((blog, index) => {
              const isVisible = visibility[blog.slug] !== false;
              const isDynamic = blog.isDynamic === true;

              return (
                <motion.div
                  key={blog.slug}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className={`glass-card p-4 flex items-center justify-between transition-opacity ${
                    !isVisible ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="text-white font-medium truncate">{blog.title}</h3>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span className="text-sm text-cyan-400">{blog.category}</span>
                      <span className="text-sm text-gray-500">{blog.date}</span>
                      <span className="text-sm text-gray-500">{blog.readTime}</span>
                      {isDynamic && (
                        <span className="text-xs text-violet-400 border border-violet-400/30 px-2 py-0.5 rounded">
                          Custom
                        </span>
                      )}
                      {!isVisible && (
                        <span className="text-xs text-gray-500 border border-gray-500/30 px-2 py-0.5 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleVisibility(blog.slug)}
                      className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                      title={isVisible ? 'Hide blog' : 'Show blog'}
                    >
                      {isVisible ? (
                        <Eye className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    {isDynamic && (
                      <button
                        onClick={() => deleteBlog(blog.slug)}
                        className="p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                        title="Delete blog"
                      >
                        <Trash2 className="w-5 h-5 text-red-400 hover:text-red-300" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;
