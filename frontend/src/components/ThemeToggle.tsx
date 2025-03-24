"use client"

import React from "react"
import { FiSun, FiMoon, FiSunset } from "react-icons/fi"
import { useTheme } from "../contexts/ThemeContext"

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("night-shift")
    else setTheme("light")
  }

  return (
    <div className="flex items-center">
      <button
        onClick={cycleTheme}
        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 night-shift:hover:bg-gray-700 transition-colors"
        title={`Current theme: ${theme}. Click to change.`}
      >
        {theme === "light" && <FiSun className="text-yellow-500" size={20} />}
        {theme === "dark" && <FiMoon className="text-blue-400" size={20} />}
        {theme === "night-shift" && <FiSunset className="text-orange-400" size={20} />}
      </button>
    </div>
  )
}

export default ThemeToggle

