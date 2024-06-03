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

export function getAvatarUrl(address) {
  return `https://api.multiavatar.com/${address}.png`;
}

export function displayAddress(address) {
  return (
    <div className="">
      <span>{`${address.substr(0, 6)}`}&hellip;</span>
      <span className="hidden sm:!inline">{address.substr(-4)}</span>
    </div>
  );
}
