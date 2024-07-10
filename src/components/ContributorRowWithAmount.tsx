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
  communitySlug,
}: {
  token: ConfigToken;
  contributorAddress: string;
  amount: number;
  decimals: number;
  communitySlug: string;
  profiles: UseBoundStore<StoreApi<ProfilesStore>>;
}) {
  const [fromImageError, setFromImageError] = useState<boolean>(false);

  const fromProfile: Profile | undefined = profiles(
    (state) => state.profiles[contributorAddress]
  );

  const handleFromImageError = (event: any) => {
    setFromImageError(true);
  };

  const extraProfiles: any = {
    Superchain:
      "https://pbs.twimg.com/profile_images/1696769956245807105/xGnB-Cdl_400x400.png",
    Metagov:
      "https://pbs.twimg.com/profile_images/1405958117444173831/JUsPuQdZ_400x400.png",
    Gnosis:
      "https://pbs.twimg.com/profile_images/1603829076346667022/6J-QZXPB_400x400.jpg",
    "Kevin Owocki":
      "https://pbs.twimg.com/profile_images/1769808533304844288/QXNWAaFS_400x400.jpg",
    Octant:
      "https://pbs.twimg.com/profile_images/1647279005513424898/E7aQiEty_400x400.png",
    "Blast.io":
      "https://pbs.twimg.com/profile_images/1805963937449381888/aNF8BIJo_400x400.jpg",
    POV: "https://pbs.twimg.com/profile_images/1544508987009269761/SU124WxA_400x400.jpg",
  };

  if (!amount) return null;
  console.log(">>> ContributorRow", { contributorAddress, fromProfile });

  return (
    <div className="flex flex-row w-full mt-4 mb-0 h-full ">
      <div className="flex m-2 w-full">
        <div className="align-center text-center mb-2">
          <div className="flex w-[70px] h-[70px] items-center">
            <Image
              unoptimized
              src={
                extraProfiles[contributorAddress]
                  ? extraProfiles[contributorAddress]
                  : fromProfile?.image_medium && !fromImageError
                  ? getUrlFromIPFS(fromProfile.image_medium) || ""
                  : getAvatarUrl(contributorAddress)
              }
              alt="from avatar"
              width={70}
              height={70}
              className="rounded-full object-cover mb-2 max-h-[70px] max-w-[70px]"
              onError={handleFromImageError}
            />
          </div>
        </div>
        <div className="flex w-full align-center flex-row text-gray-500 text-2xl ml-3">
          {fromProfile?.name ? (
            <div className="w-full text-3xl ">
              <div className="text-center font-bold h-5">
                {fromProfile.name}
              </div>
              <div className="text-center">@{fromProfile.username}</div>
            </div>
          ) : (
            displayAddress(contributorAddress)
          )}
        </div>
        <div className="flex flex-col text-xl sm:text-xl md:text-2xl font-bold text-gray-600 text-right w-full">
          <HumanNumber value={formatUnits(BigInt(amount), decimals)} />{" "}
          <span className="text-sm font-normal">{token.symbol}</span>
        </div>
      </div>
    </div>
  );
}
