"use client";

import config from "../../config.json";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatUnits } from "@ethersproject/units";
import AudioPlayer from "react-audio-player";
import TransactionRow from "@/components/TransactionRow";
import StatsBar from "@/components/StatsBar";
import { displayAddress } from "@/lib/lib";
import { Config, useSafeEffect, Profile } from "@citizenwallet/sdk";
import { useTransfers } from "@/state/transactions/logic";
import Image from "next/image";
import { SpeakerLoudIcon, SpeakerOffIcon } from "@radix-ui/react-icons";
import { LoaderCircleIcon } from "lucide-react";
import { List, AutoSizer } from "react-virtualized";
import { useProfiles } from "@/state/profiles/logic";
import DonateQRCode from "@/components/DonateQRCode";
const dingSound = "/cashing.mp3";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

function formatDateToISO(date: Date) {
  // Extract the year, month, and day from the date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");

  // Extract the hours and minutes from the date
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Combine the parts into the desired format
  const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
  return formattedDate;
}

function MonitorPage({
  communityConfig,
  accountAddress,
  collectiveSlug,
  from,
  profile,
  showHeader,
}: {
  communityConfig: Config;
  accountAddress: string;
  collectiveSlug?: string;
  from?: string;
  profile?: Profile;
  showHeader?: boolean;
}) {
  showHeader = showHeader === undefined ? true : showHeader;

  const fromDate: Date = from
    ? new Date(from)
    : new Date(new Date().setHours(0, 0, 0, 0));

  // @ts-ignore
  const settings = config[accountAddress];
  const [soundOn, setSoundOn] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const communitySlug = communityConfig.community.alias;

  const unsubscribeRef = useRef<() => void | undefined>();

  function handleNewTransfers() {
    // @ts-ignore
    window.audio.audioEl.current.play();
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  }

  const [store, actions] = useTransfers(
    communityConfig,
    accountAddress,
    settings,
    handleNewTransfers
  );
  const [profilesStore, profilesActions] = useProfiles(communityConfig);

  function handleToggleSound() {
    if (soundOn) {
      // @ts-ignore
      window.audio.audioEl.current.muted = true;
      setSoundOn(false);
    } else {
      // @ts-ignore
      window.audio.audioEl.current.muted = false;
      // @ts-ignore
      window.audio.audioEl.current.play();
      setSoundOn(true);
    }
  }

  function handleStartListening() {
    if (accountAddress) {
      actions.setAccount(accountAddress);
    }
    unsubscribeRef.current = actions.listen();
    profilesActions.listenProfiles();
  }

  function handleStopListening() {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    profilesActions.stopListeningProfiles();
  }

  function handleFetchFrom(date: Date | undefined) {
    if (!date) {
      actions.clearTransfers();
      return;
    }

    actions.loadFrom(date);
  }

  const handleProfileFetch = useCallback(
    (account: string) => {
      profilesActions.fetchProfile(account);
    },
    [profilesActions]
  );

  useSafeEffect(() => {
    if (settings) {
      actions.setCommunitySettings(settings);
    }
    actions.loadFrom(fromDate);
    handleStartListening();
    return () => {
      profilesActions.stopListeningProfiles();
      handleStopListening();
    };
  }, [settings, profilesActions]);

  const transfers = store((state) => {
    if (state.account) {
      return state.transfers
        .filter((t) => t.to === state.account || t.from === state.account)
        .map((t) => {
          if (t.from === state.account) {
            t.value = -Math.abs(t.value);
          }
          return t;
        });
    } else {
      return state.transfers;
    }
  });

  // Compute totals
  const totalTransfers = store((state) => {
    if (state.account) {
      return state.transfers.filter(
        (t) => t.to === state.account || t.from === state.account
      ).length;
    } else {
      return state.transfers.length;
    }
  });

  const totalAmount = store((state) => {
    if (state.account) {
      return state.transfers
        .filter((t) => t.to === state.account || t.from === state.account)
        .reduce((acc, transfer) => acc + transfer.value, 0);
    } else {
      return state.transfers.reduce((acc, transfer) => acc + transfer.value, 0);
    }
  });

  const date = store((state) => state.fromDate);
  const loading = store((state) => state.loading);
  const totalAmountTransferred = parseFloat(
    formatUnits(BigInt(totalAmount), communityConfig.token.decimals)
  );

  console.log(">>> rendering transfers", transfers);
  return (
    <>
      {showConfetti && <Confetti width={width} height={height} />}
      <div className="h-screen w-screen overflow-hidden flex flex-col flex-1 mx-auto px-3">
        <AudioPlayer
          src={dingSound}
          // @ts-ignore
          ref={(element) => (window.audio = element)}
        />
        {showHeader && (
          <nav
            aria-label="breadcrumb"
            className="flex leading-none text-indigo-600 mb-4 justify-between w-full my-2 h-16"
          >
            <ol className="list-reset flex items-center ">
              <li>
                <a
                  onClick={() => actions.setAccount(null)}
                  href="#"
                  className="text-blue-600 hover:text-blue-800 min-w-6 block"
                >
                  <Image
                    src={communityConfig.community.logo}
                    alt="Token Icon"
                    className="rounded-full mr-1 h-16"
                    height={64}
                    width={64}
                  />
                </a>
              </li>
              <li className="px-2">
                <a
                  onClick={() => actions.setAccount(null)}
                  href="#"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {communityConfig.token.symbol}
                </a>
              </li>
              {accountAddress && (
                <li className="px-2">
                  <span className="text-gray-500">
                    {displayAddress(accountAddress, "medium")}
                  </span>
                </li>
              )}
            </ol>
            <div className="flex items-center">
              <div className="text-sm font-medium text-gray-500 p-2">from</div>
              <input
                className="h-6"
                type="datetime-local"
                value={formatDateToISO(date)}
                min="2020-01-01T00:00"
                max={formatDateToISO(new Date())}
                onChange={(e) => handleFetchFrom(new Date(e.target.value))}
                disabled={loading}
              />
              {!soundOn && (
                <a
                  onClick={handleToggleSound}
                  title="Sound on"
                  className="cursor-pointer flex items-center ml-2 w-6 text-center justify-center"
                >
                  <SpeakerOffIcon />
                </a>
              )}
              {soundOn && (
                <a
                  onClick={handleToggleSound}
                  title="Sound off"
                  className="cursor-pointer flex items-center ml-2 w-6 text-center justify-center"
                >
                  <SpeakerLoudIcon />
                </a>
              )}
            </div>
          </nav>
        )}

        <StatsBar
          stats={{ totalTransfers, totalAmountTransferred }}
          currency={communityConfig.token.symbol}
        />

        {loading && (
          <div className="flex justify-center items-center flex-col p-4">
            <LoaderCircleIcon className="animate-spin w-8 h-8 text-blue-500" />
            <div className="text-sm font-medium text-gray-500">
              Downloading transactions...
            </div>
          </div>
        )}
        <div className="w-full pl-3 pr-1 h-full flex flex-col xl:flex-row items-start">
          {accountAddress && (
            <div className="w-1/3 h-[420px] xl-h-1/3 mx-auto xl:w-full xl:h-full">
              <DonateQRCode
                communitySlug={communitySlug}
                accountAddress={accountAddress}
                donateUrl={`${
                  process.env.NEXT_PUBLIC_WEBAPP_URL || ""
                }/${communitySlug}/${accountAddress}/donate?collectiveSlug=${collectiveSlug}`}
              />
            </div>
          )}

          {transfers.length > 0 && (
            <div className="w-full h-full transactionsList">
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    width={width}
                    height={height}
                    rowHeight={96}
                    className="bg-white rounded-lg"
                    rowRenderer={({
                      index,
                      key,
                      style,
                    }: {
                      index: number;
                      key: string;
                      style: any;
                    }) => (
                      <div key={key} style={style} className="flex flex-row">
                        <TransactionRow
                          tx={transfers[index]}
                          showRecipient={accountAddress ? false : true}
                          config={communityConfig}
                          communitySlug={communitySlug}
                          decimals={communityConfig.token.decimals}
                          profiles={profilesStore}
                          onProfileFetch={handleProfileFetch}
                        />
                      </div>
                    )}
                    rowCount={transfers.length}
                    overscanRowCount={3}
                  />
                )}
              </AutoSizer>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MonitorPage;
