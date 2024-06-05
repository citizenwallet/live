"use client";

import React, { useState, useRef, useEffect } from "react";
import HumanNumber from "./HumanNumber";

const AnimatedNumber = ({ value, decimals = 0, duration = 1000 }) => {
  const [displayNumber, setDisplayNumber] = useState(value * 10 ** decimals);

  const currentValue = useRef(value * 10 ** decimals);
  const interval = 20;

  useEffect(() => {
    const totalChange = value * 10 ** decimals - currentValue.current;
    if (totalChange === 0) {
      return;
    }
    const increment = Math.ceil(totalChange / (duration / interval));

    const intervalId = setInterval(() => {
      currentValue.current += increment;
      if (
        (increment > 0 && currentValue.current >= value * 10 ** decimals) ||
        (increment < 0 && currentValue.current <= value * 10 ** decimals)
      ) {
        currentValue.current = value * 10 ** decimals;
        clearInterval(intervalId);
      }
      setDisplayNumber(currentValue.current);
    }, interval);

    return () => clearInterval(intervalId);
  }, [value, decimals, duration]);

  return (
    <div className="text-3xl sm:text-4xl md:text-5xl font-bold transition ease-in-out duration-150">
      <HumanNumber
        value={parseFloat(displayNumber / 10 ** decimals).toFixed(decimals)}
      />
    </div>
  );
};

export default AnimatedNumber;
