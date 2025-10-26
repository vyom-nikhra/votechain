import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { 
  FaVoteYea, 
  FaShieldAlt, 
  FaUsers, 
  FaChartLine, 
  FaArrowRight, 
  FaPlay,
  FaBolt,
  FaTrophy,
  FaEye,
  FaLock,
  FaGlobe,
  FaMobile,
  FaCheckCircle,
  FaStar,
  FaQuoteLeft,
  FaGraduationCap,
  FaUserTie,
  FaCode,
  FaRocket
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';
import { cn } from '../../lib/utils';
import Marquee from '../ui/Marquee';
import AnimatedButton from '../ui/AnimatedButton';

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

  const features = [
    {
      icon: <FaShieldAlt className="text-5xl text-success" />,
      title: "Military-Grade Security",
      description: "Blockchain-powered cryptographic protection ensures your vote is immutable and tamper-proof",
      color: "success",
      badge: "🛡️ Secure"
    },
    {
      icon: <FaEye className="text-5xl text-info" />,
      title: "Real-time Transparency", 
      description: "Watch live voting results, analytics, and participation metrics in real-time dashboards",
      color: "info",
      badge: "👁️ Transparent"
    },
    {
      icon: <FaUsers className="text-5xl text-warning" />,
      title: "Democratic Governance",
      description: "Participate in university decisions, student council elections, and policy voting",
      color: "warning",
      badge: "🗳️ Democratic"
    },
    {
      icon: <FaTrophy className="text-5xl text-error" />,
      title: "NFT Achievement System",
      description: "Earn unique digital badges, certificates, and rewards for active civic participation",
      color: "error",
      badge: "🏆 Rewarding"
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime Guarantee", icon: <FaGlobe />, desc: "Always available" },
    { number: "256-bit", label: "Encryption", icon: <FaLock />, desc: "Military grade" },
    { number: "<0.1s", label: "Vote Processing", icon: <FaBolt />, desc: "Lightning fast" },
    { number: "100%", label: "Transparency", icon: <FaEye />, desc: "Fully auditable" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Student Council President",
      university: "MIT",
      content: "VoteChain revolutionized our student elections. The transparency and security gave everyone confidence in the results.",
      avatar: "👩‍🎓",
      rating: 5
    },
    {
      name: "Dr. Michael Rodriguez",
      role: "Dean of Students",
      university: "Stanford University", 
      content: "Implementation was seamless. Students love the real-time results and the NFT rewards system increased participation by 300%.",
      avatar: "👨‍🏫",
      rating: 5
    },
    {
      name: "Alex Thompson",
      role: "CS Student",
      university: "UC Berkeley",
      content: "Finally, a voting system that's as advanced as the technology we're studying. The blockchain transparency is incredible.",
      avatar: "👨‍💻",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Student",
      price: "Free",
      description: "Perfect for individual student participation",
      features: ["Vote in elections", "View live results", "Basic analytics", "NFT badges"],
      color: "primary",
      popular: false
    },
    {
      name: "University", 
      price: "$99",
      period: "/month",
      description: "Complete solution for educational institutions",
      features: ["Unlimited elections", "Advanced analytics", "Custom branding", "24/7 support", "API access", "Bulk NFT rewards"],
      color: "secondary",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large organizations",
      features: ["Everything in University", "Custom integrations", "Dedicated support", "SLA guarantees", "White-label options"],
      color: "accent",
      popular: false
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
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      {/* Navigation */}
      <motion.nav 
        ref={navRef}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className={cn(
          "sticky top-0 z-50 transition-all duration-300"
        )}
      >
        <motion.div
          animate={{
            backdropFilter: isScrolled ? "blur(10px)" : "blur(4px)",
            boxShadow: isScrolled
              ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
              : "none",
            maxWidth: isScrolled ? "1200px" : "100%",
            margin: isScrolled ? "1.75rem auto" : "0",
            borderRadius: isScrolled ? "9999px" : "0",
            padding: isScrolled ? "0.9rem 2rem" : "1rem 2rem",
            y: isScrolled ? 8 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 35,
            duration: 0.5
          }}
          className={cn(
            "navbar px-4 lg:px-8 border-b border-base-300/50",
            isScrolled ? "bg-white/80 dark:bg-neutral-950/80" : "bg-base-100/80"
          )}
        >
          <div className="navbar-start">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="avatar">
                <div className={cn(
                  "rounded-xl bg-gradient-to-r from-primary to-secondary p-2 transition-all duration-300",
                  isScrolled ? "w-10" : "w-12"
                )}>
                  <FaVoteYea className={cn("text-white transition-all duration-300", isScrolled ? "text-xl" : "text-2xl")} />
                </div>
              </div>
              <div className="flex flex-col">
                <div className={cn(
                  "font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transition-all duration-300",
                  isScrolled ? "text-xl" : "text-2xl"
                )}>
                  VoteChain
                </div>
                {!isScrolled && (
                  <motion.div 
                    className="text-xs text-base-content/60 -mt-1"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isScrolled ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    Secure Democracy
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
          
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 space-x-2">
              <li><a className={cn("btn btn-ghost", isScrolled ? "btn-xs" : "btn-sm")}>Features</a></li>
              <li><a className={cn("btn btn-ghost", isScrolled ? "btn-xs" : "btn-sm")}>Pricing</a></li>
              <li><a className={cn("btn btn-ghost", isScrolled ? "btn-xs" : "btn-sm")}>About</a></li>
              <li><a className={cn("btn btn-ghost", isScrolled ? "btn-xs" : "btn-sm")}>Contact</a></li>
            </ul>
          </div>
          
          <div className="navbar-end space-x-2">
            <Link to="/login" className={cn("btn btn-ghost", isScrolled ? "btn-sm" : "")}>
              <FaLock className="mr-2" />
              Sign In
            </Link>
            <Link to="/register" className={cn("btn btn-primary btn-gradient shadow-lg", isScrolled ? "btn-sm" : "")}>
              <FaRocket className="mr-2" />
              Get Started
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </motion.div>
      </motion.nav>

      {/* Hero Section */}
      <section className="hero min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        
        <div className="hero-content text-center max-w-7xl px-4 relative z-10">
          <motion.div
            className="max-w-5xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              className="badge badge-primary badge-lg mb-6 p-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <HiSparkles className="mr-2" />
              Trusted by 500+ Universities Worldwide
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              Democracy
              <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                Reimagined
              </span>
              <span className="block text-4xl md:text-5xl font-normal text-base-content/70 mt-4">
                for the Digital Age
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl mb-12 text-base-content/80 max-w-4xl mx-auto font-light leading-relaxed">
              Experience the world's most advanced blockchain voting platform. 
              <span className="text-primary font-semibold"> Secure, transparent, and instant</span> - 
              the way democracy should be.
            </p>
            
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-12">
              {/* Use animated button matching provided design */}
              <Link to="/register">
                <div className="inline-block">
                  <AnimatedButton className="bg-primary"> 
                    <span className="mr-3"><FaRocket /></span>
                    Start Your Journey
                  </AnimatedButton>
                </div>
              </Link>
              <button className="inline-block">
                <AnimatedButton as="button" className="bg-transparent border border-white/20 text-white">
                  <span className="mr-3"><FaPlay /></span>
                  Watch 2min Demo
                </AnimatedButton>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="flex items-center gap-2 text-sm">
                <FaCheckCircle className="text-success" />
                SOC 2 Certified
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaCheckCircle className="text-success" />
                99.9% Uptime SLA
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaCheckCircle className="text-success" />
                GDPR Compliant
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaCheckCircle className="text-success" />
                Open Source
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-base-100 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by the Best
            </h2>
            <p className="text-xl text-base-content/70">
              Industry-leading metrics that set us apart
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="card bg-gradient-to-br from-base-200 to-base-300 shadow-2xl hover:shadow-primary/20 transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="card-body text-center p-8">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary text-3xl group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="stat-value text-4xl md:text-5xl font-black text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="stat-title text-lg font-bold text-base-content mb-2">
                    {stat.label}
                  </div>
                  <div className="text-sm text-base-content/60">
                    {stat.desc}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose VoteChain?
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              Experience the next generation of democratic participation with cutting-edge technology
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Display */}
            <motion.div 
              className="card bg-gradient-to-br from-base-200 to-base-300 shadow-2xl"
              key={currentFeature}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="card-body text-center p-12">
                <div className="flex justify-center mb-6">
                  {features[currentFeature].icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {features[currentFeature].title}
                </h3>
                <p className="text-lg text-base-content/70">
                  {features[currentFeature].description}
                </p>
              </div>
            </motion.div>

            {/* Feature List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`card cursor-pointer transition-all duration-300 ${
                    index === currentFeature 
                      ? 'bg-primary text-primary-content shadow-lg scale-105' 
                      : 'bg-base-200 hover:bg-base-300'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="card-body flex-row items-center p-6">
                    <div className="flex-shrink-0 mr-4">
                      <div className={`text-2xl ${index === currentFeature ? 'text-primary-content' : 'text-primary'}`}>
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{feature.title}</h4>
                      <p className={`text-sm ${index === currentFeature ? 'text-primary-content/80' : 'text-base-content/70'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-base-200 to-base-300">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Students & Universities
            </h2>
            <p className="text-xl text-base-content/70">
              See what our community is saying
            </p>
          </motion.div>

          {/* Marquee: faster, more repeats for infinite feel, remove gradient mask to avoid top dark edge */}
          <Marquee repeat={12} className="[--duration:16s]" pauseOnHover applyMask={false}>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="card bg-base-100 shadow-2xl w-[400px] mx-4"
                whileHover={{ y: -5 }}
              >
                <div className="card-body p-8">
                  <div className="flex items-center mb-6">
                    <div className="avatar placeholder mr-4">
                      <div className="w-16 rounded-full bg-primary/10">
                        <span className="text-3xl">{testimonial.avatar}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{testimonial.name}</h4>
                      <p className="text-primary font-semibold">{testimonial.role}</p>
                      <p className="text-sm text-base-content/60">{testimonial.university}</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="text-warning text-lg" />
                    ))}
                  </div>
                  
                  <div className="relative">
                    <FaQuoteLeft className="text-primary/20 text-4xl absolute -top-2 -left-2" />
                    <p className="text-base-content/80 italic leading-relaxed pl-8">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </Marquee>
        </div>
      </section>

      {/* Pricing Section removed as requested */}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary via-secondary to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Ready to Transform Democracy?
            </h2>
            <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
              Join the revolution. Start your secure voting journey today and be part of the future of democratic participation.
            </p>
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
              <Link to="/register" className="btn btn-accent btn-xl text-xl px-12 py-4 shadow-2xl hover:shadow-accent/25 transition-all duration-300">
                <FaRocket className="mr-3 text-2xl" />
                Create Free Account
                <FaArrowRight className="ml-3" />
              </Link>
              <Link to="/login" className="btn btn-outline btn-xl text-xl px-12 py-4 text-white border-white hover:bg-white hover:text-primary transition-all duration-300">
                <FaLock className="mr-3" />
                Sign In Now
              </Link>
            </div>
            
            <div className="mt-12 text-white/70">
              <p className="text-sm">
                ✨ No credit card required • 🔒 Setup in under 2 minutes • 🎯 Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content">
        <aside>
          <div className="flex items-center space-x-3 mb-4">
            <div className="avatar placeholder">
              <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl w-12 h-12">
                <FaVoteYea className="text-2xl" />
              </div>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              VoteChain
            </div>
          </div>
          <p className="font-medium">Revolutionizing democracy through blockchain technology</p>
          <p>Copyright © 2024 - All rights reserved</p>
        </aside>
      </footer>
    </div>
  );
};

export default LandingPage;