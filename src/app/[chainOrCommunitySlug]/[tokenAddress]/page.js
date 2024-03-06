"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { formatUnits } from "@ethersproject/units";
import { ethers } from "ethers"; // for other utilities
import { useRouter } from "next/navigation";
import Image from "next/image";
import AudioPlayer from "react-audio-player";
import ABI from "@/smartcontracts/ERC20.abi.json";
import ErrorMessage from "@/components/ErrorMessage";
import AnimatedNumber from "@/components/AnimatedNumber";
import Loading from "@/components/Loading";
import HumanNumber from "@/components/HumanNumber";
import {
  displayAddress,
  getAvatarUrl,
  getChainInfo,
  getTokenAddress,
} from "@/lib/lib";
import ChainIcon from "@/components/ChainIcon";

const dingSound = "/cashing.mp3";

function inc(obj, key, inc = 1) {
  if (!obj[key]) {
    obj[key] = inc;
  }
  obj[key] += inc;
}

const filter = (transactions, accountAddress) => {
  if (!accountAddress) return transactions;
  return transactions.filter(
    (tx) => tx.from === accountAddress || tx.to === accountAddress
  );
};

function MonitorPage(request) {
  const router = useRouter();

  let { chainOrCommunitySlug: chain, tokenAddress } = request.params;
  const { accountAddress } = request.searchParams;

  tokenAddress =
    tokenAddress.substr(0, 2) === "0x"
      ? tokenAddress
      : getTokenAddress(chain, tokenAddress);

  const [provider, setProvider] = useState(null);
  const [tokenContract, setTokenContract] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [token, setToken] = useState({});
  const [listen, setListen] = useState(false);
  const [chainId, setChainId] = useState(null);
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

  const updateStats = useCallback((tx) => {
    inc(statsRef.current.recipients.transactionsCount, tx.to);
    inc(
      statsRef.current.recipients.totalAmount,
      tx.to,
      Math.round(parseFloat(tx.formattedAmount).toFixed(2) * 100)
    );
    inc(statsRef.current.senders.transactionsCount, tx.from);
    inc(
      statsRef.current.senders.totalAmount,
      tx.from,
      Math.round(parseFloat(tx.formattedAmount).toFixed(2) * 100)
    );
    window.stats = statsRef.current;
    setStats(statsRef.current);
  }, []);

  function handleStartListening() {
    setListen(true);
  }

  function handleClearTransactions() {
    window.clearTransactions();
  }

  useEffect(() => {
    const rpc = localStorage.getItem(`${chain}-rpc`) || getChainInfo(chain).rpc;

    if (!rpc && !window.ethereum) {
      return setError("Please install MetaMask or provide a RPC URL");
    }

    const provider = rpc
      ? new JsonRpcProvider(rpc)
      : new Web3Provider(window.ethereum);
    const tokenContract = new Contract(tokenAddress, ABI, provider);
    const token = {};
    const fetchDecimals = async (tokenContract) => {
      try {
        token.decimals = await tokenContract.decimals();
        token.symbol = await tokenContract.symbol();
        token.address = tokenAddress;
        setToken(token);
      } catch (error) {
        console.error(
          "Error fetching token info on",
          chain,
          JSON.stringify(error, null, "  ")
        );
        setError({
          error: `Error fetching token info on ${chain}`,
          message: error.reason,
        });
      }
    };

    setProvider(provider);
    setTokenContract(tokenContract);
    fetchDecimals(tokenContract);

    // Load transactions from local storage
    const savedTransactions =
      JSON.parse(
        localStorage.getItem(`${chain}:${tokenAddress}-transactions`)
      ) || [];

    if (savedTransactions.length > 0) {
      token.symbol = token.symbol || savedTransactions[0].currency;
      savedTransactions.forEach(updateStats);
      setToken(token);
    }
    setTransactions(filter(savedTransactions, accountAddress));
  }, [chain, tokenAddress, accountAddress, updateStats]);

  useEffect(() => {
    window.clearTransactions = () => {
      localStorage.setItem(`${chain}:${tokenAddress}-transactions`, null);
      setTransactions([]);
    };

    window.setRPC = (rpc) => {
      localStorage.setItem(`${chain}-rpc`, rpc);
      // reload page
      window.history.go(0);
    };

    window.playSound = () => {
      window.audio.audioEl.current.play();
    };
    window.stopListening = () => setListen(false);
  }, [chain, tokenAddress, accountAddress]);

  useEffect(() => {
    if (!listen || !tokenContract || !tokenContract.filters) return;
    const transferEvent = tokenContract.filters.Transfer();

    tokenContract.on(transferEvent, (from, to, amount, event) => {
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
      window.playSound();
      setTransactions((prev) => {
        const updatedTransactions = [newTransaction, ...prev];
        localStorage.setItem(
          `${chain}:${token.address}-transactions`,
          JSON.stringify(updatedTransactions)
        );
        return filter(updatedTransactions, accountAddress);
      });
    });

    return () => {
      tokenContract.off(transferEvent);
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
    return ErrorMessage(error.error, { message: error.message });
  }

  return (
    <div className="container">
      <AudioPlayer
        src={dingSound}
        ref={(element) => (window.audio = element)}
      />
      <nav
        aria-label="breadcrumb"
        className="flex leading-none text-indigo-600 divide-x divide-indigo-400 mb-4"
      >
        <ol className="list-reset flex items-center ">
          <li>
            <Link href="#" className="text-blue-600 hover:text-blue-800">
              <ChainIcon chainName={chain} />
            </Link>
          </li>
          <li className="px-2">
            <Link
              href={`/${chain}/${request.params.tokenAddress}`}
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
              <AnimatedNumber value={totalTransactions} />
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
            <li
              key={`transaction-${tx.hash}-${tx.logIndex}`}
              id={`transaction-${tx.hash}-${tx.logIndex}`}
              className={`p-4 border-b border-gray-200 flex items-center ${
                tx.isNew ? "highlight-animation" : ""
              }`}
            >
              <Image
                src={getAvatarUrl(tx.from)}
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full mr-4"
              />
              <div className="flex flex-col justify-between w-full">
                <div className="font-bold text-xs text-gray-500">
                  {tx.date.toLocaleString()}
                </div>
                <div className="flex flex-row align-left">
                  <div className="text-xs  text-gray-500 mr-2">
                    <label className="block mr-1 float-left">From:</label>{" "}
                    <Link href={`?accountAddress=${tx.from}`}>
                      {displayAddress(tx.from)}
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500">
                    <label className="block mr-1 float-left">To:</label>{" "}
                    <Link href={`?accountAddress=${tx.to}`}>
                      {displayAddress(tx.to)}
                    </Link>
                  </div>
                </div>
              </div>
              <div className="text-lg font-bold text-gray-600 text-right">
                <HumanNumber
                  value={parseFloat(tx.formattedAmount).toFixed(2)}
                />{" "}
                <span className="text-sm font-normal">{token.symbol}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MonitorPage;
