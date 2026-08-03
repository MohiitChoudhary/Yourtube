import express from "express";

import {
  deletecomment,
  getallcomment,
  postcomment,
  editcomment,
  likeComment,
  dislikeComment,
  reportComment,
} from "../controllers/comment.js";

const routes = express.Router();

routes.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Comment route is working",
  });
});

routes.post("/postcomment", postcomment);
routes.post("/editcomment/:id", editcomment);
routes.delete("/deletecomment/:id", deletecomment);

routes.post("/like/:id", likeComment);
routes.post("/dislike/:id", dislikeComment);
routes.post("/report/:id", reportComment);

routes.get("/:videoid", getallcomment);

export default routes;