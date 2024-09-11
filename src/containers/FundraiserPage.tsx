"use client";

import config from "../../config.json";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatUnits } from "@ethersproject/units";
import AudioPlayer from "react-audio-player";
import TransactionRow from "@/components/TransactionRow";
import ContributorRow from "@/components/ContributorRow";
import AnimatedNumber from "@/components/AnimatedNumber";
import Loading from "@/components/Loading";
import ProgressBar, { Milestone } from "@/components/ProgressBar";
import { Config, useSafeEffect } from "@citizenwallet/sdk";
import { useTransfers } from "@/state/transactions/logic";
import { PlayIcon } from "@radix-ui/react-icons";
import { LoaderCircleIcon } from "lucide-react";
import { List, AutoSizer } from "react-virtualized";
import { useProfiles } from "@/state/profiles/logic";
import DonateQRCode from "@/components/DonateQRCode";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { Transfer } from "@citizenwallet/sdk";
import ExpenseTracker from "@/components/ExpenseTracker";
const dingSound = "/cashing.mp3";

type ExtendedTransfer = Transfer & {
  fromProfile?: {
    name: string;
    imgsrc: string;
  };
  data: {
    description: string;
    value: number;
    currency: string;
    valueUsd: number;
    via: string;
  };
};

type Settings = {
  opencollectiveSlug?: string;
  giveth?: {
    projectId?: number;
    url?: string;
  };
  milestones: Milestone[];
};

