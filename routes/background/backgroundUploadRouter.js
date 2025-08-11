// routes/upload/background.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import BackgroundImage from "../../models/backgroundimageSchema.js"; // Mongoose 모델

const router = express.Router();

const uploadFolder = "uploads/background";

// 📁 업로드 폴더 없으면 생성
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// 📷 multer 설정 (10MB 제한)
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

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // ✅ 10MB 제한
});

// 🔹 [POST] 업로드
router.post("/", upload.single("image"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "이미지를 업로드해주세요." });
  }

  try {
    const imageUrl = `/uploads/background/${file.filename}`;

    const savedImage = await BackgroundImage.create({
      filename: file.filename,
      path: imageUrl,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

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

// 🔹 [GET] 리스트
router.get("/list", async (req, res) => {
  try {
    const images = await BackgroundImage.find().sort({ createdAt: -1 });
    res.json({ images });
  } catch (error) {
    console.error("리스트 조회 오류:", error);
    res.status(500).json({ error: "이미지 목록 조회 실패" });
  }
});

// 🔹 [DELETE] 삭제
router.delete("/:filename", async (req, res) => {
  const { filename } = req.params;

  try {
    const filePath = path.join(uploadFolder, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await BackgroundImage.deleteOne({ filename });
    res.json({ message: "삭제 완료" });
  } catch (error) {
    console.error("삭제 오류:", error);
    res.status(500).json({ error: "삭제 실패" });
  }
});

export default router;

