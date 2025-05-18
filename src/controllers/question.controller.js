import { Like } from '../models/like.model.js';
import { UserAchievements } from '../models/userAchievements.model.js';
import { Question } from '../models/question.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Comment } from '../models/comment.model.js';

const questionLike = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { questionUid } = req.params;

  if (!userId) {
    throw new ApiError(401, 'UnAuthorized Access');
  }

  // Finding the question with the given quesiton id
  const question = await Question.findOne({ uid: questionUid });
  if (!question) {
    throw new ApiError(404, 'requested quetsion never existed ');
  }
  const questionId = question._id;

  // Updating the Like Model
  const likeExists = await Like.findOne({
    userId,
    questionId,
  });

  if (likeExists) {
    const unlikeResult = await Like.deleteOne({
      userId,
      questionId,
    });

    const pullLike = await UserAchievements.updateOne(
      { userId },
      { $pull: { questionLiked: questionId } },
    );

    if (unlikeResult.deletedCount === 0) {
      throw new ApiError(500, 'something went wrong while unlike');
    }
  } else {
    const like = await Like.create({
      userId,
      questionId,
    });

    const addedQuestionId = await UserAchievements.updateOne(
      { userId },
      { $addToSet: { questionLiked: questionId } },
      { upsert: true },
    );

    if (!like) {
      throw new ApiError(500, 'something went wrong while like');
    }
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'like is toggeled successfully'));
});

const questionComment = asyncHandler(async (req, res) => {
  // get user id
  const user = req.user;
  if (!user) {
    throw new ApiError(401, 'Unauthorized Access');
  }

  // get question id
  const { questionUid } = req.params;
  const question = await Question.findOne({ uid: questionUid });
  if (!question) {
    throw new ApiError(404, 'question is not found');
  }
  const questionId = question._id;

  // get commnet content
  const { content } = req.body;
  if (!content || !content.trim()) {
    throw new ApiError(400, 'contnet is required');
  }

  // create a comment doc
  const comment = await Comment.create({
    userId: user._id,
    questionId,
    username: user.username,
    avatarUrl: user.avatarUrl,
    content,
  });
  if (!comment) {
    throw new ApiError(500, 'something went wrong while adding comment');
  }

  // send response
  res
    .status(201)
    .json(new ApiResponse(200, { comment }, 'comment is added successfully'));
});

export { questionLike, questionComment };