function FundraiserPage({
  communityConfig,
  accountAddress,
  title,
  goal,
  collectiveSlug,
}: {
  communityConfig: Config;
  accountAddress: string;
  title: string;
  goal: number;
  collectiveSlug: string;
}) {
  // @ts-ignore
  const settings: Settings = (config[accountAddress] as Settings) || {};

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
      }, 4000);
    }
  }, []);

  const [store, actions] = useTransfers(
    communityConfig,
    accountAddress,
    settings,
    handleNewTransactions
  );
  const [profilesStore, profilesActions] = useProfiles(communityConfig);

  const handleStartListening = useCallback(() => {
    setListen(true);
    unsubscribeRef.current = actions.listen();
    profilesActions.listenProfiles();
  }, [profilesActions, actions]);

  const handleStopListening = useCallback(() => {
    setListen(false);
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    profilesActions.stopListeningProfiles();
  }, [profilesActions]);

  const handleProfileFetch = useCallback(
    (account: string) => {
      profilesActions.fetchProfile(account);
    },
    [profilesActions]
  );

  const handleProfileClick = (accountAddress: string) => {
    actions.setAccount(accountAddress);
  };

  useSafeEffect(() => {
    actions.setAccount(accountAddress);

    if (settings) {
      actions.setCommunitySettings(settings);
    }
    actions.loadFrom(new Date("2024-01-01T00:00:00Z"));
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [actions, accountAddress]);

  useSafeEffect(() => {
    // automatically start listening
    handleStartListening();
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
  }, [actions, handleStartListening]);

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

  const fromProfiles: any[] = [];
  const stats = store((state) => {
    const totalContributedBySender: Record<string, number> =
      state.transfers.reduce((acc, transfer) => {
        // @ts-ignore
        if (transfer.fromProfile) {
          // @ts-ignore
          fromProfiles[transfer.from as any] = transfer.fromProfile;
        }
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
  const progress =
    goal && Math.round((parseFloat(totalAmountTransferred) / goal) * 1000) / 10;

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} />}
      <div className="flex flex-row justify-center p-8 bg-[#F8F7F3] w-full h-full overflow-hidden">
        <AudioPlayer
          src={dingSound}
          // @ts-ignore
          ref={(element) => (window.audio = element)}
        />
        <div className="flex flex-col w-2/3">
          <div className="w-full flex flex-row mt-4 mb-12">
            <h1 className="text-7xl font-bold">{title}</h1>
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
          </div>
          {goal && (
            <ProgressBar
              percent={progress}
              goal={goal}
              tokenSymbol={communityConfig.token.symbol}
              milestones={settings?.milestones}
            />
          )}

          <div className="w-full flex flex-row h-full">
            <div className="w-1/2 flex flex-col">
              <div className="w-full flex flex-row justify-between items-center mb-4">
                <div className="w-full p-1 flex items-center flex-col text-left">
                  <div className="w-full text-left font-bold flex items-baseline">
                    <div className=" mr-1">
                      <AnimatedNumber
                        className="text-7xl font-bold text-right"
                        value={parseFloat(totalAmountTransferred)}
                        decimals={
                          parseInt(totalAmountTransferred) >= 10000 ? 0 : 2
                        }
                      />
                    </div>
                    {}{" "}
                    <span className="font-normal text-3xl">
                      {communityConfig.token.symbol}
                    </span>
                  </div>
                  <div className="w-full text-3xl text-left font-medium text-gray-500">
                    total raised
                  </div>
                </div>

                <div className=" w-full p-1 flex items-center text-right justify-end">
                  <div>
                    <div className="font-bold">
                      <AnimatedNumber
                        className="text-7xl"
                        value={stats.totalContributors}
                      />
                    </div>
                    <div className="text-3xl font-medium text-gray-500 text-right">
                      contributors
                    </div>
                  </div>
                </div>
              </div>

              {collectiveSlug && (
                <div className="bg-white rounded-3xl ">
                  <h3 className="text-xl font-bold text-[#8F8A9D] mt-2 text-center">
                    Expense tracker
                  </h3>
                  <p className="text-center text-sm mb-4 text-gray-600">
                    opencollective.com/{collectiveSlug}
                  </p>
                  <ExpenseTracker
                    collectiveSlug={collectiveSlug}
                    limit={10}
                    showStatus={false}
                  />
                </div>
              )}
            </div>
            <div className="w-1/2 ml-5">
              <div className="mb-4 w-full">
                <div className="bg-white shadow rounded-3xl p-4 flex items-center justify-between h-full overflow-hidden w-full">
                  <div className="w-full h-full">
                    <h3 className="text-xl font-bold text-[#8F8A9D] mt-2 mb-4 text-center">
                      Top contributors
                    </h3>
                    <div className="flex flex-wrap flex-row overflow-hidden mt-4 mb-0 h-full w-full">
                      {stats.leaderboard.slice(0, 30).map((entry, index) => (
                        <ContributorRow
                          key={entry.from}
                          communitySlug={communitySlug}
                          contributorAddress={entry.from}
                          profiles={profilesStore}
                          fromProfiles={fromProfiles}
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
            </div>
          </div>
        </div>

        <div className="flex flex-col ml-5 w-[480px]">
          <DonateQRCode
            communitySlug={communitySlug}
            accountAddress={accountAddress}
            donateUrl={`${
              process.env.NEXT_PUBLIC_WEBAPP_URL || ""
            }/${communitySlug}/${accountAddress}/donate?collectiveSlug=${collectiveSlug}`}
          />
          <div className="relative h-full bg-white rounded-3xl px-2 w-[480px] mx-auto mt-5">
            <h3 className="text-xl font-bold text-[#8F8A9D] mt-2 text-center">
              Latest financial contributions
            </h3>
            <p className="text-center text-sm mb-4 text-gray-600">
              credit card or crypto donations
            </p>

            {transfers.length > 0 && (
              <div className="w-full h-full">
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      width={width}
                      height={height - 60}
                      rowHeight={96}
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
                        <div key={key} style={style} className="flex flex-row">
                          <TransactionRow
                            tx={transfers[index] as ExtendedTransfer}
                            config={communityConfig}
                            communitySlug={communitySlug}
                            decimals={communityConfig.token.decimals}
                            profiles={profilesStore}
                            showRecipient={false}
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
    </>
  );
}

export default FundraiserPage;
