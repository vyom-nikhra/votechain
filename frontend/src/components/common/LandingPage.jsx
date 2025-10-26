import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { 
  FaVoteYea, 
  FaShieldAlt, 
  FaUsers, 
  FaChartLine, 
  FaArrowRight, 
  FaPlay,
  FaBolt,
  FaLock,
  FaGlobe,
  FaMobile,
  FaCheckCircle,
  FaRocket,
  FaStar,
  FaQuoteLeft
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { cn } from '../../lib/utils';
import BlurryBlob from '../animata/background/blurry-blob';
import SkewButton from '../ui/SkewButton';
import GlowButton from '../ui/GlowButton';
import { BentoGrid, BentoCard } from '../animata/bento-grid/Gradient';
import ClickSpark from '../ui/ClickSpark';
import { PointerHighlight } from '../ui/PointerHighlight';
import Marquee from '../ui/Marquee';
import { Globe } from '../ui/Globe';
import FlipCard from '../animata/card/flip-card';

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef(null);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const features = [
    {
      icon: <FaShieldAlt className="text-5xl text-success" />,
      title: "Military-Grade Security",
      description: "Blockchain-powered cryptographic protection ensures your vote is immutable and tamper-proof",
      color: "success",
      badge: "Secure"
    },
    {
      icon: <FaChartLine className="text-5xl text-info" />,
      title: "Real-time Transparency", 
      description: "Watch live voting results, analytics, and participation metrics in real-time dashboards",
      color: "info",
      badge: "Transparent"
    },
    {
      icon: <FaUsers className="text-5xl text-warning" />,
      title: "Democratic Governance",
      description: "Participate in university decisions, student council elections, and policy voting",
      color: "warning",
      badge: "Democratic"
    },
    {
      icon: <FaRocket className="text-5xl text-error" />,
      title: "Lightning Fast Results",
      description: "Get instant election results and real-time updates for active civic participation",
      color: "error",
      badge: "Fast"
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime Guarantee", icon: <FaGlobe />, desc: "Always available" },
    { number: "256-bit", label: "Encryption", icon: <FaLock />, desc: "Military grade" },
    { number: "<0.1s", label: "Vote Processing", icon: <FaBolt />, desc: "Lightning fast" },
    { number: "100%", label: "Transparency", icon: <FaCheckCircle />, desc: "Fully auditable" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Student Council President",
      university: "MIT",
      content: "VoteChain revolutionized our student elections. The transparency and security gave everyone confidence in the results.",
      avatar: "SC",
      rating: 5
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Dean of Students",
      university: "Stanford University", 
      content: "Implementation was seamless. Students love the real-time results and the NFT rewards system increased participation by 300%.",
      avatar: "MR",
      rating: 5
    },
    {
      name: "Alex Thompson",
      role: "CS Student",
      university: "UC Berkeley",
      content: "Finally, a voting system that's as advanced as the technology we're studying. The blockchain transparency is incredible.",
      avatar: "AT",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav 
        ref={navRef}
        className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut"
          }}
          style={{
            backdropFilter: "blur(16px) saturate(180%)",
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37), 0 0 0 1px rgba(255, 255, 255, 0.08) inset",
            borderRadius: "9999px",
            padding: "0.9rem 2rem",
          }}
          className="navbar px-4 lg:px-8 border border-white/10 w-full max-w-[1200px] pointer-events-auto"
        >
          <div className="navbar-start">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="avatar">
                <div className="rounded-xl bg-gradient-to-r from-primary to-secondary p-2 w-10">
                  <FaVoteYea className="text-white text-xl" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VoteChain
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 space-x-4">
              <li>
                <button 
                  onClick={() => scrollToSection('hero')} 
                  className="btn btn-sm btn-ghost text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('features')} 
                  className="btn btn-sm btn-ghost text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('testimonials')} 
                  className="btn btn-sm btn-ghost text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Testimonials
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('cta')} 
                  className="btn btn-sm btn-ghost text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('footer')} 
                  className="btn btn-sm btn-ghost text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          
          <div className="navbar-end space-x-3">
            <Link to="/login" className="btn btn-sm btn-ghost text-gray-300 hover:text-white hover:bg-gray-800">
              <FaLock className="mr-2" />
              Sign In
            </Link>
            <Link to="/register" className="inline-block">
              <GlowButton>
                Get Started
              </GlowButton>
            </Link>
          </div>
        </motion.div>
      </nav>

    <ClickSpark
      sparkColor='#3b82f6'
      sparkSize={10}
      sparkRadius={20}
      sparkCount={8}
      duration={400}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-x-hidden">
      {/* Hero Section */}
      <section id="hero" className="hero min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden pt-24">
        {/* BlurryBlob Background Animation */}
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <BlurryBlob
            className="opacity-70 scale-150"
            firstBlobColor="bg-blue-500"
            secondBlobColor="bg-purple-500"
          />
        </div>
        
        <div className="hero-content text-center max-w-7xl px-4 relative z-10">
          <motion.div
            className="max-w-5xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            {/* <motion.div 
              className="badge bg-blue-600/30 border-blue-500/50 text-blue-300 backdrop-blur-md badge-lg mb-6 p-4 shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <HiSparkles className="mr-2" />
              Trusted by 500+ Universities Worldwide
            </motion.div> */}

            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.3)]">Democracy</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(147,51,234,0.5)]">
                Reimagined
              </span>
            </h1>
            
            <div className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              Blockchain-powered voting platform.{' '}
              <span className="inline-block">
                <PointerHighlight
                  rectangleClassName="border-blue-500"
                  pointerClassName="text-blue-500"
                >
                  <span className="text-blue-300 font-semibold">Secure, transparent, and instant</span>
                </PointerHighlight>
              </span>.
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-12">
              <Link to="/register">
                <SkewButton> 
                  <FaRocket />
                  Start Your Journey
                </SkewButton>
              </Link>
              <SkewButton as="button" className="border-white text-white">
                <FaPlay />
                Watch Demo
              </SkewButton>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FaCheckCircle className="text-green-500" />
                SOC 2 Certified
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FaCheckCircle className="text-green-500" />
                99.9% Uptime
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FaCheckCircle className="text-green-500" />
                GDPR Compliant
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FaCheckCircle className="text-green-500" />
                Open Source
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Why Choose VoteChain?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of democratic participation with cutting-edge technology
            </p>
          </motion.div>

          <BentoGrid className="max-w-7xl mx-auto">
            {/* Large Card - Blockchain Security */}
            <BentoCard
              title="Blockchain Security"
              description="Immutable and transparent voting records secured by advanced blockchain technology. Every vote is encrypted and permanently recorded on the distributed ledger, ensuring complete auditability and preventing any tampering or manipulation."
              icon={FaShieldAlt}
              className="md:col-span-2 lg:row-span-2"
            >
              <div className="mt-auto pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <FaCheckCircle />
                  <span>256-bit AES encryption</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <FaCheckCircle />
                  <span>Tamper-proof records</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <FaCheckCircle />
                  <span>Zero-knowledge proofs</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <FaCheckCircle />
                  <span>Multi-signature validation</span>
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-gray-400">Immutable & Auditable</div>
                </div>
              </div>
            </BentoCard>

            {/* Real-time Analytics */}
            <BentoCard
              title="Real-time Analytics"
              description="Watch results pour in as they happen with live dashboards and visualizations."
              icon={FaChartLine}
              className="lg:col-span-1"
            />

            {/* Global Access */}
            <BentoCard
              title="Global Access"
              description="Vote from anywhere in the world with our secure platform."
              icon={FaGlobe}
              className="lg:col-span-1"
            />

            {/* User Management */}
            <BentoCard
              title="Smart User Management"
              description="Effortlessly manage voters, candidates, and administrators with our intuitive dashboard."
              icon={FaUsers}
              className="md:col-span-1"
            >
              <div className="mt-auto pt-4">
                <div className="text-3xl font-bold text-white">10,000+</div>
                <div className="text-sm text-gray-400">Active users</div>
              </div>
            </BentoCard>

            {/* Mobile Responsive */}
            <BentoCard
              title="Mobile First"
              description="Optimized for all devices. Vote on the go with our responsive design."
              icon={FaMobile}
              className="md:col-span-1"
            />

            {/* Instant Results */}
            <BentoCard
              title="Instant Results"
              description="No more waiting. Get election results in seconds, not days."
              icon={FaBolt}
              className="md:col-span-2 lg:col-span-1"
            >
              <div className="mt-auto pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 border-2 border-gray-800"></div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">Join 500+ organizations</span>
                </div>
              </div>
            </BentoCard>
          </BentoGrid>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-950 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-400">
              Trusted by organizations and individuals worldwide
            </p>
          </motion.div>

          <Marquee repeat={12} duration={16} applyMask={false}>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="card bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-blue-500/20 hover:border-purple-500/40 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 w-96 mx-4 backdrop-blur-sm"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="card-body p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="avatar placeholder">
                      <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400 rounded-full w-12 h-12 flex items-center justify-center border border-blue-500/30">
                        <span className="text-lg font-bold">{testimonial.avatar}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{testimonial.name}</h3>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                      <p className="text-sm text-blue-400">{testimonial.university}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-sm" />
                    ))}
                  </div>

                  <div className="relative">
                    <FaQuoteLeft className="absolute -top-2 -left-2 text-blue-500/20 text-2xl" />
                    <p className="text-gray-300 pl-6 italic">{testimonial.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* CTA Section - Ready to Transform */}
      <section className="relative overflow-hidden bg-gray-950">
        {/* Main CTA Grid */}
        <div className="container mx-auto px-4 py-20">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Ready to Transform Democracy?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join thousands of organizations worldwide using VoteChain for secure, transparent voting
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* FlipCard Demo */}
            <motion.div
              className="flex justify-center items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <FlipCard
                image="https://plus.unsplash.com/premium_photo-1733342554594-102b8e2d0623?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2031"
                title="VoteChain"
                subtitle="About VoteChain"
                description="VoteChain is a revolutionary blockchain-powered voting platform that brings democracy into the digital age. Built with cutting-edge technology, VoteChain ensures every vote is secure, transparent, and instantly verifiable. Our platform combines military-grade encryption with the immutability of blockchain to create a voting system you can trust."
                rotate="y"
                className="h-[400px] w-full max-w-sm shadow-2xl hover:shadow-blue-500/30 transition-shadow duration-300"
              />
            </motion.div>

            {/* Globe Card */}
            <motion.div
              className="relative flex flex-col h-[400px] bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="p-6 z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Redefining Democracy</h3>
                <p className="text-gray-400 text-sm">
                  Trusted by universities and organizations
                </p>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="absolute -right-10 md:-right-20 -bottom-32 md:-bottom-40 opacity-80" />
              </div>

              <div className="absolute bottom-6 left-6 right-6 z-10">
                <div className="flex items-center justify-between text-sm text-gray-400 bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                    <span>VoteChain</span>
                  </div>
                  <div className="text-white font-semibold">Decentralized Student Voting</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-8">
              <Link to="/register" className="inline-block">
                <SkewButton className="bg-blue-600 text-white border-blue-600">
                  <FaRocket />
                  Create Free Account
                  <FaArrowRight />
                </SkewButton>
              </Link>
              <Link to="/login" className="inline-block">
                <SkewButton className="border-gray-600 text-gray-300 hover:border-blue-500 hover:text-white">
                  <FaLock />
                  Sign In Now
                </SkewButton>
              </Link>
            </div>
            
            <div className="text-gray-500">
              <p className="text-sm">
                Your own decentralized Student Voting System
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-gray-950 border-t border-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl w-12 h-12 flex items-center justify-center">
                  <FaVoteYea className="text-2xl" />
                </div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  VoteChain
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Revolutionizing democracy through blockchain technology. Secure, transparent, and instant voting for the digital age.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <FaGlobe className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <FaUsers className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <FaShieldAlt className="text-xl" />
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Roadmap</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Docs</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">GDPR</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-500 text-sm">
                © 2024 VoteChain. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <FaCheckCircle className="text-green-500" />
                  <span>SOC 2 Certified</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <FaCheckCircle className="text-green-500" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <FaCheckCircle className="text-green-500" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </ClickSpark>
    </>
  );
};

export default LandingPage;