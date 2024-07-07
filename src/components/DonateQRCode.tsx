import React from "react";
import QRCode from "react-qr-code";
import { generateReceiveLink } from "@citizenwallet/sdk";
type propsType = {
  communitySlug: string;
  donateUrl: string;
  accountAddress: string;
};

const DonateBox = ({ communitySlug, accountAddress, donateUrl }: propsType) => {
  const url = donateUrl
    ? donateUrl
    : generateReceiveLink(
        "https://app.citizenwallet.xyz",
        accountAddress,
        communitySlug
      );
  return (
    <div className="text-center">
      <div className=" p-2 flex flex-col items-center justify-around">
        <div className="flex bg-white rounded-lg p-2 items-center align-center text-center">
          <QRCode value={url} size={500} className="w-full" />
        </div>
      </div>
    </div>
  );
};

export default DonateBox;
