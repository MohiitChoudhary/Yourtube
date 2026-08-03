import mongoose from "mongoose";

const userschema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  name: {
    type: String,
  },

  channelname: {
    type: String,
  },

  description: {
    type: String,
  },

  image: {
    type: String,
  },

  plan: {
  type: String,
  enum: ["Free", "Bronze", "Silver", "Gold"],
  default: "Free",
},

subscriptionStatus: {
  type: String,
  enum: ["inactive", "active", "expired", "cancelled"],
  default: "inactive",
},

subscriptionStartDate: {
  type: Date,
  default: null,
},

subscriptionEndDate: {
  type: Date,
  default: null,
},

currentSubscriptionId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Subscription",
  default: null,
},

  joinedon: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("user", userschema);