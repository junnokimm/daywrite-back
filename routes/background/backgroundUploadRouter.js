import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import BackgroundImage from "../../models/backgroundimageSchema.js";// 스키마 import

const router = express.Router();

const uploadFolder = "uploads/background";

// 폴더 없으면 생성
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// POST /api/upload/background
router.post("/", upload.single("image"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "이미지를 업로드해주세요" });
  }

  try {
    // DB에 저장
    const savedImage = await BackgroundImage.create({
      filename: file.filename,
      path: file.path,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    const imageUrl = `/uploads/background/${file.filename}`;

    res.json({
      message: "배경 이미지 업로드 성공",
      imageUrl,
      imageId: savedImage._id,
    });
  } catch (error) {
    console.error("DB 저장 에러:", error);
    res.status(500).json({ error: "서버 오류로 저장 실패" });
  }
});

export default router;