import React from "react";
import QRCode from "react-qr-code";

type propsType = {
  token: {
    symbol: string;
  };
  accountAddress: string;
};

const DonateBox = ({ token, accountAddress }: propsType) => {
  return (
    <div className="text-center">
      <div className="bg-white rounded-xl p-4 flex flex-row items-center justify-around">
        <h2 className="text-4xl">Donate {token.symbol} to</h2>
        <div className="flex bg-white rounded-lg p-2 items-center align-center text-center">
          <QRCode value={accountAddress} size={256} />
        </div>
      </div>
    </div>
  );
};

export default DonateBox;
