import Post from '../models/post.model.js';
import User from '../models/user.model.js';

export default class PostsController {
  static async getPosts(request, response) {
    const { caption, hashtag, sortBy } = request.query;
    const { userID, numOfPage = 0 } = request.body;
    const postPerPage = 20;
    try {
      const currentUser = await User.findById(userID);
      const userFriendsIds = currentUser.friendsList.map((friend) => friend);

      // TODO: Check if user ID is valid (found in DB)
      //Kiểm tra có đang là bạn bè hay không?
      const friendsList = userFriendsIds.filter((friend) => friend.status.includes("accepted")).map(friend => friend.userId);
      //Tất cả các user(bao gồm người dùng hiện tại và bạn bè).
      const allIds = [currentUser.id, ...friendsList];
      let res;
      switch (sortBy) {
        case 'latest':
          //Kiểm tra các bài post có author nằm trong danh sách user và sắp xếp theo ngày đăng gần nhất.
          const latestPosts = await Post.find({
            author: { $in: allIds },
            privacy: { $in: ['public', 'friend'] },
          })
            .sort({ createdAt: -1 })
            .limit(postPerPage)
            .skip(postPerPage * numOfPage);

          //Kết quả trả về
          res = {
            posts: latestPosts,
            totalpost: latestPosts.length,
            page: numOfPage,
          };
          response.json(res);
          break;

        case 'popular':
          // sorted by a scoring system
          const popularPosts = (
            await Post.find({ author: { $in: allIds }, privacy: { $in: ['public', 'friend'] } })
              .sort({ createdAt: -1 })
              .limit(postPerPage)
              .skip(postPerPage * numOfPage)
          ).map((post) => {
            return {
              posts: post,
              score: post.likes.length + post.comments.length * 2 + post.shares.length * 3,
            };
          });
          popularPosts.sort((a, b) => b.score - a.score);
          //Kết quả trả về
          res = {
            posts: popularPosts,
            totalpost: popularPosts.length,
            page: numOfPage,
          };
          response.json(res);
          break;
        default:
          // don't sort, filter by caption or ONE hashtag for searching
          let filterPosts = await Post.find({
            author: { $in: allIds },
            privacy: { $in: ['friend', 'public'] },
          });

          if (caption) {
            filterPosts = filterPosts
              .filter((post) => post.caption.includes(caption))
              .slice(numOfPage * postPerPage, (numOfPage + 1) * postPerPage);
          }
          else if (hashtag) {
            filterPosts = filterPosts
              .filter((post) => post.hashtags.includes(hashtag))
              .slice(numOfPage * postPerPage, (numOfPage + 1) * postPerPage);
          }

          //Kết quả trả về
          res = {
            posts: filterPosts,
            totalpost: filterPosts.length,
            page: numOfPage,
          };

          response.json(res);
          break;
      }
    } catch (error) {
      response.status(500).json({ message: error.message });
    }
  }

  static async getPostsById(request, response) {
    // populate comments, likes & shares
    // return 200 OK and the response
    const { postId } = request.params;
  }

  static async createPost(request, response) {
    // post object contain the author id, caption, mediaURL, privacy and hashtags
    // return 201 Created if success and return the created object
    // return 400 Bad Request if missing values
    const post = request.body;
  }

  static async updatePostsById(request, response) {
    // post object contain the author id, caption, mediaURL, privacy and hashtags
    // return 200 OK and the response
    // return 400 Bad Request if values is invalid
    const { postId } = request.params;
    const post = request.body;
  }

  static async deletePostsById(request, response) {
    // remember to delete all the comments inside
    // ALWAY return 204 No Content
    // return 400 Bad Request if values is invalid
    const { postId } = request.params;
  }
}
