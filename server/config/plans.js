export const PLANS = {
  Free: {
    price: 0,
    downloadsPerDay: 1,
    adFree: false,
    premiumVideos: false,
    watchTime: "Limited",
  },

  Bronze: {
    price: 99,
    downloadsPerDay: 5,
    adFree: true,
    premiumVideos: true,
    watchTime: "Extended",
  },

  Silver: {
    price: 199,
    downloadsPerDay: 15,
    adFree: true,
    premiumVideos: true,
    watchTime: "Extended",
  },

  Gold: {
    price: 399,
    downloadsPerDay: 50,
    adFree: true,
    premiumVideos: true,
    watchTime: "Unlimited",
  },
};