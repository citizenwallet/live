import chains from "../data/chains.json";
import tokens from "../data/tokens.json";

export function getChainInfo(chainIdOrName) {
  if (!chainIdOrName) return {};

  let chainId = chainIdOrName;
  if (typeof chainIdOrName === "string") {
    if (chainIdOrName.substring(0, 2) === "0x") {
      chainId = parseInt(chainIdOrName, 16);
    } else {
      let chain = {};
      Object.keys(chains).forEach((key) => {
        if (chains[key].slug === chainIdOrName) {
          chainId = parseInt(key);
        }
      });
    }
  }
  if (!chains[chainId]) return {};
  return chains[chainId];
}

export function getTokenAddress(chain, symbol) {
  if (!tokens[chain.toLowerCase()]) return;
  if (!tokens[chain.toLowerCase()][symbol.toLowerCase()]) return;
  return tokens[chain.toLowerCase()][symbol.toLowerCase()].tokenAddress;
}

export function getAvatarUrl(imgsrc) {
  return `${
    process.env.NEXT_PUBLIC_WEBAPP_URL || ""
  }/api/getAvatar?imgsrc=${imgsrc}`;
}

export function displayAddress(address, format = "short") {
  if (!address) return "";
  if (!address.startsWith("0x")) return address;
  return (
    <div className="">
      <span>{`${address.substr(0, 6)}`}&hellip;</span>
      {format === "medium" ? (
        <span className="">{address.substr(-4)}</span>
      ) : (
        <span className="hidden sm:!inline">{address.substr(-4)}</span>
      )}
    </div>
  );
}
