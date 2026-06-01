"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { STEPS } from "@/lib/constants";

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-secondary py-20 lg:py-28" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How It Works
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
            Get started in minutes
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            A simple process to transform your maintenance operations.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connection Line (Desktop) */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ originX: 0 }}
            className="absolute left-0 right-0 top-8 hidden h-0.5 bg-border lg:block"
          />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
                className="relative text-center"
              >
                {/* Step Number */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20, 
                    delay: 0.3 + index * 0.15 
                  }}
                  whileHover={{ scale: 1.1 }}
                  className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-background bg-primary text-xl font-bold text-primary-foreground shadow-lg"
                >
                  {step.step}
                </motion.div>

                {/* Content */}
                <h3 className="mt-6 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-base text-muted-foreground">{step.description}</p>

                {/* Connector Arrow (Mobile) */}
                {index < STEPS.length - 1 && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={isInView ? { scaleY: 1 } : {}}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.15 }}
                    style={{ originY: 0 }}
                    className="mx-auto mt-4 h-8 w-0.5 bg-border sm:hidden"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
