import { Like } from '../models/like.model.js';
import { UserAchievements } from '../models/userAchievements.model.js';
import { Question } from '../models/question.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Comment } from '../models/comment.model.js';
import { Bookmark } from '../models/bookmark.model.js';
import { Testcase } from '../models/testcase.model.js';
import { Submission } from '../models/submission.model.js';

// const createQuestion = asyncHandler(async (req, res) => {
//   const user = req.user;
//   if (!user) {
//     throw new ApiError(401, 'Unauthorized Acess Please Login');
//   }

//   const { questionUid, title, description, difficulty, topics, hints } =
//     req.body;
//   if (
//     !questionUid ||
//     !title ||
//     !description ||
//     !difficulty ||
//     !topics ||
//     !hints
//   ) {
//     throw new ApiError(400, 'all fields are required');
//   }

//   const questionExists = await Question.findOne({ uid: questionUid });
//   if (questionExists) {
//     throw new ApiError(400, 'Question with this UID already exists');
//   }

//   const question = await Question.insertOne({
//     uid: questionUid,
//     title,
//     description,
//     difficulty,
//     topics,
//     hints,
//   });

//   if (!question) {
//     throw new ApiError(
//       402,
//       'Unable to create the question due to a server error',
//     );
//   }

//   return res
//     .status(201)
//     .json(new ApiResponse(201, question, 'Question is Successfully Created'));
// });

const createQuestion = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, 'Unauthorized Access. Please login.');
  }

  const {
    questionUid,
    title,
    description,
    defaultCode,
    difficulty,
    topics = [],
    hints = [],
    examples = [],
    constraints = [],
  } = req.body;

  // required fields
  if (!questionUid || !title || !description || !difficulty || !defaultCode) {
    throw new ApiError(
      400,
      'Required fields: questionUid, title, description, difficulty',
    );
  }

  // basic type checks for arrays
  if (!Array.isArray(topics) || !Array.isArray(hints)) {
    throw new ApiError(400, 'topics and hints must be arrays');
  }

  // make sure UID is numeric and unique
  const uidNumber = Number(questionUid);
  if (Number.isNaN(uidNumber)) {
    throw new ApiError(400, 'questionUid must be a number');
  }

  const questionExists = await Question.findOne({ uid: uidNumber }).lean();
  if (questionExists) {
    throw new ApiError(400, 'Question with this UID already exists');
  }

  // normalize and prepare payload
  const payload = {
    uid: uidNumber,
    title: String(title).trim(),
    description: String(description), // plain text or sanitized HTML (sanitize in production)
    defaultCode: defaultCode,
    difficulty: String(difficulty).toLowerCase(),
    topics: topics.map((t) => String(t).trim()).filter(Boolean),
    hints: hints.map((h) => String(h).trim()).filter(Boolean),
    examples: Array.isArray(examples)
      ? examples
          .map((ex) => {
            if (!ex || (!ex.input && !ex.output)) return null;
            return {
              input: String(ex.input || '').trim(),
              output: String(ex.output || '').trim(),
              explanation: String(ex.explanation || '').trim(),
            };
          })
          .filter(Boolean)
      : [],
    constraints: Array.isArray(constraints)
      ? constraints.map((c) => String(c).trim()).filter(Boolean)
      : [],
  };

  // create with Mongoose
  const question = await Question.create(payload);

  if (!question) {
    throw new ApiError(
      500,
      'Unable to create the question due to server error',
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, question, 'Question successfully created'));
});

const questionById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw new ApiError(400, 'Invalid ID format');
  }

  const question = await Question.findOne({ uid: id });
  if (!question) {
    throw new ApiError(400, 'Question is not found of this id');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, question, 'Question Found Successfully'));
});

const problemset = asyncHandler(async (req, res) => {
  const questions = await Question.find(
    {},
    { uid: 1, title: 1, difficulty: 1, topics: 1 },
  ).sort({ uid: 1 });

  if (questions.length === 0) {
    throw new ApiError(404, 'No questions found in the problem set');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, questions, 'problemset questions'));
});

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
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'unlike is successfully'));
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
    return res
      .status(200)
      .json(new ApiResponse(200, {}, 'like is successfully'));
  }
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
  return res
    .status(201)
    .json(new ApiResponse(200, { comment }, 'comment is added successfully'));
});

