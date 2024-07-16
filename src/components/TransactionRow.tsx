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
import { on } from "events";
export default function TransactionRow({
  token,
  tx,
  communitySlug,
  decimals,
  profiles,
  datetime,
  showRecipient,
  onProfileFetch,
  onProfileClick,
}: {
  token: ConfigToken;
  tx: Transfer & {
    fromProfile?: {
      name: string;
      imgsrc: string;
    };
  };
  communitySlug: string;
  decimals: number;
  profiles: UseBoundStore<StoreApi<ProfilesStore>>;
  datetime?: string;
  showRecipient?: boolean;
  onProfileFetch: (account: string) => void;
  onProfileClick?: (account: string) => void;
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

  const backgroundColor =
    tx.status === "success" ? "highlight-animation bg-white" : "bg-white";

  const fromProfileImage =
    tx.fromProfile?.imgsrc || (fromProfile?.image_medium && !fromImageError)
      ? getUrlFromIPFS(fromProfile.image_medium) || ""
      : getAvatarUrl(tx.from);

  return (
    <div className="mr-3 w-full flex flex-col h-24 content-center">
      <div
        className={`relative flex flex-1 items-center p-2 border-b ${backgroundColor} transition-colors`}
      >
        <div className="relative mr-2">
          {onProfileClick && (
            <a href={`#${tx.from}`} onClick={() => onProfileClick(tx.from)}>
              <Image
                unoptimized
                src={fromProfileImage}
                alt="from avatar"
                width={60}
                height={60}
                className="rounded-full object-cover mr-4 max-h-[60px] max-w-[60px]"
                onError={handleFromImageError}
              />
            </a>
          )}
          {!onProfileClick && (
            <Image
              unoptimized
              src={fromProfileImage}
              alt="from avatar"
              width={60}
              height={60}
              className="rounded-full object-cover mr-4 max-h-[60px] max-w-[60px]"
              onError={handleFromImageError}
            />
          )}
          {showRecipient && (
            <div
              className="  "
              style={{ position: "absolute", bottom: -5, right: -5 }}
            >
              {onProfileClick && (
                <a href={`#${tx.to}`} onClick={() => onProfileClick(tx.to)}>
                  <Image
                    unoptimized
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
              )}
              {!onProfileClick && (
                <Image
                  unoptimized
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
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between w-full">
          {tx.data && (
            <div className="text-xl text-[#14023F] font-bold">
              {tx.data.description || "No description"}
            </div>
          )}
          <div className="flex flex-row align-left w-full">
            <div className="flex flex-row flex-wrap text-sm  text-gray-500 font-bold">
              <div className="flex flex-nowrap mr-2">
                <label className="block mr-1 float-left">from:</label>{" "}
                {onProfileClick && (
                  <a
                    href={`#${tx.from}`}
                    onClick={() => onProfileClick(tx.from)}
                  >
                    {tx.fromProfile?.name ? tx.fromProfile?.name : ""}
                    {!tx.fromProfile?.name && fromProfile?.name ? (
                      <div>
                        <span className="font-bold">{fromProfile.name}</span>
                        <span>&nbsp;(@{fromProfile.username})</span>
                      </div>
                    ) : (
                      !tx.fromProfile?.name && displayAddress(tx.from)
                    )}
                  </a>
                )}
                {!onProfileClick && (
                  <>
                    {tx.fromProfile?.name ? tx.fromProfile?.name : ""}
                    {!tx.fromProfile?.name && fromProfile?.name ? (
                      <div>
                        <span className="font-bold">{fromProfile.name}</span>
                        <span>&nbsp;(@{fromProfile.username})</span>
                      </div>
                    ) : (
                      !tx.fromProfile?.name && displayAddress(tx.from)
                    )}
                  </>
                )}
              </div>
              <div className="flex flex-nowrap">
                {showRecipient && (
                  <>
                    <label className="block mr-1 float-left">to:</label>{" "}
                    {onProfileClick && (
                      <a
                        href={`#${tx.to}`}
                        onClick={() => onProfileClick(tx.to)}
                      >
                        {toProfile?.name ? (
                          <div>
                            <span className="font-bold">{toProfile.name}</span>
                            <span>&nbsp;(@{toProfile.username})</span>
                          </div>
                        ) : (
                          displayAddress(tx.to)
                        )}{" "}
                      </a>
                    )}
                    {!onProfileClick && (
                      <>
                        {toProfile?.name ? (
                          <div>
                            <span className="font-bold">{toProfile.name}</span>
                            <span>&nbsp;(@{toProfile.username})</span>
                          </div>
                        ) : (
                          displayAddress(tx.to)
                        )}{" "}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col ml-2">
          <div className="flex flex-row w-full items-baseline text-xl sm:text-2xl md:text-3xl font-bold text-gray-600 text-right justify-end">
            <HumanNumber
              value={formatUnits(BigInt(tx.value), decimals)}
              precision={2}
            />{" "}
            <span className="text-sm font-normal">{token.symbol}</span>
          </div>
          <div className="text-xs text-gray-500 text-nowrap text-right">
            {datetime === "relative"
              ? moment(tx.created_at).fromNow()
              : new Date(tx.created_at).toLocaleString()}
          </div>
        </div>
        {/* <div className="absolute bottom-1 right-1 text-xs text-gray-500">
        {tx.status === "success" ? "✅" : "⏳"}
      </div> */}
      </div>
    </div>
  );
}
