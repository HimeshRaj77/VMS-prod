import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({ title, value, icon: Icon, trend, colorClass = "op-blue", trendUp = true }) {
  // Mapping the neo-brutalist semantic colors from our config
  const bgColors = {
    "op-red": "bg-[#ff3b30]",
    "op-orange": "bg-[#ff9500]",
    "op-yellow": "bg-[#ffcc00]",
    "op-green": "bg-[#34c759]",
    "op-teal": "bg-[#5ac8fa]",
    "op-blue": "bg-[#007aff]",
    "op-indigo": "bg-[#5856d6]",
    "op-purple": "bg-[#af52de]",
    "default": "bg-black"
  };

  const selectedBg = bgColors[colorClass] || bgColors.default;

  return (
    <motion.div 
      whileHover={{ y: -4, x: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="bg-card border-2 border-border p-5 shadow hover:shadow-lg transition-all relative group flex flex-col justify-between h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{title}</h3>
        <div className={`p-2 border-2 border-border ${selectedBg} text-white shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div>
        <div className="font-mono text-4xl font-bold tracking-tight text-foreground mb-2">{value}</div>
        
        <div className="flex items-center text-xs font-semibold">
          {trendUp ? (
            <span className="text-green-600 flex items-center bg-green-100 px-2 py-0.5 border border-green-600 mr-2">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {trend}
            </span>
          ) : (
             <span className="text-red-600 flex items-center bg-red-100 px-2 py-0.5 border border-red-600 mr-2">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              {trend}
            </span>
          )}
          <span className="text-muted-foreground uppercase tracking-wider text-[10px]">vs prev period</span>
        </div>
      </div>
    </motion.div>
  );
}
