"use client";
import React from "react";

const HumanNumber = ({ value, precision }) => {
  const locale = typeof window === "undefined" ? "en-US" : navigator.language;
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision || 2,
  }).format(value);
  return <div>{formattedNumber}</div>;
};

export default HumanNumber;
