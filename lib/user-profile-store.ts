export type SubscriptionLevel = "basic" | "pro";

export type UserHistoryEntry = {
  id: string;
  action: string;
  timestamp: string;
};

export type UserProfileState = {
  subscription: SubscriptionLevel;
  history: UserHistoryEntry[];
};

const STORAGE_PREFIX = "glammetrics_user_profile_";
const MAX_HISTORY_ITEMS = 30;

function getStorageKey(uid: string) {
  return `${STORAGE_PREFIX}${uid}`;
}

function defaultState(): UserProfileState {
  return {
    subscription: "basic",
    history: [],
  };
}

export function getUserProfileState(uid: string): UserProfileState {
  if (typeof window === "undefined") return defaultState();

  try {
    const raw = window.localStorage.getItem(getStorageKey(uid));
    if (!raw) return defaultState();

    const parsed = JSON.parse(raw) as Partial<UserProfileState>;

    return {
      subscription: parsed.subscription === "pro" ? "pro" : "basic",
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return defaultState();
  }
}

export function setUserProfileState(uid: string, state: UserProfileState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getStorageKey(uid), JSON.stringify(state));
}

export function addUserHistory(uid: string, action: string) {
  const state = getUserProfileState(uid);

  const nextEntry: UserHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    action,
    timestamp: new Date().toISOString(),
  };

  const nextState: UserProfileState = {
    ...state,
    history: [nextEntry, ...state.history].slice(0, MAX_HISTORY_ITEMS),
  };

  setUserProfileState(uid, nextState);
  return nextState;
}

export function setSubscriptionLevel(uid: string, subscription: SubscriptionLevel) {
  const state = getUserProfileState(uid);
  const nextState: UserProfileState = {
    ...state,
    subscription,
  };

  setUserProfileState(uid, nextState);
  return nextState;
}
