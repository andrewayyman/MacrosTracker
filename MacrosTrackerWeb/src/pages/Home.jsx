import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppShell } from '../hooks/useAppShell';
import { Camera, Utensils, PieChart, TrendingUp, Sparkles, ArrowRight, ScanLine } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

function HomePage() {
  const { appName } = useAppShell();

  return (
    <div className="landing-page-wrapper">
      <main className="landing-content">
        
        {/* HERO SECTION */}
        <section id="home" className="landing-hero-modern">
          <div className="hero-background-glow"></div>
          <div className="container hero-container">
            <motion.div 
              className="hero-text"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.span variants={fadeInUp} className="hero-badge">
                <Sparkles size={16} /> Now with AI Food Recognition
              </motion.span>
              <motion.h1 variants={fadeInUp} className="hero-headline">
                Track your macros. <br />
                <span className="text-gradient">Uncomplicate your diet.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="hero-subheadline">
                The smartest AI food scanner built specifically with Egyptian cuisine in mind. 
                Hit your fitness goals without the guesswork.
              </motion.p>
              <motion.div variants={fadeInUp} className="hero-actions">
                <Link className="btn-modern-primary" to="/register">
                  Start Tracking Free <ArrowRight size={18} />
                </Link>
                <Link className="btn-modern-secondary" to="/login">
                  Sign in
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              className="hero-visual"
              initial={{ opacity: 0, scale: 0.9, rotateX: 15 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div className="floating-card card-macros">
                <div className="fc-header">
                  <div className="fc-icon"><PieChart size={20}/></div>
                  <span>Today's Macros</span>
                </div>
                <div className="fc-bars">
                  <div className="fc-bar-row">
                    <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Protein</span><span>120g</span></div>
                    <div className="fc-bar-bg"><div className="fc-bar-fill protein" style={{width: '75%'}}></div></div>
                  </div>
                  <div className="fc-bar-row">
                    <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Carbs</span><span>210g</span></div>
                    <div className="fc-bar-bg"><div className="fc-bar-fill carbs" style={{width: '45%'}}></div></div>
                  </div>
                  <div className="fc-bar-row">
                    <div style={{display: 'flex', justifyContent: 'space-between'}}><span>Fat</span><span>55g</span></div>
                    <div className="fc-bar-bg"><div className="fc-bar-fill fat" style={{width: '60%'}}></div></div>
                  </div>
                </div>
              </div>
              <div className="floating-card card-scan">
                <ScanLine size={32} className="scan-icon" />
                <p style={{margin: '0', fontSize: '0.875rem', fontWeight: '500'}}>Koshary Bowl Detected</p>
                <span className="scan-badge">650 kcal</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="landing-section features-section">
          <div className="container">
            <motion.div 
              className="section-header"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeInUp}>Everything you need to succeed</motion.h2>
              <motion.p variants={fadeInUp}>Powerful tools designed to make nutrition tracking effortless and accurate.</motion.p>
            </motion.div>

            <motion.div 
              className="features-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <FeatureCard 
                icon={<Camera size={28} />}
                title="AI Photo Scan"
                desc="Instantly log meals by snapping a photo. Our advanced AI recognizes thousands of foods."
              />
              <FeatureCard 
                icon={<Utensils size={28} />}
                title="Egyptian Cuisine"
                desc="Finally, an app that understands Koshary, Molokhia, and local portion sizes accurately."
              />
              <FeatureCard 
                icon={<PieChart size={28} />}
                title="Macro Tracking"
                desc="Keep your protein, carbs, and fats in check with beautiful daily and weekly summaries."
              />
              <FeatureCard 
                icon={<TrendingUp size={28} />}
                title="Progress Analytics"
                desc="Visualize your body weight trends and adherence over time with interactive charts."
              />
              <FeatureCard 
                icon={<Sparkles size={28} />}
                title="Smart Recommendations"
                desc="Get personalized macro adjustments based on your goals, whether cutting or bulking."
              />
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="landing-section steps-section">
          <div className="container">
            <motion.div 
              className="section-header text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeInUp}>How it works</motion.h2>
              <motion.p variants={fadeInUp}>Three simple steps to take control of your diet.</motion.p>
            </motion.div>

            <div className="steps-container">
              <Step 
                num="01"
                title="Snap a photo"
                desc="Point your camera at your meal. No more searching through endless databases."
              />
              <Step 
                num="02"
                title="Confirm & Log"
                desc="Review the AI's detection, adjust portion sizes if needed, and log instantly."
              />
              <Step 
                num="03"
                title="Track Progress"
                desc="Watch your consistency grow and hit your specific fitness goals faster."
              />
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="landing-section stats-section">
          <div className="container stats-container">
            <motion.div 
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3>1M+</h3>
              <p>Meals Scanned</p>
            </motion.div>
            <motion.div 
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3>50k+</h3>
              <p>Active Users</p>
            </motion.div>
            <motion.div 
              className="stat-box"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3>99%</h3>
              <p>Local Food Accuracy</p>
            </motion.div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="landing-cta-section">
          <motion.div 
            className="cta-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="cta-glow"></div>
            <h2>Ready to transform your nutrition?</h2>
            <p>Join {appName || 'MacrosTracker'} today and take the guesswork out of your diet.</p>
            <Link className="btn-modern-primary btn-large" to="/register">
              Get Started for Free <ArrowRight size={20} />
            </Link>
          </motion.div>
        </section>

      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div className="feature-card" variants={fadeInUp}>
      <div className="fc-icon-wrapper">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </motion.div>
  );
}

function Step({ num, title, desc }) {
  return (
    <motion.div 
      className="step-item"
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="step-number">{num}</div>
      <div className="step-content">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </motion.div>
  );
}

export default HomePage;
