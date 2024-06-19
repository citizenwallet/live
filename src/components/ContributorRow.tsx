import Image from "next/image";
import { displayAddress, getAvatarUrl } from "@/lib/lib";
import Link from "next/link";
import HumanNumber from "./HumanNumber";
import { getUrlFromIPFS } from "@/lib/ipfs";
import { ConfigToken, Profile, Transfer } from "@citizenwallet/sdk";
import { formatUnits } from "ethers";
import { useEffect, useState } from "react";
import { ProfilesStore } from "@/state/profiles/state";
import moment from "moment";
import { StoreApi, UseBoundStore } from "zustand";
export default function TransactionRow({
  token,
  decimals,
  contributorAddress,
  amount,
  profiles,
  showAmount = true,
  communitySlug,
}: {
  token: ConfigToken;
  contributorAddress: string;
  amount: number;
  decimals: number;
  communitySlug: string;
  showAmount?: boolean;
  profiles: UseBoundStore<StoreApi<ProfilesStore>>;
}) {
  console.log(">> ContributorRow.tsx", {
    token,
    amount,
    contributorAddress,
    profiles,
    communitySlug,
  });
  const [fromImageError, setFromImageError] = useState<boolean>(false);

  const fromProfile: Profile | undefined = profiles(
    (state) => state.profiles[contributorAddress]
  );

  const handleFromImageError = (event: any) => {
    setFromImageError(true);
  };

  if (!amount) return null;

  return (
    <div className="flex m-2">
      <div className="align-center text-center">
        <div className="flex w-[90px] h-[90px] mb-2 items-center">
          <Image
            src={
              fromProfile?.image_medium && !fromImageError
                ? getUrlFromIPFS(fromProfile.image_medium) || ""
                : getAvatarUrl(contributorAddress)
            }
            alt="from avatar"
            width={90}
            height={90}
            className="rounded-full object-cover mb-2 max-h-[90px] max-w-[90px]"
            onError={handleFromImageError}
          />
        </div>
        <div className="flex w-full align-center flex-row text-sm  text-gray-500">
          {fromProfile?.name ? (
            <div className="w-full">
              <div className="text-center font-bold h-5 overflow-hidden">
                {fromProfile.name}
              </div>
              <div className="text-center">@{fromProfile.username}</div>
            </div>
          ) : (
            displayAddress(contributorAddress)
          )}
        </div>
      </div>
      {showAmount && (
        <div className="flex flex-col text-xl sm:text-2xl md:text-3xl font-bold text-gray-600 text-right">
          <HumanNumber value={formatUnits(BigInt(amount), decimals)} />{" "}
          <span className="text-sm font-normal">{token.symbol}</span>
        </div>
      )}
    </div>
  );
}
