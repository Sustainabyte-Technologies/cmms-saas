"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { TRUST_STATS } from "@/lib/constants";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background Pattern */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_-10%,rgba(249,115,22,0.1),transparent_50%)]"
      />
      
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex h-2 w-2 rounded-full bg-primary"
              />
              <span className="text-sm font-medium text-primary">New: AI-Powered Maintenance Predictions</span>
            </motion.div>
            
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Modern CMMS Platform for{" "}
              <motion.span
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: "100% 50%" }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                className="text-primary"
              >
                Maintenance Excellence
              </motion.span>
            </motion.h1>
            
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-base leading-relaxed text-muted-foreground"
            >
              Manage assets, work orders, preventive maintenance, inventory, and purchasing from one unified platform. Streamline your operations and reduce downtime.
            </motion.p>
            
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" asChild className="gap-2">
                  <Link href="/register">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button size="lg" variant="outline" asChild className="gap-2">
                  <Link href="#demo">
                    <Play className="h-4 w-4" />
                    Book Demo
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center gap-8 border-t border-border pt-8"
            >
              {TRUST_STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                >
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative lg:ml-auto"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative rounded-xl border border-border bg-card p-2 shadow-2xl"
            >
              <div className="overflow-hidden rounded-lg bg-secondary">
                {/* Mock Dashboard */}
                <div className="flex h-[400px] flex-col sm:h-[480px]">
                  {/* Header */}
                  <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3">
                    <div className="flex gap-1.5">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0 }}
                        className="h-3 w-3 rounded-full bg-destructive/60"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
                        className="h-3 w-3 rounded-full bg-warning/60"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
                        className="h-3 w-3 rounded-full bg-success/60"
                      />
                    </div>
                    <div className="flex-1 text-center">
                      <div className="mx-auto h-4 w-48 rounded bg-muted" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-1">
                    {/* Sidebar */}
                    <div className="hidden w-48 border-r border-border bg-card p-3 sm:block">
                      <div className="space-y-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className={`h-8 rounded ${i === 0 ? "bg-primary" : "bg-muted"}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 p-4">
                      {/* KPI Cards */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="rounded-lg border border-border bg-card p-3"
                          >
                            <div className="h-3 w-12 rounded bg-muted" />
                            <div className="mt-2 h-6 w-16 rounded bg-primary/20" />
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Charts */}
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.9 }}
                          className="rounded-lg border border-border bg-card p-3"
                        >
                          <div className="h-3 w-24 rounded bg-muted" />
                          <div className="mt-3 flex items-end gap-1">
                            {[40, 65, 45, 80, 55, 70, 60].map((h, i) => (
                              <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}px` }}
                                transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                                className="flex-1 rounded-t bg-primary/30"
                              />
                            ))}
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1 }}
                          className="rounded-lg border border-border bg-card p-3"
                        >
                          <div className="h-3 w-24 rounded bg-muted" />
                          <div className="mt-3 flex items-center justify-center">
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 1.2, type: "spring" }}
                              className="h-20 w-20 rounded-full border-8 border-primary/30"
                            />
                          </div>
                        </motion.div>
                      </div>
                      
                      {/* Table */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 }}
                        className="mt-4 rounded-lg border border-border bg-card p-3"
                      >
                        <div className="h-3 w-32 rounded bg-muted" />
                        <div className="mt-3 space-y-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 1.4 + i * 0.1 }}
                              className="flex gap-3"
                            >
                              <div className="h-4 flex-1 rounded bg-muted" />
                              <div className="h-4 w-20 rounded bg-muted" />
                              <div className="h-4 w-16 rounded bg-success/30" />
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="absolute -bottom-4 -left-4 h-24 w-24 rounded-xl bg-primary/10"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-success/10"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
