import { Transfer } from '@citizenwallet/sdk';

type ExtendedTransfer = Transfer & {
  fromProfile?: {
    name: string;
    imgsrc: string;
  };
  currency: string;
  data: {
    description?: string;
    originalCurrency?: string;
    originalValue?: number;
    valueUSD?: number;
    valueEUR?: number;
    via?: string;
  } | null;
};
