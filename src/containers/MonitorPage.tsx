'use client';

import config from '../../config.json';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatUnits } from '@ethersproject/units';
import AudioPlayer from 'react-audio-player';
import TransactionRow from '@/components/TransactionRow';
import StatsBar from '@/components/StatsBar';
import { displayAddress } from '@/lib/lib';
import { Config, useSafeEffect, Profile } from '@citizenwallet/sdk';
import { useTransfers } from '@/state/transactions/logic';
import Image from 'next/image';
import { SpeakerLoudIcon, SpeakerOffIcon } from '@radix-ui/react-icons';
import { LoaderCircleIcon } from 'lucide-react';
import { List, AutoSizer } from 'react-virtualized';
import { useProfiles } from '@/state/profiles/logic';
import DonateQRCode from '@/components/DonateQRCode';
const dingSound = '/cashing.mp3';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { getUrlFromIPFS } from '@/lib/ipfs';
import { ExtendedTransfer } from '../../types';
import Avatars from '@/components/Avatars';

function formatDateToISO(date: Date) {
  // Extract the year, month, and day from the date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  // Extract the hours and minutes from the date
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

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

  const uniqueUsers = store((state) => {
    const filter = (t: any) =>
      !state.account || t.to === state.account || t.from === state.account;
    const users = new Set();
    state.transfers.filter(filter).forEach((t) => {
      users.add(t.from);
      users.add(t.to);
    });
    return users.size - (state.account ? 1 : 0);
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

  const TimePicker = ({ date }: { date: Date }) => (
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
      <Avatars items={[]}></Avatars>
    </div>
  );

  const defaultAvatar = `https://api.multiavatar.com/${accountAddress}.png`;

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
          <>
            {profile && (
              <div className="w-full flex items-center justify-center flex-col mt-0">
                <div className="mb-4">
                  <TimePicker date={date} />
                </div>
                <div className="flex flex-row items-center justify-center">
                  <Image
                    src={getUrlFromIPFS(profile.image_small) || defaultAvatar}
                    alt="Profile avatar"
                    className="rounded-full my-1 h-16 absolute"
                    height={64}
                    width={64}
                  />
                  <DonateQRCode
                    communitySlug={communitySlug}
                    accountAddress={accountAddress}
                    donateUrl={`${
                      process.env.NEXT_PUBLIC_WEBAPP_URL || ''
                    }/${communitySlug}/${accountAddress}/donate?collectiveSlug=${collectiveSlug}&sendto=${accountAddress}@${communitySlug}`}
                  />
                </div>

                <div className="text-sm font-medium text-gray-500">
                  {profile.name}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  @{profile.username}
                </div>
              </div>
            )}
            {!profile && (
              <nav
                aria-label="breadcrumb"
                className="flex leading-none text-indigo-600 mb-2 justify-between w-full my-2 h-16"
              >
                <ol className="list-reset flex items-center ">
                  <li>
                    <a
                      onClick={() => actions.setAccount(null)}
                      href="#"
                      className="text-blue-600 hover:text-blue-800 block"
                    >
                      <div className="flex items-center justify-center w-9 h-9 sm:w-16 sm:h-16">
                        {loading && (
                          <LoaderCircleIcon className="animate-spin w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                        )}
                        {!loading && (
                          <Image
                            src={communityConfig.community.logo}
                            alt="Token Icon"
                            className="rounded-full"
                            height={64}
                            width={64}
                          />
                        )}
                      </div>
                    </a>
                  </li>
                  <li className="px-1">
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
                        {displayAddress(accountAddress, 'medium')}
                      </span>
                    </li>
                  )}
                </ol>
                <TimePicker date={date} />
              </nav>
            )}
          </>
        )}

        <StatsBar
          stats={{ totalTransfers, totalAmountTransferred, uniqueUsers }}
          currency={communityConfig.token.symbol}
        />

        <div className="w-full pl-0 md:pl-3 pr-1 h-full flex flex-col xl:flex-row items-start">
          {accountAddress && !profile && (
            <div className="w-1/3 h-[420px] xl-h-1/3 mx-auto xl:w-full xl:h-full">
              <DonateQRCode
                communitySlug={communitySlug}
                accountAddress={accountAddress}
                donateUrl={`${
                  process.env.NEXT_PUBLIC_WEBAPP_URL || ''
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
                          tx={transfers[index] as ExtendedTransfer}
                          showRecipient={accountAddress ? false : true}
                          config={communityConfig}
                          communitySlug={communitySlug}
                          datetime="relative"
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
