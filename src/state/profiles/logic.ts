import { Config, ProfileService } from "@citizenwallet/sdk";
import { ProfilesStore, useProfilesStore } from "./state";
import { useMemo } from "react";
import { StoreApi, UseBoundStore } from "zustand";

const REFETCH_INTERVAL = 1000 * 60;

export class ProfilesLogic {
  store: ProfilesStore;
  storeGetter: () => ProfilesStore;
  profileService: ProfileService;

  constructor(config: Config, store: () => ProfilesStore) {
    this.store = store();
    this.storeGetter = store;
    this.profileService = new ProfileService(config);
  }

  private profileFetching: { [key: string]: boolean } = {};
  private lastProfileFetch: { [key: string]: number } = {};

  async fetchProfile(account: string) {
    try {
      const now = Date.now();

      if (
        this.profileFetching[account] ||
        now - this.lastProfileFetch[account] < REFETCH_INTERVAL
      ) {
        return;
      }

      this.profileFetching[account] = true;
      this.lastProfileFetch[account] = Date.now();

      const profile = await this.profileService.getProfile(account);
      if (profile === null) {
        throw new Error("Profile not found");
      }

      this.store.updateProfile(profile);
    } catch (_) {}
    this.profileFetching[account] = false;
  }

  async listenProfiles() {
    try {
      this.profileService.onProfileUpdate((profile) => {
        this.store.updateProfile(profile);
      });
    } catch (e) {
      console.log("error", e);
    }
  }

  stopListeningProfiles() {
    try {
      this.profileService.stopProfileListener();
    } catch (e) {
      console.log("error", e);
    }
  }
}

export const useProfiles = (
  config: Config
): [UseBoundStore<StoreApi<ProfilesStore>>, ProfilesLogic] => {
  const profilesStore = useProfilesStore;

  const profilesLogic = useMemo(
    () => new ProfilesLogic(config, () => profilesStore.getState()),
    [config, profilesStore]
  );

  return [profilesStore, profilesLogic];
};
