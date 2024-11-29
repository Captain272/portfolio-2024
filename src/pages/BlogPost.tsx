import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// This would typically come from an API or CMS
const blogPosts = {
  'understanding-zk-proofs': {
    title: "Understanding Zero-Knowledge Proofs",
    content: `
# Introduction to Zero-Knowledge Proofs

Zero-knowledge proofs are cryptographic methods by which one party (the prover) can prove to another party (the verifier) that a given statement is true without conveying any additional information apart from the fact that the statement is indeed true.

## Key Concepts

1. **Completeness**: If the statement is true, an honest verifier will be convinced by an honest prover.
2. **Soundness**: If the statement is false, no cheating prover can convince an honest verifier that it is true.
3. **Zero-knowledge**: If the statement is true, no verifier learns anything other than the fact that the statement is true.

## Applications in Blockchain

Zero-knowledge proofs have become increasingly important in blockchain technology, particularly in:

- Privacy-preserving transactions
- Scalability solutions
- Identity verification

## Implementation Example

\`\`\`solidity
// Simple example of a zero-knowledge proof contract
contract ZKProof {
    // Implementation details...
}
\`\`\`
    `,
    category: "Blockchain",
    readTime: "10 min read",
    date: "2024-02-20",
    author: "John Doe",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800"
  },
  // Add more blog posts here
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts[slug];

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/blogs" className="flex items-center text-purple-600 hover:text-purple-700 mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Link>

          <img
            src={post.image}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />

          <div className="flex items-center space-x-4 mb-8">
            <span className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {post.date}
            </span>
            <span className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {post.readTime}
            </span>
            <span className="flex items-center text-sm text-gray-500">
              <Tag className="w-4 h-4 mr-1" />
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="prose prose-lg max-w-none">
            {/* This would typically use a markdown parser */}
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPost;