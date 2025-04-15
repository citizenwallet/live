import React from 'react';
import QRCode from 'react-qr-code';
import { generateReceiveLink } from '@citizenwallet/sdk';
type propsType = {
  communitySlug: string;
  donateUrl: string;
  accountAddress?: string;
};

const DonateBox = ({ communitySlug, accountAddress, donateUrl }: propsType) => {
  const url = donateUrl
    ? donateUrl
    : accountAddress
    ? generateReceiveLink(
        'https://app.citizenwallet.xyz',
        accountAddress,
        communitySlug
      )
    : null;

  if (!url) {
    return null;
  }

  return (
    <div className="text-center w-full">
      <div className="flex flex-col items-start justify-around w-full">
        <div
          className="flex bg-white rounded-lg p-4 w-full h-full items-center align-center text-center"
          style={{ maxHeight: '70vh' }}
        >
          <QRCode
            value={url}
            className="w-full h-full max-w-96 max-h-96 mx-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default DonateBox;
