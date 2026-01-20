import apiClient from "./client";

export type PushSubscriptionPayload = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export const pushApi = {
  getPublicKey: async () => {
    const response = await apiClient.get<{ publicKey: string }>("/push/public-key");
    return response.data.publicKey;
  },
  subscribe: async (subscription: PushSubscriptionPayload) => {
    await apiClient.post("/push/subscribe", subscription);
  },
};
