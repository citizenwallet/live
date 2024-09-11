import Image from "next/image";
import { displayAddress, getAvatarUrl } from "@/lib/lib";
import Link from "next/link";
import HumanNumber from "./HumanNumber";
import { getUrlFromIPFS } from "@/lib/ipfs";
import { Config, Profile, Transfer, TransferData } from "@citizenwallet/sdk";
import { formatUnits } from "ethers";
import { useEffect, useState } from "react";
import { ProfilesStore } from "@/state/profiles/state";
import moment from "moment";
import { StoreApi, UseBoundStore } from "zustand";


type ExtendedTransfer = Transfer & {
  fromProfile?: {
    name: string;
    imgsrc: string;
  };
  data: null | undefined | {
    description?: string;
    value?: number;
    currency?: string;
    valueUsd?: number;
    via?: string;
  };
};

export default function TransactionRow({
  config,
  tx,
  communitySlug,
  decimals,
  profiles,
  datetime,
  showRecipient,
  onProfileFetch,
  onProfileClick,
}: {
  config: Config;
  tx: ExtendedTransfer;
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

  const token = config.token;
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
    tx.from === "0x0000000000000000000000000000000000000000"
      ? config.community.logo
      : tx.fromProfile?.imgsrc
      ? tx.fromProfile.imgsrc
      : fromProfile?.image_medium && !fromImageError
      ? getUrlFromIPFS(fromProfile?.image_medium) || ""
      : getAvatarUrl(tx.from);

  const txDescription =
    tx.from === "0x0000000000000000000000000000000000000000"
      ? "Minting"
      : tx.data?.description || "No description";

  return (
    <div className="mr-3 w-full flex flex-col h-24 content-center">
      <div
        className={`relative flex flex-1 items-start p-0 sm:p-2 border-b ${backgroundColor} transition-colors`}
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
                className="rounded-full object-cover mr-1 sm:mr-4 max-h-[48px] max-w-[48px] sm:max-h-[60px] sm:max-w-[60px]"
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
              className="rounded-full object-cover mr-1 sm:mr-4 max-h-[48px] max-w-[48px] sm:max-h-[60px] sm:max-w-[60px]"
              onError={handleFromImageError}
            />
          )}
          {showRecipient && (
            <div
              className="w-[30px] h-[30px] rounded-full bg-white"
              style={{ position: "absolute", bottom: -5, right: 0 }}
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
                    fill={true}
                    alt="to avatar"
                    className="rounded-full object-fill object-center mr-1 w-full h-full max-h-[30px] max-w-[30px]"
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
                  className="rounded-full object-cover mr-1 w-full h-full object-center max-h-[30px] max-w-[30px]"
                  onError={handleToImageError}
                />
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between w-full">
          {txDescription && (
            <div className="text-lg sm:text-xl text-[#14023F] font-bold">
              {txDescription}
            </div>
          )}
          <div className="flex flex-row align-left w-full">
            <div className="flex flex-row flex-wrap text-xs sm:text-sm text-gray-500 font-bold">
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
              {tx.data?.via && (
                <div className="flex flex-nowrap mr-2">
                  <label className="block mr-1 float-left">via:</label>{" "}
                  {tx.data.via}
                </div>
              )}

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
            <span className="text-sm font-normal">{tx.data?.currency || token.symbol}</span>
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
