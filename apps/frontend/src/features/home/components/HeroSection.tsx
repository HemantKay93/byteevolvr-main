import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  const prefersReduced = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReduced ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] as any },
      // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: prefersReduced ? 1 : 0.9, rotateY: prefersReduced ? 0 : 20 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: prefersReduced ? 0 : 1.2,
        ease: [0.16, 1, 0.3, 1] as any,
        delay: prefersReduced ? 0 : 0.5,
      },
      // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  };

  return (
    <section
      className="relative flex min-h-screen flex-col justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #04080F 0%, #070D1A 60%, #04080F 100%)' }}
    >
      {/* Animated Background Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.18 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(96,165,250,0.6) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black, transparent 75%)',
        }}
      />

      {/* Floating Orbs */}
      <motion.div
        animate={{
          y: prefersReduced ? 0 : [0, -20, 0],
          opacity: prefersReduced ? 0.2 : [0.2, 0.4, 0.2],
        }}
        transition={{ duration: prefersReduced ? 0 : 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{
          y: prefersReduced ? 0 : [0, 20, 0],
          opacity: prefersReduced ? 0.1 : [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: prefersReduced ? 0 : 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: prefersReduced ? 0 : 1,
        }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-28 lg:px-8">
        <motion.div
          className="grid grid-cols-1 items-center gap-x-12 gap-y-16 lg:grid-cols-12"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex flex-col gap-6 lg:col-span-7">
            <motion.div
              variants={itemVariants}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-md px-4 py-2 shadow-[0_0_15px_rgba(96,165,250,0.15)]"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-accent drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
                IT Consulting & Technology Trading
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.1] tracking-tight text-white drop-shadow-xl"
            >
              BYTEEVOLVR
              <span className="block pl-0 text-transparent bg-clip-text bg-gradient-to-r from-accent via-cyan-400 to-primary lg:pl-12 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                ENTERPRISES
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="max-w-xl text-base md:text-lg leading-relaxed text-brand-muted font-medium"
            >
              From IT strategy to spare parts delivery, ByteeVolvr is your end-to-end technology
              partner for consulting, supply, repair, and annual maintenance.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-4 flex flex-wrap gap-4">
              <a
                href="#services"
                className="btn-primary group flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
              >
                Explore Services
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <Link
                to="/shop"
                className="group flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110 text-accent" />
                Shop Online
              </Link>
            </motion.div>
          </div>

          <motion.div
            variants={imageVariants}
            className="hidden lg:col-span-5 lg:flex lg:items-center lg:justify-center"
          >
            <div
              className="relative aspect-[3/4] w-full max-w-[360px] rounded-2xl"
              style={{
                background:
                  'linear-gradient(135deg, rgba(26,79,214,0.15) 0%, rgba(96,165,250,0.05) 100%)',
                border: '1px solid rgba(96,165,250,0.12)',
                boxShadow: '0 0 60px rgba(26,79,214,0.15), inset 0 0 40px rgba(26,79,214,0.05)',
              }}
            >
              <div className="absolute inset-3 flex flex-col rounded-xl border border-white/5 bg-[#070D1A] p-4 overflow-hidden">
                <div className="mb-4 h-10 border-b border-white/5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="h-2 w-24 rounded-full bg-white/5" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    {['IT Consulting', 'AMC Active', 'B2B'].map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex rounded px-2 py-1 font-mono text-[8px]"
                        style={{
                          background: 'rgba(26,79,214,0.15)',
                          border: '1px solid rgba(96,165,250,0.2)',
                          color: '#93C5FD',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 space-y-3">
                    {[65, 80, 45, 90, 70].map((value, i) => (
                      <div key={i} className="h-2.5 rounded-sm bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ duration: 1.5, delay: 1 + i * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-sm bg-gradient-to-r from-primary to-accent"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="rounded-lg border border-accent/15 bg-primary/10 p-3 mt-4"
                >
                  <div className="font-mono text-[8px] uppercase text-brand-subtle">
                    System Uptime SLA
                  </div>
                  <div className="font-display text-lg font-bold text-white">99.85%</div>
                </motion.div>

                {/* Decorative scanning line */}
                <motion.div
                  animate={prefersReduced ? {} : { top: ['0%', '100%', '0%'] }}
                  transition={{
                    duration: prefersReduced ? 0 : 4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute left-0 right-0 h-1 bg-accent/10 blur-sm z-20"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
