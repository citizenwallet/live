"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatUnits } from "@ethersproject/units";
import AudioPlayer from "react-audio-player";
import TransactionRow from "@/components/TransactionRow";
import AnimatedNumber from "@/components/AnimatedNumber";
import Loading from "@/components/Loading";
import { displayAddress } from "@/lib/lib";
import { Config, useSafeEffect } from "@citizenwallet/sdk";
import { useTransfers } from "@/state/transactions/logic";
import Image from "next/image";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { LightningBoltIcon, StopIcon } from "@radix-ui/react-icons";
import { LoaderCircleIcon } from "lucide-react";
import { List, AutoSizer } from "react-virtualized";
import { useProfiles } from "@/state/profiles/logic";

const dingSound = "/cashing.mp3";

function MonitorPage({
  communityConfig,
  accountAddress,
}: {
  communityConfig: Config;
  accountAddress: string;
}) {
  const [listen, setListen] = useState(false);

  const communitySlug = communityConfig.community.alias;

  const unsubscribeRef = useRef<() => void | undefined>();

  const [store, actions] = useTransfers(communityConfig);
  const [profilesStore, profilesActions] = useProfiles(communityConfig);

  useSafeEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [actions]);

  useEffect(() => {
    // @ts-ignore
    window.playSound = () => {
      // @ts-ignore
      window.audio.audioEl.current.play();
    };
  }, []);

  function handleStartListening() {
    setListen(true);
    unsubscribeRef.current = actions.listen();
  }

  function handleStopListening() {
    setListen(false);
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
  }

  function handleClearTransactions() {
    actions.clearTransfers();
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

  const transfers = store((state) => state.transfers);

  // Compute totals
  const totalTransfers = store((state) => state.totalTransfers);
  const totalAmount = store((state) => state.totalAmount);

  const date = store((state) => state.fromDate);
  const loading = store((state) => state.loading);
  const totalAmountTransferred = formatUnits(
    BigInt(totalAmount),
    communityConfig.token.decimals
  );
  return (
    <>
      <div className="flex flex-col flex-1 w-full max-w-screen-lg mx-auto px-3">
        <AudioPlayer
          src={dingSound}
          // @ts-ignore
          ref={(element) => (window.audio = element)}
        />
        <nav
          aria-label="breadcrumb"
          className="flex leading-none text-indigo-600 mb-4 justify-between w-full my-2"
        >
          <ol className="list-reset flex items-center ">
            <li>
              <Link href="#" className="text-blue-600 hover:text-blue-800">
                <Image
                  src={communityConfig.community.logo}
                  alt="Token Icon"
                  className="rounded-full mr-1 h-6"
                  height={24}
                  width={24}
                />
              </Link>
            </li>
            <li className="px-2">
              <Link
                href={`/${communitySlug}`}
                className="text-blue-600 hover:text-blue-800"
              >
                {communityConfig.token.symbol}
              </Link>
            </li>
            {accountAddress && (
              <li className="px-2">
                <span className="text-gray-500">
                  {displayAddress(accountAddress)}
                </span>
              </li>
            )}
          </ol>
          {listen && (
            <a
              onClick={handleStopListening}
              title="Stop listening"
              className="cursor-pointer"
            >
              <Loading />
            </a>
          )}
        </nav>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">
                Number of Transactions
              </div>
              <div className="text-3xl font-bold">
                <AnimatedNumber value={totalTransfers} />
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">
                Total Amount Transferred
              </div>
              <div className="text-3xl font-bold flex items-baseline">
                <div className="text-right mr-1">
                  <AnimatedNumber
                    value={totalAmountTransferred}
                    decimals={parseInt(totalAmountTransferred) >= 10000 ? 0 : 2}
                  />
                </div>
                {}{" "}
                <span className="font-normal text-sm">
                  {communityConfig.token.symbol}
                </span>
              </div>
            </div>
          </div>
        </div>
        {!listen && (
          <div className="flex justify-center flex-col my-10">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 p-4">
                Load Transactions from
              </div>
              <DatePicker
                onChange={handleFetchFrom}
                value={date}
                disabled={loading}
              />
            </div>
          </div>
        )}
        {loading && (
          <div className="flex justify-center items-center flex-col p-4">
            <LoaderCircleIcon className="animate-spin w-8 h-8 text-blue-500" />
            <div className="text-sm font-medium text-gray-500">
              Downloading transactions...
            </div>
          </div>
        )}

        {!listen && !loading && (
          <div className="flex justify-center flex-col p-4">
            <div className="text-center">
              <Button
                onClick={handleStartListening}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
              >
                Show transactions
              </Button>
            </div>
            {transfers.length > 0 && (
              <div className="mt-2 text-center">
                <a
                  onClick={handleClearTransactions}
                  href="#"
                  className="text-sm"
                >
                  Clear Transactions
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="w-full pl-3 pr-1 h-full">
        {listen && transfers.length > 0 && (
          <div className="w-full h-full">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  width={width}
                  height={height}
                  rowHeight={90}
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
                        token={communityConfig.token}
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
    </>
  );
}

export default MonitorPage;
