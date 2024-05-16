"use client";

import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { formatUnits } from "@ethersproject/units";
import AudioPlayer from "react-audio-player";
import ABI from "@/smartcontracts/ERC20.abi.json";
import profileABI from "@/smartcontracts/profile.abi.json";
import ErrorMessage from "@/components/ErrorMessage";
import TransactionRow from "@/components/TransactionRow";
import AnimatedNumber from "@/components/AnimatedNumber";
import Loading from "@/components/Loading";
import { displayAddress } from "@/lib/lib";
import { Config, useERC20 } from "@citizenwallet/sdk";

const dingSound = "/cashing.mp3";

function inc(obj: any, key: string, inc: number = 1) {
  if (!obj[key]) {
    obj[key] = inc;
  }
  obj[key] += inc;
}

const filter = (transactions: any[], accountAddress: string) => {
  if (!accountAddress) return transactions;
  return transactions.filter(
    (tx) => tx.from === accountAddress || tx.to === accountAddress
  );
};

function MonitorPage({
  communityConfig,
  accountAddress,
}: {
  communityConfig: Config;
  accountAddress: string;
}) {
  const tokenAddress = communityConfig.token.address;
  const chain = communityConfig.node.chain_id;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [listen, setListen] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    recipients: {
      transactionsCount: {},
      totalAmount: {},
    },
    senders: {
      transactionsCount: {},
      totalAmount: {},
    },
  });
  const statsRef = useRef(stats);

  const updateStats = useCallback((tx: any) => {
    inc(statsRef.current.recipients.transactionsCount, tx.to);
    inc(
      statsRef.current.recipients.totalAmount,
      tx.to,
      Math.round(parseFloat(parseFloat(tx.formattedAmount).toFixed(2)) * 100)
    );
    inc(statsRef.current.senders.transactionsCount, tx.from);
    inc(
      statsRef.current.senders.totalAmount,
      tx.from,
      Math.round(parseFloat(parseFloat(tx.formattedAmount).toFixed(2)) * 100)
    );
    // @ts-ignore
    window.stats = statsRef.current;
    setStats(statsRef.current);
  }, []);

  function handleStartListening() {
    setListen(true);
  }

  function handleClearTransactions() {
    // @ts-ignore
    window.clearTransactions();
  }

  const rpc = communityConfig.node.url;
  const provider = useMemo(() => new JsonRpcProvider(rpc), [rpc]);
  const tokenContract = useMemo(
    () => new Contract(tokenAddress, ABI, provider),
    [tokenAddress, provider]
  );
  const communitySlug = communityConfig.community.alias;

  const token = useMemo(
    () => ({
      decimals: communityConfig.token.decimals,
      symbol: communityConfig.token.symbol,
      address: communityConfig.token.address,
    }),
    [communityConfig]
  );

  useEffect(() => {
    // Load transactions from local storage
    const savedTransactions =
      JSON.parse(
        localStorage.getItem(`${chain}:${tokenAddress}-transactions`) || "[]"
      ) || [];

    if (savedTransactions.length > 0) {
      savedTransactions.forEach(updateStats);
    }
    const filteredTransactions = filter(savedTransactions, accountAddress);
    // console.log(
    //   ">>> filteredTransactions",
    //   filteredTransactions.length,
    //   filteredTransactions
    // );
    setTransactions(filteredTransactions);
    setTransactionsCount(filteredTransactions.length);
  }, [chain, tokenAddress, accountAddress, updateStats]);

  useEffect(() => {
    // @ts-ignore
    window.clearTransactions = () => {
      localStorage.removeItem(`${chain}:${tokenAddress}-transactions`);
      setTransactions([]);
      setTransactionsCount(0);
    };

    // @ts-ignore
    window.playSound = () => {
      // @ts-ignore
      window.audio.audioEl.current.play();
    };
    // @ts-ignore
    window.stopListening = () => setListen(false);
  }, [chain, tokenAddress, accountAddress]);

  useEffect(() => {
    if (!listen || !tokenContract || !tokenContract.filters) return;
    const transferEvent = tokenContract.filters.Transfer();

    const handleTransferEvent = (
      from: string,
      to: string,
      amount: bigint,
      event: any
    ) => {
      const newTransaction = {
        from,
        to,
        amount,
        formattedAmount: formatUnits(amount, token.decimals),
        currency: token.symbol,
        date: new Date(),
        hash: event.transactionHash,
        logIndex: event.logIndex,
        isNew: true,
      };
      updateStats(newTransaction);
      setTimeout(() => {
        newTransaction.isNew = false;
      }, 3000);
      // @ts-ignore
      window.playSound();
      setTransactions((prev) => {
        const updatedTransactions = [newTransaction, ...prev];
        localStorage.setItem(
          `${chain}:${token.address}-transactions`,
          JSON.stringify(updatedTransactions)
        );
        const filteredTransactions = filter(
          updatedTransactions,
          accountAddress
        );
        setTransactionsCount(filteredTransactions.length);
        return filteredTransactions;
      });
    };

    tokenContract.on(transferEvent, handleTransferEvent);

    return () => {
      tokenContract.off(transferEvent, handleTransferEvent);
    };
  }, [listen, chain, token, tokenContract, accountAddress, updateStats]);

  // Compute totals
  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.formattedAmount),
    0
  );

  if (!token) {
    return <div>Loading...</div>;
  }

  if (!tokenAddress || tokenAddress.length !== 42) {
    return ErrorMessage("Invalid token address");
  }

  if (error) {
    return ErrorMessage((error as any).error, {
      message: (error as any).message,
    });
  }

  return (
    <div className="container">
      <AudioPlayer
        src={dingSound}
        // @ts-ignore
        ref={(element) => (window.audio = element)}
      />
      <nav
        aria-label="breadcrumb"
        className="flex leading-none text-indigo-600 divide-x divide-indigo-400 mb-4"
      >
        <ol className="list-reset flex items-center ">
          <li>
            <Link href="#" className="text-blue-600 hover:text-blue-800">
              <img
                src={communityConfig.community.logo}
                alt="Token Icon"
                className="rounded-full mr-1 h-6"
              />
            </Link>
          </li>
          <li className="px-2">
            <Link
              href={`/${communitySlug}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {token.symbol}
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
      </nav>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500">
              Number of Transactions
            </div>
            <div className="text-3xl font-bold">
              <AnimatedNumber value={transactionsCount} />
            </div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500">
              Total Amount Transferred
            </div>
            <div className="text-3xl font-bold flex items-baseline">
              <div className="min-w-[110px] text-right mr-1">
                <AnimatedNumber value={totalAmount.toFixed(2)} decimals={2} />
              </div>
              {} <span className="font-normal text-sm">{token.symbol}</span>
            </div>
          </div>
        </div>
      </div>
      {!listen && (
        <div className="flex justify-center flex-col my-20">
          <div className="text-center">
            <button
              onClick={handleStartListening}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
            >
              <svg
                className="inline-block mr-2 -mt-1 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
              Start Listening
            </button>
          </div>
          {transactions.length > 0 && (
            <div className="mt-2 text-center">
              <a onClick={handleClearTransactions} href="#" className="text-sm">
                Clear Transactions
              </a>
            </div>
          )}
        </div>
      )}
      {listen && transactions.length === 0 && <Loading />}
      {listen && transactions.length > 0 && (
        <ul className="bg-white shadow rounded-lg">
          {transactions.map((tx, key) => (
            <TransactionRow
              key={key}
              tx={tx}
              token={token}
              communitySlug={communitySlug}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default MonitorPage;
