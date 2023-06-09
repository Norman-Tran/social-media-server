import express from 'express';

import ImageController from '../controllers/image.controller.js';

const imageRouter = express.Router();

imageRouter.get('/:imageId', ImageController.getImage);

export default imageRouter;
