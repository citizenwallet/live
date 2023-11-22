import { getChainInfo } from "@/lib/lib";

const ChainIcon = ({ chainName, chainId }) => {
  const chain = getChainInfo(chainName || chainId);
  console.log(
    ">>> chainName",
    chainName,
    "chainId",
    chainId,
    "chain found",
    chain
  );
  const iconSrc = `https://icons.llamao.fi/icons/chains/rsz_${chain.slug}.jpg`;

  return (
    <div>
      {chain ? (
        <img src={iconSrc} alt="Chain Icon" className="rounded-full mr-2" />
      ) : (
        <p>Chain {chainId} not supported</p>
      )}
    </div>
  );
};

export default ChainIcon;
