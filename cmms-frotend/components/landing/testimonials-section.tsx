"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { TESTIMONIALS } from "@/lib/constants";
import { Quote } from "lucide-react";

export function TestimonialsSection() {
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
            Testimonials
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
            Trusted by maintenance teams worldwide
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, rotateX: 10 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -5, boxShadow: "0 10px 40px -15px rgba(0,0,0,0.2)" }}
              className="relative rounded-2xl border border-border bg-card p-8 shadow-sm"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={isInView ? { scale: 1, rotate: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
              >
                <Quote className="h-10 w-10 text-primary/20" />
              </motion.div>
              <blockquote className="mt-4">
                <p className="text-base text-foreground leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </blockquote>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="mt-6 flex items-center gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
                >
                  <span className="text-lg font-semibold text-primary">
                    {testimonial.author.split(" ").map((n) => n[0]).join("")}
                  </span>
                </motion.div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-base text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
