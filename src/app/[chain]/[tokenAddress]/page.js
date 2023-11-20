import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import AudioPlayer from "react-audio-player";
import dingSound from "../../../../public/cashing.mp3";
import ABI from "../../../smartcontracts/ERC20.abi.json";

function TokenPage() {
  const router = useRouter();
  const { chain, tokenAddress } = router.query; // Access dynamic route parameters

  const [provider, setProvider] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [playDing, setPlayDing] = useState(false);
  const [showGreenScreen, setShowGreenScreen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  useEffect(() => {
    if (!tokenAddress || !chain) return;

    // Set up the provider based on the chain
    let provider;
    switch (chain) {
      case "mainnet":
        provider = new ethers.providers.JsonRpcProvider(
          process.env.MAINNET_RPC_URL
        );
        break;
      case "ropsten":
        // You can add support for different chains similarly
        provider = new ethers.providers.JsonRpcProvider(
          process.env.ROPSTEN_RPC_URL
        );
        break;
      // ... other chains
      default:
        return; // Unsupported chain
    }

    const tokenContract = new ethers.Contract(tokenAddress, ABI, provider);

    setProvider(provider);
    setTokenContract(tokenContract);

    // Load transactions from local storage
    const savedTransactions =
      JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(savedTransactions);
  }, [tokenAddress, chain]);

  useEffect(() => {
    if (!tokenContract) return;

    const transferEvent = tokenContract.filters.Transfer();
    tokenContract.on(transferEvent, (from, to, amount, event) => {
      const formattedAmount = ethers.utils.formatUnits(
        amount,
        CONTRACT_DECIMALS
      );
      const newTransaction = {
        from,
        to,
        amount: formattedAmount,
        date: new Date(),
      };

      setCurrentTransaction(newTransaction);
      setShowGreenScreen(true); // Show the green screen
      setPlayDing(true); // Play the ding sound
      setTimeout(() => {
        setShowGreenScreen(false);
        setPlayDing(false);
      }, 3000); // Hide the green screen and sound after 3 seconds

      setPlayDing(true);
      setTransactions((prev) => {
        const updatedTransactions = [newTransaction, ...prev].slice(0, 50);
        localStorage.setItem(
          "transactions",
          JSON.stringify(updatedTransactions)
        );
        return updatedTransactions;
      });
    });

    return () => {
      tokenContract.off(transferEvent);
    };
  }, [tokenContract]);

  // Compute totals
  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.amount),
    0
  );
  const uniqueAddresses = new Set(
    transactions.flatMap((tx) => [tx.from, tx.to])
  ).size;

  return (
    <div>
      {showGreenScreen && (
        <div
          className={`fixed inset-0 bg-green-500 flex justify-center items-center p-4 z-50`}
        >
          <AudioPlayer
            src={dingSound}
            autoPlay
            onEnded={() => setPlayDing(false)}
          />
          <div className={`text-white text-center text-4xl font-bold`}>
            <p>From: {currentTransaction.from}</p>
            <p>To: {currentTransaction.to}</p>
            <p>Amount: {currentTransaction.amount} USDC</p>
          </div>
        </div>
      )}
      <h1>USDC Transaction Listener</h1>
      {playDing && (
        <AudioPlayer
          src={dingSound}
          autoPlay
          onEnded={() => setPlayDing(false)}
        />
      )}
      <h2>Total Transactions Today: {totalTransactions}</h2>
      <h2>Total Amount Transferred: {totalAmount.toFixed(2)} USDC</h2>
      <h2>Total Unique Addresses: {uniqueAddresses}</h2>
      <ul>
        {transactions.map((tx, index) => (
          <li key={index}>
            From: {tx.from} - To: {tx.to} - Amount: {tx.amount} USDC
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TokenPage;
