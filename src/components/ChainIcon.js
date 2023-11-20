import { useEffect, useState } from "react";

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

  const chainName = {
    137: "polygon",
    8453: "base",
    42220: "celo",
    10: "optimism",
    1: "ethereum",
  };

  const iconSrc = `https://icons.llamao.fi/icons/chains/rsz_${chainName[chainId]}.jpg`;

  return (
    <div>
      {chainName[chainId] ? (
        <div className="flex">
          <img src={iconSrc} alt="Chain Icon" className="rounded-full mr-2" />
          <span>{chainName[chainId]}</span>
        </div>
      ) : (
        <p>Chain {chainId} not supported</p>
      )}
    </div>
  );
};

export default ChainIcon;
