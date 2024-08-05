"use client";

import config from "../../config.json";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatUnits } from "@ethersproject/units";
import AudioPlayer from "react-audio-player";
import TransactionRow from "@/components/TransactionRow";
import ContributorRow from "@/components/ContributorRow";
import Loading from "@/components/Loading";
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
const dingSound = "/cashing.mp3";

function ThankYouPage({
  communityConfig,
  accountAddress,
  collectiveSlug,
}: {
  communityConfig: Config;
  accountAddress: string;
  collectiveSlug: string;
}) {
  // @ts-ignore
  const settings = config[accountAddress];

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
    settings?.opencollectiveSlug,
    settings?.givethProjectId,
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
    if (settings?.opencollectiveSlug) {
      actions.setOpencollectiveSlug(settings?.opencollectiveSlug);
    }
    if (settings?.givethProjectId) {
      actions.setGivethProjectId(settings?.givethProjectId);
    }
    actions.loadFrom(new Date("2024-07-01T00:00:00Z"));
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
      <div className="flex flex-row justify-center p-4 bg-[#F8F7F3] w-full h-full overflow-hidden">
        <AudioPlayer
          src={dingSound}
          // @ts-ignore
          ref={(element) => (window.audio = element)}
        />
        <div className="flex flex-col w-2/3">
          <div className="w-full flex flex-row mt-4 mb-8">
            <h1 className="text-5xl font-bold leading-tight">
              Thank you to the {stats.totalContributors} financial contributors
              and all the volunteers that made this event possible 🙏
            </h1>
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

          <div className="w-full flex flex-row h-full">
            <div className="w-full">
              <div className="mb-4 w-full">
                <div className="bg-white shadow rounded-3xl p-4 flex items-center justify-between h-full overflow-hidden w-full">
                  <div className="w-full">
                    <div className="flex flex-wrap flex-row overflow-hidden mt-4 mb-0 h-full w-full">
                      {stats.leaderboard.slice(0, 200).map((entry, index) => (
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
            <h3 className="text-xl font-bold text-[#8F8A9D] mt-2 mb-4 text-center">
              Latest contributions
            </h3>

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
                            tx={transfers[index]}
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

export default ThankYouPage;
