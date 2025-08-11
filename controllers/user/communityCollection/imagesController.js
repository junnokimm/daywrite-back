import ImageUpload from '../../../models/images/imageUploadSchema.js';

export const thumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const { filename, path: filePath, originalname, mimetype, size } = req.file;

    const savedImage = await ImageUpload.create({
      filename,
      path: filePath,
      originalname,
      mimetype,
      size,
    });

    // ✅ 여기를 고칩니다 — URL 경로 생성
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const relativeUrl = `thumbnail/${year}/${month}/${filename}`;

    res.status(200).json({
      message: "Image uploaded successfully.",
      url: `${req.protocol}://${req.get("host")}/uploads/${relativeUrl}`,
      thumbnailUrl: relativeUrl, // ⬅️ 이게 DB에 저장될 경로입니다
      filename,
      imageId: savedImage._id,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ message: "Image upload failed." });
  }
};
