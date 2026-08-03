import axiosInstance from "./axiosinstance";

export const getUserSubscriptionAccess = async (userId: string) => {
  if (!userId) return { plan: "Free", planAccess: { premiumVideos: false, adFree: false, downloadsPerDay: 1 } };

  try {
    const response = await axiosInstance.get(`/subscription/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to load subscription access", error);
    return { plan: "Free", planAccess: { premiumVideos: false, adFree: false, downloadsPerDay: 1 } };
  }
};
