import React from "react";

const HumanNumber = ({ value }) => {
  const formattedNumber = new Intl.NumberFormat(navigator.language).format(
    value
  );

  return <div>{formattedNumber}</div>;
};

export default HumanNumber;
