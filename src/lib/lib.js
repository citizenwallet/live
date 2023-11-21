import chains from "../data/chains.json";
import tokens from "../data/tokens.json";

export function getChainInfo(chainId) {
  if (!chainId) return {};

  if (typeof chainId === "string") {
    if (chainId.substr(0, 2) === "0x") {
      chainId = parseInt(chainId, 16);
    } else {
      let chain = {};
      Object.keys(chains).forEach((key) => {
        if (chains[key].slug === chainId) {
          chain = chains[key];
        }
      });
      return chain;
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
  return address.substr(0, 6) + "..." + address.substr(-4);
}
