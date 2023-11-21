import { useEffect, useState } from "react";
import chains from "../data/chains.json";

const ChainIcon = () => {
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    const getChainId = async () => {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setChainId(parseInt(chainId, 16));
      }
    };

    getChainId();
  }, []);

  const iconSrc = `https://icons.llamao.fi/icons/chains/rsz_${chainName[chainId]}.jpg`;

  return (
    <div>
      {chains[chainId] ? (
        <div className="flex">
          <img src={iconSrc} alt="Chain Icon" className="rounded-full mr-2" />
          <span>{chains[chainId].slug}</span>
        </div>
      ) : (
        <p>Chain {chainId} not supported</p>
      )}
    </div>
  );
};

export default ChainIcon;
