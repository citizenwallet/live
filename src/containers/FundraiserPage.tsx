"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatUnits } from "@ethersproject/units";
import AudioPlayer from "react-audio-player";
import TransactionRow from "@/components/TransactionRow";
import ContributorRow from "@/components/ContributorRow";
import AnimatedNumber from "@/components/AnimatedNumber";
import Loading from "@/components/Loading";
import { displayAddress } from "@/lib/lib";
import { Config, useSafeEffect } from "@citizenwallet/sdk";
import { useTransfers } from "@/state/transactions/logic";
import Image from "next/image";
import { PlayIcon } from "@radix-ui/react-icons";
import { LoaderCircleIcon } from "lucide-react";
import { List, AutoSizer } from "react-virtualized";
import { useProfiles } from "@/state/profiles/logic";
import DonateQRCode from "@/components/DonateQRCode";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { Transfer } from "@citizenwallet/sdk";

const dingSound = "/cashing.mp3";

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

function FundraiserPage({
  communityConfig,
  accountAddress,
  title,
}: {
  communityConfig: Config;
  accountAddress: string;
  title: string;
}) {
  const { width, height } = useWindowSize();

  const [listen, setListen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const communitySlug = communityConfig.community.alias;

  const unsubscribeRef = useRef<() => void | undefined>();

  const handleNewTransactions = useCallback((transactions: Transfer[]) => {
    console.log(">>> handleNewTransactions", transactions);
    if (transactions.length > 0) {
      // @ts-ignore
      window.playSound();
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
  }, []);

  const [store, actions] = useTransfers(
    communityConfig,
    accountAddress,
    handleNewTransactions
  );
  const [profilesStore, profilesActions] = useProfiles(communityConfig);

  useSafeEffect(() => {
    actions.setAccount(accountAddress);
    actions.loadFrom(new Date("2024-01-01T00:00:00Z"));
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [actions, accountAddress]);

  useSafeEffect(() => {
    return () => {
      profilesActions.stopListeningProfiles();
    };
  }, [profilesActions]);

  useEffect(() => {
    // @ts-ignore
    window.playSound = () => {
      // @ts-ignore
      window.audio.audioEl.current.play();
    };
    // @ts-ignore
    window.triggerNewTransaction = (tx) => {
      actions.triggerNewTransaction(tx);
    };
  }, [actions]);

  function handleStartListening() {
    setListen(true);
    unsubscribeRef.current = actions.listen();
    profilesActions.listenProfiles();
  }

  function handleStopListening() {
    setListen(false);
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    profilesActions.stopListeningProfiles();
  }

  const handleProfileFetch = useCallback(
    (account: string) => {
      profilesActions.fetchProfile(account);
    },
    [profilesActions]
  );

  const handleProfileClick = (accountAddress: string) => {
    actions.setAccount(accountAddress);
  };

  const selectedAccount = store((state) => state.account);
  const transfers = store((state) => {
    if (state.account) {
      return state.transfers.filter(
        (t) => t.to === state.account || t.from === state.account
      );
    } else {
      return state.transfers;
    }
  });

  // // Compute totals
  // const totalContributors = store((state) => {
  //   const uniqueFromCount = new Set(
  //     state.transfers.map((transfer) => transfer.from)
  //   ).size;
  //   return uniqueFromCount;
  // });

  const stats = store((state) => {
    const totalContributedBySender: Record<string, number> =
      state.transfers.reduce((acc, transfer) => {
        acc[transfer.from] = (acc[transfer.from] || 0) + transfer.value;
        return acc;
      }, {} as Record<string, number>);

    type LeaderboardEntry = {
      from: string;
      total: number;
    };
    // Step 2: Convert the object into an array of key-value pairs
    const leaderboard: LeaderboardEntry[] = Object.entries(
      totalContributedBySender
    ).map(([from, total]) => ({ from, total }));

    // Step 3: Sort the array by the total amounts in descending order
    const res = {
      leaderboard: leaderboard.sort((a, b) => b.total - a.total),
      totalContributors: leaderboard.length,
    };
    return res;
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
  const totalAmountTransferred = formatUnits(
    BigInt(totalAmount),
    communityConfig.token.decimals
  );
  return (
    <>
      {showConfetti && <Confetti width={width} height={height} />}
      <div className="flex flex-col flex-1 w-full mx-auto p-8 bg-gray-100 h-full overflow-hidden">
        <AudioPlayer
          src={dingSound}
          // @ts-ignore
          ref={(element) => (window.audio = element)}
        />
        <div className="w-full flex flex-row mt-4 mb-12">
          <div className="flex items-center mr-2 w-8">
            {loading && (
              <LoaderCircleIcon className="animate-spin flex items-center w-6 h-6 text-blue-500" />
            )}
            {!loading && !listen && (
              <a
                onClick={handleStartListening}
                title="Start listening"
                className="cursor-pointer flex items-center ml-2 w-6 text-center justify-center"
              >
                <PlayIcon />
              </a>
            )}
            {!loading && listen && (
              <a
                onClick={handleStopListening}
                title="Stop listening"
                className="cursor-pointer flex items-center ml-2 w-6 text-center justify-center"
              >
                <Loading />
              </a>
            )}
          </div>
          <h1 className="text-7xl font-bold">{title}</h1>
        </div>

        <div className="w-full flex flex-row h-full">
          <div className="w-2/3 flex flex-col">
            <div className="w-full items-center grid grid-cols-2 gap-4 mb-4">
              <div className=" w-full bg-white shadow rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-4xl font-medium text-gray-500">
                    Total Amount Raised
                  </div>
                  <div className="font-bold flex items-baseline">
                    <div className="text-right mr-1">
                      <AnimatedNumber
                        className="text-8xl font-bold text-right"
                        value={parseFloat(totalAmountTransferred)}
                        decimals={
                          parseInt(totalAmountTransferred) >= 10000 ? 0 : 2
                        }
                      />
                    </div>
                    {}{" "}
                    <span className="font-normal text-6xl">
                      {communityConfig.token.symbol}
                    </span>
                  </div>
                </div>
              </div>
              <div className=" w-full bg-white shadow rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-4xl font-medium text-gray-500">
                    Number of contributors
                  </div>
                  <div className="font-bold">
                    <AnimatedNumber
                      className="text-8xl"
                      value={stats.totalContributors}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between h-96 overflow-hidden">
                <div>
                  <div className="text-4xl font-medium text-gray-500 mb-4">
                    Top contributors
                  </div>
                  <div className="flex flex-wrap flex-row w-full overflow-hidden mt-4 mb-0 h-[300px] ">
                    {stats.leaderboard.map((entry, index) => (
                      <ContributorRow
                        key={entry.from}
                        communitySlug={communitySlug}
                        contributorAddress={entry.from}
                        profiles={profilesStore}
                        showAmount={false}
                        amount={entry.total}
                        token={communityConfig.token}
                        decimals={communityConfig.token.decimals}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DonateQRCode
              token={communityConfig.token}
              accountAddress={accountAddress}
            />
          </div>
          <div className="w-2/3 h-full ml-12">
            <div className="relative h-full">
              {transfers.length > 0 && (
                <div className="w-full h-full">
                  <AutoSizer>
                    {({ height, width }) => (
                      <List
                        width={width}
                        height={height - 40}
                        rowHeight={130}
                        className=" rounded-lg"
                        rowRenderer={({
                          index,
                          key,
                          style,
                        }: {
                          index: number;
                          key: string;
                          style: any;
                        }) => (
                          <div
                            key={key}
                            style={style}
                            className="flex flex-row"
                          >
                            <TransactionRow
                              tx={transfers[index]}
                              token={communityConfig.token}
                              communitySlug={communitySlug}
                              decimals={communityConfig.token.decimals}
                              profiles={profilesStore}
                              datetime="relative"
                              onProfileFetch={handleProfileFetch}
                              onProfileClick={handleProfileClick}
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
        </div>
      </div>
    </>
  );
}

export default FundraiserPage;
