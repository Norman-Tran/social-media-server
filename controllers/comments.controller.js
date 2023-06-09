import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";

export default class CommentsController {
  static async getCommentsByPostId(request, response) {
    // return 200 OK and the data
    // return 400 Bad Request if post not found
    const { postId } = request.params;
  }
  //Ps: Trong posts.route, có phương thức getCommentsByPostId nên để phương thức này trống, nếu có thì server báo lỗi.

  static async addComments(request, response) {
    // post object contain the author id, caption, mediaURL, privacy and hashtags
    // return 201 Created if success and return the created object
    // return 400 Bad Request if missing values
      const { postId } = request.params;
      const comment = request.body;
      const newComment = await Comment(comment);
      try {
        if(!comment.text || !comment.author) {
          return response.status(400).json("Missing values");
        } 
        const savedComment = await newComment.save();
        await Post.findOneAndUpdate({_id: postId}, { $push: { comments: savedComment._id }});
        response.status(201).json(savedComment);
      } catch (error) {
        response.status(500).json(error);
      }
  }

  static async updateCommentsById(request, response) {
    try {
      // return 200 OK if success and return the created object
      // return 400 Bad Request if missing values
      const { postId, commentId } = request.params;
      const comment = request.body;

      
      //Cập nhập một bình luận
      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { text: comment.text },
        { new: true }
      );

      // Kiểm tra comment
      if (!updatedComment) {
        return response.status(400).json({ error: "Bad Request" });
      }


      return response.status(200).json(updatedComment);
    } catch (error) {
      return response.status(500).json({ error: "Something went wrong" });
    }
  }

  static async deleteCommentsById(request, response) {
    // ALWAY return 204 No Content
    // return 400 Bad Request if values is invalid/not found
    const { postId, commentId } = request.params;
    try {
      
      //Xóa một bình luận
      await Comment.findByIdAndDelete(commentId);

      //Tìm lại thông tin bài post chứa bình luận 
      const post = await Post.findById(postId);
      if (!post) {
        return response.status(404).json({ error: "Post not found" });
      } else {
        await Post.updateOne({_id: postId}, { $pull: { comments: commentId }});
      }

      return response.status(204).send({ message: "No Content" });
    } catch (error) {
      console.error(error);
      return response.status(500).send({ message: "Something went wrong" });
    }
  } 
}