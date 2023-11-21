"use client";

import { useEffect, useState } from "react";

import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { formatUnits } from "@ethersproject/units";
import { ethers } from "ethers"; // for other utilities
import { useRouter } from "next/navigation";
import Image from "next/image";
import AudioPlayer from "react-audio-player";
import ABI from "@/smartcontracts/ERC20.abi.json";
import ErrorMessage from "@/components/ErrorMessage";
import {
  displayAddress,
  getAvatarUrl,
  getChainInfo,
  getTokenAddress,
} from "@/lib/lib";

const dingSound = "/cashing.mp3";

function MonitorPage(request) {
  let { chain, tokenAddress } = request.params;
  tokenAddress =
    tokenAddress.substr(0, 2) === "0x"
      ? tokenAddress
      : getTokenAddress(chain, tokenAddress);

  console.log(">>> Using", chain, tokenAddress);

  const [provider, setProvider] = useState(null);
  const [tokenContract, setTokenContract] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [token, setToken] = useState({});
  const [listen, setListen] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);

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
        console.log(">>> set token", token);
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
      setToken(token);
    }
    setTransactions(savedTransactions);
  }, [chain, tokenAddress]);

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
      console.log(">>> Play DING");
      window.audio.audioEl.current.play();
    };
    window.stopListening = () => setListen(false);
  }, [chain, tokenAddress]);

  useEffect(() => {
    if (!listen || !tokenContract || !tokenContract.filters) return;

    const transferEvent = tokenContract.filters.Transfer();
    tokenContract.on(transferEvent, (from, to, amount, event) => {
      const newTransaction = {
        from,
        to,
        amount: formatUnits(amount, token.decimals),
        currency: token.symbol,
        date: new Date(),
      };
      window.playSound();
      setTransactions((prev) => {
        const updatedTransactions = [newTransaction, ...prev];
        localStorage.setItem(
          `${chain}:${token.address}-transactions`,
          JSON.stringify(updatedTransactions)
        );
        return updatedTransactions;
      });
    });

    return () => {
      tokenContract.off(transferEvent);
    };
  }, [listen, chain, token, tokenContract]);

  // Compute totals
  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.amount),
    0
  );
  const uniqueAddresses = new Set(
    transactions.flatMap((tx) => [tx.from, tx.to])
  ).size;

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
    <div className="container mx-auto p-4">
      <AudioPlayer
        src={dingSound}
        ref={(element) => (window.audio = element)}
      />
      <h1>
        Token: <span info={token.address}>{token.symbol}</span>
      </h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500">
              Total Transactions
            </div>
            <div className="text-3xl font-bold">{totalTransactions}</div>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-500">
              Total Amount Transferred
            </div>
            <div className="text-3xl font-bold">
              {totalAmount.toFixed(2)} {token.symbol}
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
                  stroke-width="2"
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
      {listen && (
        <ul className="bg-white shadow rounded-lg">
          {transactions.map((tx, index) => (
            <li
              key={index}
              className="p-4 border-b border-gray-200 flex items-center"
            >
              <Image
                src={getAvatarUrl(tx.from)}
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full mr-4"
              />
              <div>
                <div className="text-lg font-bold text-gray-600">
                  {parseFloat(tx.amount).toFixed(2)} {token.symbol}
                </div>
                <div className="text-xs  text-gray-500">
                  <label className="w-10 block float-left">From:</label>{" "}
                  {displayAddress(tx.from)}
                </div>
                <div className="text-xs text-gray-500">
                  <label className="w-10 block float-left">To:</label>{" "}
                  {displayAddress(tx.to)}
                </div>
                <div className="text-xs text-gray-500">
                  <label className="w-10 block float-left">Date:</label>{" "}
                  {tx.date.toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MonitorPage;
