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
  fromProfiles,
  showAmount = true,
  showUsernames = false,
  communitySlug,
}: {
  token: ConfigToken;
  contributorAddress: string;
  amount: number;
  decimals: number;
  communitySlug: string;
  fromProfiles?: any[];
  showAmount?: boolean;
  showUsernames?: boolean;
  profiles: UseBoundStore<StoreApi<ProfilesStore>>;
}) {
  const [fromImageError, setFromImageError] = useState<boolean>(false);

  const fromProfile: Profile | undefined = profiles(
    (state) => state.profiles[contributorAddress]
  );

  const handleFromImageError = (event: any) => {
    setFromImageError(true);
  };

  if (!amount) return null;
  const profile: any =
    (fromProfiles && fromProfiles[contributorAddress as any]) || fromProfile;
  const avatar = profile?.imgsrc
    ? profile.imgsrc
    : profile?.image_medium && !fromImageError
    ? getUrlFromIPFS(profile.image_medium) || ""
    : getAvatarUrl(contributorAddress);

  return (
    <div className="flex m-2">
      <a
        title={`Total contributed: ${parseFloat(
          formatUnits(BigInt(amount), decimals)
        ).toFixed(2)} ${token.symbol}`}
      >
        <div className="align-center text-center mb-2 w-[80px]">
          <div className="mx-auto w-[70px] h-[70px]">
            <Image
              unoptimized
              src={avatar}
              alt="from avatar"
              width={70}
              height={70}
              className="rounded-full object-cover mb-2 max-h-[70px] max-w-[70px]"
              onError={handleFromImageError}
            />
          </div>
          <div className="text-center text-sm text-gray-500 max-h-3 text-ellipsis">
            {profile?.name ? (
              <div className="w-full justify-center max-h-8">
                <div className="text-center font-bold h-5 overflow-hidden ">
                  {profile.name}
                </div>
                {showUsernames && (
                  <div className="text-center">@{profile.username}</div>
                )}
              </div>
            ) : (
              displayAddress(contributorAddress)
            )}
          </div>
        </div>
      </a>
      {showAmount && (
        <div className="flex flex-col text-xl sm:text-2xl md:text-3xl font-bold text-gray-600 text-right">
          <HumanNumber value={formatUnits(BigInt(amount), decimals)} />{" "}
          <span className="text-sm font-normal">{token.symbol}</span>
        </div>
      )}
    </div>
  );
}