const questionBookmark = asyncHandler(async (req, res) => {
  // get the user id from req
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, 'Unauthorized Access');
  }

  // get questionUid from params
  const { questionUid } = req.params;
  console.log(questionUid);
  if (!questionUid) {
    throw new ApiError(400, 'Question UID is required ');
  }

  // get questionId from the Question model
  const question = await Question.findOne({ uid: questionUid });
  if (!question) {
    throw new ApiError(404, 'question is not found');
  }
  const questionId = question._id;

  // find bookmark is present or not
  const bookmark = await Bookmark.findOne({ userId, questionId });

  if (!bookmark) {
    // is not present
    const createBookmark = await Bookmark.create({
      userId,
      questionId,
    });

    const userAchievements = await UserAchievements.updateOne(
      {
        userId,
      },
      { $addToSet: { questionBookmarked: questionId } },
      { upsert: true },
    );
    if (!createBookmark) {
      throw new ApiError(500, 'something went wrong while adding bookmakr');
    }
  } else {
    // if present
    const removeBookmark = await Bookmark.deleteOne({ userId, questionId });
    const userAchievements = await UserAchievements.updateOne(
      { userId },
      { $pull: { questionBookmarked: questionId } },
      { new: true },
    );
    if (!removeBookmark) {
      throw new ApiError(500, 'something went wrong while removing bookmark');
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'bookmark toggeled successfully!!'));
});

const multipleQuestions = asyncHandler(async (req, res) => {
  const { questionArray } = req.body;
  if (!questionArray) {
    throw new ApiError(400, "didn't get the question id");
  }

  const questions = await Question.find({ uid: { $in: questionArray } });
  if (!questions) {
    throw new ApiError(400, 'no questions found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, questions, 'Multiple Questions'));
});

const questionTestcase = asyncHandler(async (req, res) => {
  const { questionUId, input, output } = req.body;
  if (!questionUId || !input || !output) {
    throw new ApiError(400, 'All fields are required');
  }

  const question = await Question.findOne({ uid: questionUId });
  if (!question) {
    throw new ApiError(400, 'Question is not found of the given question id');
  }

  const testcase = Testcase.insertOne({
    questionUId,
    input,
    output,
  });

  if (!testcase) {
    throw new ApiError(
      401,
      'something went wrong while inserting the testcase',
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, testcase, 'Testcase is added Successfully'));
});

const searchQuestions = asyncHandler(async (req, res) => {
  const searchKey = req.query.searchKey;
  if (!searchKey) return;
  if (searchKey === '') {
    const questions = problemset();
    return res
      .status(200)
      .json(new ApiResponse(200, questionList, 'question search'));
  }

  const searchList = searchKey.split(' ');

  let searchString = [];
  let searchNumber = [];

  for (let word of searchList) {
    if (!isNaN(word) && word.trim() !== '') {
      searchNumber.push(Number(word));
    } else if (word.trim() !== '') {
      searchString.push(new RegExp(word, 'i'));
    }
  }
  const questionList = await Question.find(
    {
      $or: [{ uid: { $in: searchNumber } }, { title: { $in: searchString } }],
    },
    { uid: 1, title: 1, difficulty: 1, topics: 1 },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, questionList, 'question search'));
});

const isQuestionSubmitted = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!id && typeof id !== 'number') {
    throw new ApiError(400, 'question id is not found!!!');
  }

  const question = await Question.findOne({ uid: id });

  if (!question) {
    throw new ApiError(400, 'question is not found on given id');
  }

  const submission = await Submission.findOne({ questionUId: id });
  // console.log(submission);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isSubmitted: submission ? true : false },
        'submission result of the current question',
      ),
    );
});
export {
  questionLike,
  questionComment,
  questionBookmark,
  createQuestion,
  problemset,
  questionById,
  multipleQuestions,
  questionTestcase,
  searchQuestions,
  isQuestionSubmitted,
};
