"use client";

import React, { useState, useRef, useEffect } from "react";
import HumanNumber from "./HumanNumber";
import CountUp from "react-countup";

const AnimatedNumber = ({
  value,
  decimals = 0,
  duration = 10,
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) => {
  return (
    <div
      className={`${
        className ? className : "text-3xl sm:text-4xl md:text-5xl font-bold"
      } transition ease-in-out duration-150`}
    >
      <CountUp
        duration={duration}
        className="counter"
        end={value}
        preserveValue={true}
      />
    </div>
  );
};

export default AnimatedNumber;
