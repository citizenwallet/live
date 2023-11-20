"use client";

import { useEffect, useState } from "react";

import { Web3Provider, JsonRpcProvider } from "@ethersproject/providers";
import { Contract } from "@ethersproject/contracts";
import { formatUnits } from "@ethersproject/units";
import { ethers } from "ethers"; // for other utilities
import { useRouter } from "next/navigation";
import Image from "next/image";
import AudioPlayer from "react-audio-player";
import ABI from "../smartcontracts/ERC20.abi.json";
import ChainIcon from "@/components/ChainIcon";

const dingSound = "/cashing.mp3";
// const tokenAddress = "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73"; // cEUR on CELO

const getAvatarUrl = (address) => {
  // A simple way to generate a consistent avatar URL for each address
  // You might use a more complex method depending on your needs
  return `https://api.multiavatar.com/${address}.png`;
};

const ErrorMessage = (message, options) => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center">
        <div
          className="max-w-md w-full p-4 mb-4 text-center text-sm text-red-700 bg-red-100 rounded-lg shadow-md dark:bg-red-200 dark:text-red-800"
          role="alert"
        >
          <font className="font-bold">{message}</font>
        </div>
      </div>
    </div>
  );
};

function HomePage(request) {
  const { tokenAddress, rpc } = request.searchParams;

  const [provider, setProvider] = useState(null);
  const [tokenContract, setTokenContract] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [token, setToken] = useState({});
  const [error, setError] = useState(null);

  const fetchDecimals = async (tokenContract) => {
    try {
      token.decimals = await tokenContract.decimals();
      token.symbol = await tokenContract.symbol();
      token.address = tokenAddress;
      console.log(">>> set token", token);
      setToken(token);
    } catch (error) {
      console.error("Error fetching token info:", error);
      setError("Error fetching token info");
      // Handle the error appropriately
    }
  };

  useEffect(() => {
    // const provider = new Web3Provider(rpc ? rpc : window.ethereum);
    const provider = new JsonRpcProvider(rpc);

    const tokenContract = new Contract(tokenAddress, ABI, provider);
    setProvider(provider);
    setTokenContract(tokenContract);
    fetchDecimals(tokenContract);
    // Load transactions from local storage
    const savedTransactions =
      JSON.parse(localStorage.getItem(`${tokenAddress}-transactions`)) || [];

    if (savedTransactions.length > 0) {
      token.symbol = token.symbol || savedTransactions[0].currency;
      setToken(token);
    }
    setTransactions(savedTransactions);
  }, [token, tokenAddress]);

  useEffect(() => {
    window.clearTransactions = () =>
      localStorage.setItem(`${tokenAddress}-transactions`, null);
    window.playSound = () => {
      console.log(">>> Play DING");
      window.audio.audioEl.current.play();
    };
  }, [tokenAddress]);

  useEffect(() => {
    if (!tokenContract || !tokenContract.filters) return;

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
        const updatedTransactions = [newTransaction, ...prev].slice(0, 50);
        localStorage.setItem(
          `${token.address}-transactions`,
          JSON.stringify(updatedTransactions)
        );
        return updatedTransactions;
      });
    });

    return () => {
      tokenContract.off(transferEvent);
    };
  }, [token, tokenContract]);

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

  if (!window.ethereum) {
    return ErrorMessage("Please install MetaMask");
  }

  if (error) {
    return ErrorMessage(error);
  }

  return (
    <div className="container mx-auto p-4">
      <AudioPlayer
        src={dingSound}
        ref={(element) => (window.audio = element)}
      />
      <h1 className="text-2xl font-bold mb-4">
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
                <label className="w-10 block float-left">From:</label> {tx.from}
              </div>
              <div className="text-xs text-gray-500">
                <label className="w-10 block float-left">To:</label> {tx.to}
              </div>
              <div className="text-xs text-gray-500">
                <label className="w-10 block float-left">Date:</label>{" "}
                {tx.date.toLocaleString()}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
