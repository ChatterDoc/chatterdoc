import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  return (
    <section className="relative min-h-screen pt-24 pb-16 flex items-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-info/10 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          className="flex flex-col gap-6 max-w-xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary">
            Analyze customer feedback with AI
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Transform Feedback Into <span className="text-primary">Actionable Insights</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground">
            Collect, analyze, and understand customer feedback in real-time with AI-powered sentiment analysis. Make data-driven decisions and improve your product experience.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-2">
            {isSignedIn ? (
              <>
                <Button size="lg" className="group h-12" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="h-12" onClick={() => navigate('/demo')}>
                  View Demo
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="group h-12" onClick={() => navigate('/sign-up')}>
                  Get Started 
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="h-12" onClick={() => navigate('/demo')}>
                  View Demo
                </Button>
              </>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
            <div className="flex flex-col">
              <span className="text-3xl font-bold">99%</span>
              <span className="text-sm text-muted-foreground">Accuracy Rate</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">2M+</span>
              <span className="text-sm text-muted-foreground">Feedback Analyzed</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">5k+</span>
              <span className="text-sm text-muted-foreground">Active Users</span>
            </div>
          </motion.div>
        </motion.div>
        
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative z-10"
          >
            <div className="glass-card rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 bg-success/20 text-success text-sm font-medium rounded-bl-lg">
                <div className="flex items-center gap-1">
                  <ThumbsUp size={14} />
                  <span>Positive</span>
                </div>
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Customer Feedback</h3>
                  <p className="text-muted-foreground text-sm">7 minutes ago</p>
                </div>
              </div>
              <p className="text-card-foreground mb-4">
                "Your product has significantly improved our workflow efficiency. The new dashboard is intuitive and saves us hours each week. Excellent work!"
              </p>
              <div className="flex items-center text-amber-500">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-6 shadow-xl relative mt-6 ml-8 -z-[1]">
              <div className="absolute top-0 right-0 p-2 bg-success/20 text-success text-sm font-medium rounded-bl-lg">
                <div className="flex items-center gap-1">
                  <ThumbsUp size={14} />
                  <span>Positive</span>
                </div>
              </div>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Customer Feedback</h3>
                  <p className="text-muted-foreground text-sm">2 hours ago</p>
                </div>
              </div>
              <p className="text-card-foreground mb-4">
                "The customer support team was incredibly helpful and responsive. They solved my issue within minutes!"
              </p>
              <div className="flex items-center text-amber-500">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} />
              </div>
            </div>
          </motion.div>
          
          {/* Animated circles */}
          <motion.div
            className="absolute w-64 h-64 rounded-full border border-primary/30 -z-10"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.4, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-80 h-80 rounded-full border border-primary/20 -z-10"
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
