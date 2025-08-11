import multer from "multer";
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};

const checkAndCreateDirectory = (folder) => {
    const dirPath = path.join(process.cwd(), 'uploads', folder);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dateFolder = getFormattedDate();
        const typeFolder = "played"; // 고정 폴더명
        const fullPath = path.join(typeFolder, dateFolder);
        checkAndCreateDirectory(fullPath);
        cb(null, path.join('uploads', fullPath));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        const unique = `${uuidv4()}-${base}${ext}`;
        cb(null, unique);
    }
});

const uploadPlayed = multer({ storage });

export { uploadPlayed };