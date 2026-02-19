"use client";

import React from 'react';
import { motion } from 'motion/react';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
}

const ProfileSection = ({ title, children, delay = 0 }: ProfileSectionProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-2"
    >
      <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4">
        {title}
      </h2>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
        {children}
      </div>
    </motion.section>
  );
};

export default ProfileSection;