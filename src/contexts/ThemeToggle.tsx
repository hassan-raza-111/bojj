import React from "react";
import { Moon, Sun } from "lucide-react";
// import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-bojj-primary"
        aria-label="Toggle dark mode"
        title="Toggle dark mode"
      />
      <Moon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      
      {/* Visual indicator animation */}
      {/* <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        key={theme}
        className="ml-2 hidden md:block"
      >
        <motion.span
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-xs font-medium"
        >
          {isDark ? "Dark" : "Light"}
        </motion.span>
      </motion.div> */}
    </div>
  );
};

export default ThemeToggle;
