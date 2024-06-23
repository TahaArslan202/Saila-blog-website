import express from "express";
import * as blogController from "../controllers/blogController.js";
import * as authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(blogController.createBlog);
router.route("/").get(blogController.getAllBlogs);
router.route("/:id").get(blogController.getABlogs);
router.route("/:id").delete(blogController.deleteUserBlog);
router.route("/:id").put(blogController.updateUserBlog);

router.route("/category/:category").get(blogController.getAllBlogs);
router.route("/search/:search").get(blogController.getAllBlogs);

router.route("/:id/comment").post(authMiddleware.authenticateToken,blogController.createComment);
router.route("/:commentid/comment").delete(authMiddleware.authenticateToken,blogController.deleteComment);
router.route("/:commentid/comment/:commentcommentid").delete(authMiddleware.authenticateToken,blogController.deleteComment);

router.route("/:blogid/comment/:commentid").post(authMiddleware.authenticateToken,blogController.createCommentComment);
router.route("/:blogid/comment/:commentid/:commentcommentid").post(authMiddleware.authenticateToken,blogController.createCommentComment);

router.route("/:blogid/comment/:commentid/like").put(authMiddleware.authenticateToken,blogController.commentlike);
router.route("/:blogid/comment/:commentid/dislike").put(authMiddleware.authenticateToken,blogController.commentdislike);

router.route("/:id/like").put(authMiddleware.authenticateToken,blogController.bloglike);
router.route("/:id/dislike").put(authMiddleware.authenticateToken,blogController.blogdislike);

router.route("/:id/read").put(authMiddleware.authenticateToken,blogController.blogread);

router.route("/:blogid/comment/:commentid/:commentcommentid/like").put(authMiddleware.authenticateToken,blogController.commentcommentlike);
router.route("/:blogid/comment/:commentid/:commentcommentid/dislike").put(authMiddleware.authenticateToken,blogController.commentcommentdislike);

export default router;