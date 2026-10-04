import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

/**
 * Zen Reveal Animation Variants
 * Philosophy: "Zen-Tech" & "Less but Better"
 * Soft, purposeful, no bounce, mimics powering on an Apple device.
 */
const cardContainerVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // Smooth Apple-grade easeOut
    },
  },
};

const leftColumnVariants = {
  hidden: {
    opacity: 0,
    x: -8,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      delay: 0.3, // Lands after card container has settled
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const textBlockVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: (customIndex = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.6 + customIndex * 0.15, // Starts at ~0.6s after left column is in place
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const AboutCard = ({ id = 'bag-om-bloggen' }) => {
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  return (
    <section
      id={id}
      aria-label={isEn ? 'About the author' : 'Bag om bloggen'}
      className="w-full px-6 sm:px-10 lg:px-12 py-10 sm:py-12 lg:py-16 border-t border-borderSubtle scroll-mt-6 transition-colors duration-500"
    >
      {/* 1. Container (Kortet): Fades in softly and slides slightly up (y: 20 -> 0) over 0.8s */}
      <motion.div
        variants={cardContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="w-full rounded-2xl bg-cardSurface border border-borderSubtle p-8 md:p-12 relative overflow-hidden shadow-[var(--shadow-article-card)] transition-colors duration-300 hover:border-accentGlow/25"
      >
        {/* Subtle organic emerald aura in background */}
        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full pointer-events-none opacity-25"
          style={{
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-15"
          style={{
            background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* 2-Column Editorial Layout */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* 2. Venstre side (Avatar & Navn): Fades in after card lands (delay ~0.3s) */}
          <motion.div
            variants={leftColumnVariants}
            className="lg:col-span-5 flex items-center gap-5 sm:gap-6"
          >
            {/* Elegant circular profile frame with glowing emerald circle */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-canvas border border-accentGlow/40 flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.22)] ring-1 ring-borderSubtle transition-transform duration-300 hover:scale-105">
                <span className="font-mono font-semibold text-lg sm:text-xl text-titleText tracking-wider select-none">
                  JF
                </span>
              </div>

              {/* 3. Den grønne status-prik: Fades in & infinite subtle server-diode pulse */}
              <div className="absolute bottom-0 right-0 flex items-center justify-center pointer-events-none">
                {/* Ambient pulse halo around diode */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0.15, 0.45, 0.15],
                    scale: [1, 1.4, 1],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                  className="absolute w-4 h-4 rounded-full bg-accentGlow pointer-events-none"
                  aria-hidden="true"
                />

                {/* Server diode core: smooth slow breathing between 0.5 and 1.0 opacity */}
                <motion.span
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: 1,
                  }}
                  transition={{
                    opacity: {
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    },
                    scale: {
                      duration: 0.4,
                      delay: 0.4,
                      ease: 'easeOut',
                    },
                  }}
                  className="w-3.5 h-3.5 rounded-full bg-accentGlow border-2 border-cardSurface shadow-[0_0_8px_var(--accent-glow)] pointer-events-auto"
                  title="100% On-Device / Lokal"
                />
              </div>
            </div>

            {/* Clean header & sub-badge */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-bodyText font-medium block">
                {isEn ? 'Behind the blog' : 'Bag om bloggen'}
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold text-titleText tracking-tight leading-tight">
                {isEn ? 'Hej, jeg er Jesper' : 'Hej, jeg er Jesper'}
              </h3>
              <div className="text-xs font-mono text-accentGlow font-medium tracking-wide flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accentGlow" />
                <span>{isEn ? 'Selvlært AI Entusiast' : 'Selvlært AI Entusiast'}</span>
              </div>
            </div>
          </motion.div>

          {/* 4. Højre side (Teksten): Fades in block by block after left side (delay ~0.6s) */}
          <div className="lg:col-span-7 border-t lg:border-t-0 lg:border-l border-borderSubtle pt-6 lg:pt-0 lg:pl-10 space-y-3">
            <motion.p
              custom={0}
              variants={textBlockVariants}
              className="text-base text-bodyText leading-relaxed font-sans"
            >
              {isEn
                ? 'Dette er mit private, digitale frirum. Som autodidakt AI-entusiast bruger jeg bloggen her til at logge mine personlige erfaringer med alt fra komplekse dual-AI setups til praktisk hverdagsbrug på Apple Silicon.'
                : 'Dette er mit private, digitale frirum. Som autodidakt AI-entusiast bruger jeg bloggen her til at logge mine personlige erfaringer med alt fra komplekse dual-AI setups til praktisk hverdagsbrug på Apple Silicon.'}
            </motion.p>
            <motion.p
              custom={1}
              variants={textBlockVariants}
              className="text-base text-bodyText leading-relaxed font-sans"
            >
              {isEn
                ? 'Her finder du ufiltrerede benchmarks, prompt-eksperimenter og mine personlige oplevelser med at køre modeller som Gemma 2-9B lokalt på min Mac uden skyen.'
                : 'Her finder du ufiltrerede benchmarks, prompt-eksperimenter og mine personlige oplevelser med at køre modeller som Gemma 2-9B lokalt på min Mac uden skyen.'}
            </motion.p>
          </div>

        </div>

      </motion.div>
    </section>
  );
};

export default AboutCard;
