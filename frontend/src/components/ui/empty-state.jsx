import React from 'react';
import { FileX2 } from "lucide-react";
import { motion } from 'framer-motion';

export function EmptyState({ icon: Icon = FileX2, title = "No results found", description = "Try adjusting your filters or search query.", action }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/20"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/40 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-display font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
