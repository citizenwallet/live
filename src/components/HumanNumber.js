"use client";
import React from "react";

const HumanNumber = ({ value }) => {
  const locale = typeof window === "undefined" ? "en-US" : navigator.language;
  const formattedNumber = new Intl.NumberFormat(locale).format(value);

  return <div>{formattedNumber}</div>;
};

export default HumanNumber;
