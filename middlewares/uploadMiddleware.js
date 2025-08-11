import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/profile/';  // ✅ profile 폴더에 저장

// 폴더 없으면 생성 (재귀적으로)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

export default upload;
