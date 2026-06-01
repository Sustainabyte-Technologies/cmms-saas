"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ROLES } from "@/lib/constants";
import {
  Shield,
  Users,
  UserCheck,
  Wrench,
  Boxes,
  CreditCard,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Users,
  UserCheck,
  Wrench,
  Boxes,
  CreditCard,
};

export function RolesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="solutions" className="bg-background py-20 lg:py-28" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Role-Based Access
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-foreground">
            Tailored experiences for every team member
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Each role gets a customized dashboard and permissions suited to their responsibilities.
          </p>
        </motion.div>

        {/* Roles Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((role, index) => {
            const Icon = iconMap[role.icon];
            return (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-sm"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                >
                  {Icon && <Icon className="h-5 w-5 text-primary" />}
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
                  <p className="mt-1.5 text-base text-muted-foreground leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
