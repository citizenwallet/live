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
  tx,
  communitySlug,
  decimals,
  profiles,
  datetime,
  onProfileFetch,
  onProfileClick,
}: {
  token: ConfigToken;
  tx: Transfer;
  communitySlug: string;
  decimals: number;
  profiles: UseBoundStore<StoreApi<ProfilesStore>>;
  datetime?: string;
  onProfileFetch: (account: string) => void;
  onProfileClick: (account: string) => void;
}) {
  const [fromImageError, setFromImageError] = useState<boolean>(false);
  const [toImageError, setToImageError] = useState<boolean>(false);

  const fromProfile: Profile | undefined = profiles(
    (state) => state.profiles[tx.from]
  );
  const toProfile: Profile | undefined = profiles(
    (state) => state.profiles[tx.to]
  );

  useEffect(() => {
    onProfileFetch(tx.from);
    onProfileFetch(tx.to);
  }, [onProfileFetch, tx.from, tx.to]);

  const handleFromImageError = (event: any) => {
    setFromImageError(true);
  };

  const handleToImageError = (event: any) => {
    setToImageError(true);
  };

  console.log(">>> tx", JSON.stringify(tx));

  const backgroundColor =
    tx.status === "success" ? "highlight-animation bg-white" : "bg-yellow-200";

  return (
    <div className="my-3 mr-3 w-full flex flex-col ">
      <div className="text-xs text-gray-500">
        {datetime === "relative"
          ? moment(tx.created_at).fromNow()
          : new Date(tx.created_at).toLocaleString()}
      </div>
      <div
        className={`relative flex flex-1 items-center p-4 border border-gray-200 rounded-lg ${backgroundColor} transition-colors`}
      >
        <div className="relative mr-3">
          <a href={`#${tx.from}`} onClick={() => onProfileClick(tx.from)}>
            <Image
              src={
                fromProfile?.image_medium && !fromImageError
                  ? getUrlFromIPFS(fromProfile.image_medium) || ""
                  : getAvatarUrl(tx.from)
              }
              alt="from avatar"
              width={60}
              height={60}
              className="rounded-full object-cover mr-4 max-h-[60px] max-w-[60px]"
              onError={handleFromImageError}
            />
          </a>
          <div
            className="  "
            style={{ position: "absolute", bottom: -5, right: -5 }}
          >
            <a href={`#${tx.to}`} onClick={() => onProfileClick(tx.to)}>
              <Image
                src={
                  toProfile?.image_medium && !toImageError
                    ? getUrlFromIPFS(toProfile.image_medium) || ""
                    : getAvatarUrl(tx.to)
                }
                width={30}
                height={30}
                alt="to avatar"
                className="rounded-full object-cover mr-1 max-h-[30px] max-w-[30px]"
                onError={handleToImageError}
              />
            </a>
          </div>
        </div>
        <div className="flex flex-col justify-between w-full">
          <div className="flex flex-row align-left w-full">
            <div className="flex flex-row text-sm  text-gray-500">
              <label className="block mr-1 float-left">From:</label>{" "}
              <a href={`#${tx.from}`} onClick={() => onProfileClick(tx.from)}>
                {fromProfile?.name ? (
                  <div>
                    <span className="font-bold">{fromProfile.name}</span>
                    <span>&nbsp;(@{fromProfile.username})</span>
                  </div>
                ) : (
                  displayAddress(tx.from)
                )}
              </a>
              <label className="block ml-2 mr-1 float-left">To:</label>{" "}
              <a href={`#${tx.to}`} onClick={() => onProfileClick(tx.to)}>
                {toProfile?.name ? (
                  <div>
                    <span className="font-bold">{toProfile.name}</span>
                    <span>&nbsp;(@{toProfile.username})</span>
                  </div>
                ) : (
                  displayAddress(tx.to)
                )}{" "}
              </a>
            </div>
          </div>
          {tx.data && (
            <div className="text-2xl text-gray-500 font-bold my-2">
              {tx.data.description || "No description"}
            </div>
          )}
        </div>
        <div className="flex flex-col text-xl sm:text-2xl md:text-3xl font-bold text-gray-600 text-right">
          <HumanNumber value={formatUnits(BigInt(tx.value), decimals)} />{" "}
          <span className="text-sm font-normal">{token.symbol}</span>
        </div>
        {/* <div className="absolute bottom-1 right-1 text-xs text-gray-500">
        {tx.status === "success" ? "✅" : "⏳"}
      </div> */}
      </div>{" "}
    </div>
  );
}
