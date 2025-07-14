import express from 'express';
import { upload } from '../../utils/multerConfig.js';
import { thumbnail } from '../../controllers/user/communityCollection/imagesController.js';

const imagesRouter = express.Router()

    // formData.append("thumbnail") < key값과 일치
    imagesRouter.post("/thumbnail", upload.single('thumbnail'), thumbnail)

export default imagesRouter;