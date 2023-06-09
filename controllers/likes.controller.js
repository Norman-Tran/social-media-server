import Post from "../models/post.model.js";
import User from "../models/user.model.js";

export default class LikesController {
  static async addLike(request, response) {
    // return 200 OK if success, 409 Conflict if user has already like the post
    const { postId } = request.params;
    const { userId }= request.body;

    try {
      const post = await Post.findById(postId);
      
      if (!post) {
        return response.status(404).json({ error: "Post not found" });
      }

      if (!post.likes) {
        await Post.updateOne({_id: postId}, { $addToSet: { likes: userId }});
        
      } else {
        if (post.likes.includes(userId)) {
          return response.status(409).json({ error: "User already liked this post" });
        }
        else {
          await Post.updateOne({_id: postId}, { $push: { likes: userId }});
        }
      }
      return response.status(200).json({message: "Liked success"});
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Something went wrong" });
    }
  }

  static async removeLike(request, response) {
    // ALWAY return 204 No Content
    // return 400 Bad Request if values is invalid
    const { postId, userId } = request.params;

    try {
      const post = await Post.findById(postId);

      if (!post) {
        return response.status(404).json({ error: "Post not found" });
      }

      // Kiểm tra nếu người dùng chưa like bài viết đó
      if (!post.likes.includes(userId)) {
        return response.status(400).json({ error: "Bad Request" });
      }
      else {
        await Post.updateOne({_id: postId}, { $pull: { likes: userId }})
      }

      return response.status(204).json({message: "No Content"});
    } catch (error) {
      console.error(error);
      return response.status(500).json({ error: "Something went wrong" });
    }
  }
}
