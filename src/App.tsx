import { useRef, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import BlogPage from './pages/BlogPage';
import BlogPost from './pages/BlogPost';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';
import Background from './components/Background';
import LoadingScreen from './components/LoadingScreen';
import { ThemeProvider } from './context/ThemeContext';

function ParallaxSection({ children, speed = 0.5 }: { children: React.ReactNode; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  return (
    <div ref={ref} className="relative">
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

function App() {
  const [loaded, setLoaded] = useState(false);

  const handleLoadComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <ThemeProvider>
      {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}
      <Router>
        <div className="relative min-h-screen">
          <Background />
          <div className="relative z-10">
            <Header />
            <Routes>
              <Route
                path="/"
                element={
                  <main>
                    <Hero />
                    <ParallaxSection speed={0.3}>
                      <Experience />
                    </ParallaxSection>
                    <ParallaxSection speed={0.2}>
                      <Projects />
                    </ParallaxSection>
                    <ParallaxSection speed={0.1}>
                      <Contact />
                    </ParallaxSection>
                  </main>
                }
              />
              <Route path="/blogs" element={<BlogPage />} />
              <Route path="/blogs/:slug" element={<BlogPost />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
