import express from 'express';
import multer from 'multer';


import CommentsController from '../controllers/comments.controller.js';
import LikesController from '../controllers/likes.controller.js';
import PostsController from '../controllers/posts.controller.js';
import MiddlewareController from '../controllers/middleware.controller.js';

const upload = multer();
const postsRouter = express.Router();

postsRouter.get('/', PostsController.getPosts);
postsRouter.post(
  '/',
  MiddlewareController.verifyToken,
  upload.single('mediaURL'),
  PostsController.createPost,
);

postsRouter.get('/:postId', PostsController.getPostsById);
postsRouter.put(
  '/:postId',
  MiddlewareController.verifyToken,
  upload.single('mediaURL'),
  PostsController.updatePostsById,
);
postsRouter.delete('/:postId', MiddlewareController.verifyToken, PostsController.deletePostsById);

postsRouter.post('/:postId/likes', MiddlewareController.verifyToken, LikesController.addLike);
postsRouter.delete('/:postId/likes/:userId', MiddlewareController.verifyToken, LikesController.removeLike);

postsRouter.get('/:postId/comments', CommentsController.getCommentsByPostId);
postsRouter.post('/:postId/comments', MiddlewareController.verifyToken, CommentsController.addComments);
postsRouter.put('/:postId/comments/:commentId', MiddlewareController.verifyToken, CommentsController.updateCommentsById);
postsRouter.delete('/:postId/comments/:commentId', MiddlewareController.verifyToken, CommentsController.deleteCommentsById);

export default postsRouter;

