import WatchParty from "../Modals/watchparty.js";
import crypto from "crypto";

export const createWatchParty = async (
req,
res
) => {
try {
const {
videoId,
hostId: requestHostId,
userId,
} = req.body;

const hostId = requestHostId || userId;

if (!videoId || !hostId) {
  return res.status(400).json({
    success: false,
    message:
      "videoId and hostId are required",
  });
}

const roomId =
  crypto
    .randomBytes(6)
    .toString("hex");

const party =
  await WatchParty.create({
    roomId,
    videoId,
    hostId,
  });

return res.status(201).json({
  success: true,
  roomId: party.roomId,
  party,
});


} catch (error) {
console.error(
"Create watch party error:",
error
);


return res.status(500).json({
  success: false,
  message:
    "Unable to create watch party",
  error:
    process.env.NODE_ENV ===
    "development"
      ? error.message
      : undefined,
});


}
};

export const getWatchParty = async (
req,
res
) => {
try {
const {
roomId,
} = req.params;


const party =
  await WatchParty.findOne({
    roomId,
    isActive: true,
  })
    .populate(
      "videoId"
    )
    .populate(
      "hostId"
    );

if (!party) {
  return res.status(404).json({
    success: false,
    message:
      "Watch party not found",
  });
}

return res.status(200).json({
  success: true,
  party,
});


} catch (error) {
console.error(
"Get watch party error:",
error
);


return res.status(500).json({
  success: false,
  message:
    "Unable to get watch party",
});


}
};

export const closeWatchParty = async (
req,
res
) => {
try {
const {
roomId,
} = req.params;

const party =
  await WatchParty.findOneAndUpdate(
    {
      roomId,
      isActive: true,
    },
    {
      isActive: false,
    },
    {
      returnDocument: "after",
    }
  );

if (!party) {
  return res.status(404).json({
    success: false,
    message:
      "Watch party not found",
  });
}

return res.status(200).json({
  success: true,
  message:
    "Watch party closed",
});

} catch (error) {
console.error(
"Close watch party error:",
error
);

return res.status(500).json({
  success: false,
  message:
    "Unable to close watch party",
});

}
};
