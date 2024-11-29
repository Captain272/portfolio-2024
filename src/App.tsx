import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import BlogPage from './pages/BlogPage';
import BlogPost from './pages/BlogPost';
import AboutPage from './pages/AboutPage';
import Background from './components/Background';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="relative min-h-screen">
          <Background />
          <div className="relative z-10">
            <Header />
            <Routes>
              <Route path="/" element={
                <main>
                  <Hero />
                  <Experience />
                  <Projects />
                  <Contact />
                </main>
              } />
              <Route path="/blogs" element={<BlogPage />} />
              <Route path="/blogs/:slug" element={<BlogPost />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;