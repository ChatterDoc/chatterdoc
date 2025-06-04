
import React from 'react';
import { motion } from 'framer-motion';
import { Code, PieChart, Settings, CreditCard, Sparkles, BarChart3 } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Code className="h-6 w-6 text-primary" />,
      title: "Easy Integration",
      description: "Install our lightweight widget on any website with a simple code snippet. No complicated setup required."
    },
    {
      icon: <PieChart className="h-6 w-6 text-primary" />,
      title: "AI-Powered Analysis",
      description: "Leverage cutting-edge AI to automatically detect sentiment in customer feedback with high accuracy."
    },
    {
      icon: <Settings className="h-6 w-6 text-primary" />,
      title: "Customizable Widget",
      description: "Personalize your feedback widget with your brand colors, logo, and desired feedback collection methods."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Detailed Analytics",
      description: "Track sentiment trends over time with comprehensive dashboards and actionable insights."
    },
    {
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      title: "Credit-Based System",
      description: "Pay only for the analyses you need with a flexible, credit-based pricing model. No subscription required."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "Real-Time Results",
      description: "See analysis results instantly as feedback comes in, enabling quick responses to customer concerns."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
    <section className="py-24 bg-secondary/50 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-info/5 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">All the tools you need to understand your customers</h2>
          <p className="text-lg text-muted-foreground">
            Our comprehensive platform provides everything you need to collect, analyze, and act on customer feedback.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border/50 hover:border-primary/20"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
