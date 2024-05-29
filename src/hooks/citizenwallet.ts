import CitizenWalletCommunity from "@/lib/citizenwallet";
import { useEffect, useRef, useState } from "react";

const setCache = function (cacheKey: string, data: any) {
  const dataString = JSON.stringify({
    timestamp: new Date().getTime(),
    data,
  });
  window.localStorage.setItem(cacheKey, dataString);
};

export const useCommunity = (communitySlug: string) => {
  const [community, setCommunity] = useState<any>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!communitySlug) return;

    const cacheKey = `useCommunity-${communitySlug}`;

    const cachedItem = window.localStorage.getItem(cacheKey);
    if (cachedItem) {
      const cacheEntry = JSON.parse(cachedItem);
      setCommunity(cacheEntry.data);
      // return [cacheEntry.data]; // we always fetch the new updated profile info for next load.
    }

    function setData(data: any) {
      setCommunity(data);
      setCache(cacheKey, data);
    }

    const configUrl = `${window.location.protocol}//${window.location.host}/api/getConfig`;
    const community = new CitizenWalletCommunity(communitySlug);
    community.configUrl = configUrl;
    community.loadConfig().then((community) => setData(community));
  }, [communitySlug]);
  return [community];
};

export const useProfile = (communitySlug: string, account: string) => {
  const [profile, setProfile] = useState<any>(undefined);

  const fetchingRef = useRef<{ [key: string]: boolean | undefined }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!communitySlug) return;
    if (!account) return;

    const cacheKey = `useProfile-${communitySlug}-${account}`;
    const cachedItem = window.localStorage.getItem(cacheKey);
    if (cachedItem) {
      const cacheEntry = JSON.parse(cachedItem);
      setProfile(cacheEntry.data);
      // return;
      // return [cacheEntry.data]; // we always fetch the new updated profile info for next load.
    }

    if (fetchingRef.current[account]) return;
    fetchingRef.current[account] = true;

    function setProfileCache(profile: any) {
      setProfile(profile);
      setCache(cacheKey, profile);
      fetchingRef.current[account] = false;
    }

    const configUrl = `${window.location.protocol}//${window.location.host}/api/getConfig`;
    const community = new CitizenWalletCommunity(communitySlug);
    community.configUrl = configUrl;
    if (account.substring(0, 2) === "0x") {
      community.getProfile(account).then((profile) => setProfileCache(profile));
    } else {
      community
        .getProfileFromUsername(account)
        .then((profile) => setProfileCache(profile));
    }
  }, [communitySlug, account]);
  return [profile];
};
