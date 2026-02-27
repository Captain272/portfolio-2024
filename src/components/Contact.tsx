import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { personalInfo } from '../data/resume';

function FloatingInput({ id, label, type = 'text' }: { id: string; label: string; type?: string }) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-transparent glow-input transition-all duration-300"
        placeholder={label}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          setHasValue(e.target.value.length > 0);
        }}
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
          focused || hasValue
            ? '-top-2.5 text-xs text-cyan-400 bg-[#050510] px-1'
            : 'top-3 text-gray-500'
        }`}
      >
        {label}
      </label>
    </div>
  );
}

const Contact = () => {
  return (
    <section id="contact" className="py-20 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent text-glow-cyan">
            Get in Touch
          </span>
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass-card p-8"
        >
          <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>{personalInfo.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>{personalInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>{personalInfo.location}</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <FloatingInput id="name" label="Your Name" />
            <FloatingInput id="email" label="Your Email" type="email" />
            <div className="relative">
              <textarea
                id="message"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white glow-input transition-all duration-300 resize-none"
                placeholder="Your message..."
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-semibold py-3 rounded-lg hover:shadow-[0_0_30px_rgba(0,240,255,0.3)] transition-all duration-300 flex items-center justify-center"
            >
              Send Message
              <Send className="ml-2 h-5 w-5" />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
