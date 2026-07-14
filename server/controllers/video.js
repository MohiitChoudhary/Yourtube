import video from "../Modals/video.js";
import path from "path";

export const uploadvideo = async (req, res) => {
  if (req.file === undefined) {
    return res
      .status(404)
      .json({ message: "plz upload a mp4 video file only" });
  } else {
    try {
      // store a web-accessible relative path so front-end can request: <BACKEND_URL>/uploads/<filename>
      const storedFilename = req.file.filename || req.file.originalname;
      const relativePath = path.join("uploads", storedFilename);

      const file = new video({
        videotitle: req.body.videotitle,
        filename: req.file.originalname,
        filepath: relativePath,
        filetype: req.file.mimetype,
        filesize: req.file.size,
        videochanel: req.body.videochanel,
        uploader: req.body.uploader,
      });
      await file.save();
      return res.status(201).json("file uploaded successfully");
    } catch (error) {
      console.error(" error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
};
export const getallvideo = async (req, res) => {
  try {
    const files = await video.find();
    return res.status(200).send(files);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};