import { Profile } from "@citizenwallet/sdk";
import { create } from "zustand";

export type ProfilesStore = {
  profiles: { [key: string]: Profile };
  updateProfile: (profile: Profile) => void;
};

const getInitialState = () => ({
  profiles: {},
});

export const useProfilesStore = create<ProfilesStore>((set) => ({
  ...getInitialState(),
  updateProfile: (profile: Profile) => {
    set((state) => {
      const profiles = { ...state.profiles };
      profiles[profile.account] = profile;

      return { profiles };
    });
  },
}));
