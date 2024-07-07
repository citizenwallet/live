import { createPublicClient, http } from "viem";
import { ethers } from "ethers";
import {
  celo,
  celoAlfajores,
  polygon,
  polygonMumbai,
  gnosis,
  gnosisChiado,
  base,
  baseSepolia,
} from "viem/chains";

import ProfileABI from "smartcontracts/build/contracts/profile/Profile.abi.json";
import ERC20ABI from "smartcontracts/build/contracts/erc20/ERC20.abi.json";

const protocol = ["production", "preview"].includes(process.env.NODE_ENV)
  ? "https"
  : "http";

const CONFIG_URL =
  process.env.NODE_ENV === "test"
    ? `${protocol}://config.internal.citizenwallet.xyz/v3/communities.json`
    : `${process.env.WEBAPP_URL}/api/getConfig`;

export const IPFS_BASE_URL = "https://ipfs.internal.citizenwallet.xyz";

interface ChainMap {
  [key: number]: any;
}

type ErrorType = {
  shortMessage: string;
};

const chains: ChainMap = {
  137: polygon,
  80001: polygonMumbai,
  100: gnosis,
  10200: gnosisChiado,
  8453: base,
  84532: baseSepolia,
  42220: celo,
  44787: celoAlfajores,
};

export default class CitizenWalletCommunity {
  configUrl: string;
  communitySlug: string;
  config: any;
  client: any;
  symbol: string;

  constructor(communitySlug: string) {
    this.communitySlug = communitySlug;
    this.configUrl = CONFIG_URL;
    this.symbol = "";
  }

  initClient = async () => {
    if (this.client) return this.client;
    await this.loadConfig();
    const chain = chains[this.config.node.chain_id];
    chain.rpcUrls.default.http = [this.config.node.url];
    chain.rpcUrls.default.webSocket = [this.config.node.ws_url];
    this.client = createPublicClient({
      chain,
      transport: http(),
    });
    return this.client;
  };

  loadConfig = async () => {
    if (this.config) return this.config;
    const response = await fetch(this.configUrl, {
      mode: "cors",
    });
    if (!response.ok) {
      throw new Error(
        `HTTP error. Unable to fetch ${this.configUrl}. Response status: ${response.status}`
      );
    }
    const configs = await response.json();
    const config = configs.find(
      (config: any) => config.community.alias === this.communitySlug
    );
    this.config = config;
    this.symbol = config.token.symbol;
    return config;
  };

  getProfile = async (account: string) => {
    await this.initClient();
    const contractAddress = this.config.profile.address;

    try {
      const ipfsHash = await this.client.readContract({
        address: contractAddress,
        abi: ProfileABI,
        functionName: "get",
        args: [account],
      });
      return await this.fetchJSON(ipfsHash);
    } catch (e) {
      console.error("Error getting profile for", account, e);
      return null;
    }
  };

  getProfileFromUsername = async (username: string) => {
    await this.initClient();
    const contractAddress = this.config.profile.address;

    const username32 = ethers.encodeBytes32String(username);
    try {
      const ipfsHash = await this.client.readContract({
        address: contractAddress,
        abi: ProfileABI,
        functionName: "getFromUsername",
        args: [username32],
      });
      return await this.fetchJSON(ipfsHash);
    } catch (e) {
      // console.error(JSON.stringify(e, null, 2));
      console.error((e as ErrorType).shortMessage);
      return null;
    }
  };

  getBalance = async (account: string) => {
    await this.initClient();
    const contractAddress = this.config.token.address;
    const decimals = this.config.token.decimals;

    const balance = await this.client.readContract({
      address: contractAddress,
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [account],
    });

    return parseFloat(ethers.formatUnits(balance, decimals));
  };

  getTransactions = async (account: string) => {
    await this.loadConfig();
    const apiUrl = this.config.indexer.url;
    const apiCall = `${apiUrl}/logs/v2/transfers/${this.config.token.address}/${account}?limit=10`;
    const response = await fetch(apiCall, {
      headers: { Authorization: "Bearer x" },
    });
    try {
      const data = await response.json();
      return data.array;
    } catch (e) {
      console.error(
        ">>> unable to getTransactions",
        apiCall,
        response.status,
        response.statusText,
        e
      );
      return [];
    }
  };

  fetchFromIPFS = async (ipfsHash: string) => {
    const ipfsUrl = `${IPFS_BASE_URL}/${ipfsHash.replace("ipfs://", "")}`;
    const response = await fetch(ipfsUrl);
    return await response.text();
  };

  fetchJSON = async (ipfsHash: string) => {
    const data = await this.fetchFromIPFS(ipfsHash);
    return JSON.parse(data);
  };

  getImageSrc = (ipfsHash: string) => {
    const ipfsUrl = `${IPFS_BASE_URL}/${ipfsHash.replace("ipfs://", "")}`;
    return ipfsUrl;
  };
}

export const getPlugin = (config, pluginName) => {
  const plugin = config.plugins.find((plugin) => plugin.name === pluginName);
  return plugin;
};

export const hasPlugin = (config, pluginName) => {
  return !!getPlugin(config, pluginName);
};
