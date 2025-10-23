import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { UserSession } from '../models/sessionSchema.model.js';
import { UserProfile } from '../models/userProfile.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { UserAchievements } from '../models/userAchievements.model.js';
import { UserPreferences } from '../models/userPreferences.model.js';
import jwt from 'jsonwebtoken';
import { Testcase } from '../models/testcase.model.js';
import { Submission } from '../models/submission.model.js';
import Question from '../models/question.model.js';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'something went wrong while create accesstoken and refreshtoken',
    );
  }
};

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();

    return accessToken;
  } catch (error) {
    throw new ApiError(
      400,
      'something went wrong while generating access token',
    );
  }
};

const userRegsiter = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { fullName, username, email, password, defaultAvatar } = req.body;

  // check if any field is not empty
  if (
    [fullName, username, email, password].some((field) => field?.trim() === '')
  ) {
    throw new ApiError(400, 'All Fields are Compulsory');
  }

  // check is the user is existing in DB
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  // if user existing throw an error
  if (existedUser) {
    throw new ApiError(400, 'user with email or username already exists');
  }

  // check for avatar image from file
  const avatarFileLocalPath = await req.file?.path;
  console.log(avatarFileLocalPath);
  // if image in multer file upload it on cloudinary
  let avatarCloudinaryUrl;
  if (avatarFileLocalPath) {
    const fileSize = req.file?.size;
    if (fileSize > 100000) {
      throw new ApiError(400, 'uploaded image required less than 100kb');
    }
    avatarCloudinaryUrl = await uploadOnCloudinary(avatarFileLocalPath);
    if (!avatarCloudinaryUrl) {
      throw new ApiError(400, 'cloudinary upload failed');
    }
  }
  console.log('avatar', defaultAvatar, avatarCloudinaryUrl?.url);
  const finalAvatarUrl = avatarCloudinaryUrl?.url || defaultAvatar;

  // created a user in user model
  const user = await User.create({
    fullName,
    avatarUrl: finalAvatarUrl,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
  });

  // giving error if user is not created
  if (!user) {
    throw new ApiError(400, 'something went wrong while creating a user');
  }

  // uploading user avatar on userprofile model by using user._id
  const profileData = {
    userId: user._id,
  };
  if (finalAvatarUrl) {
    profileData.avatarUrl = finalAvatarUrl;
  }
  const profile = await UserProfile.create(profileData);

  // if profile not generated throw error
  if (!profile) {
    throw new ApiError(
      400,
      'User created but avatar is not Uploaded , try later.',
    );
  }

  // send the response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user, profile },
        'user and profile created successfully.',
      ),
    );
});

const userLogin = asyncHandler(async (req, res) => {
  // get the user details
  const { username, email, password } = req.body;

  // check for username or email
  if ((!username && !email) || !password) {
    throw new ApiError(400, 'Username/email and password are required');
  }

  // fetch userdata from username or email
  const user = await User.findOne({ $or: [{ username }, { email }] }).select(
    '+password',
  );

  // check user exist
  if (!user) {
    throw new ApiError(400, "user doesn't exist");
  }

  // check password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);

  // password is not correct
  if (!isPasswordValid) {
    throw new ApiError(400, 'please enter a valid password');
  }

  // generated accessToken and refreshToken
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  // getting ipaddress and useragent
  const ipAddress = (
    req.headers['x-forwarded-for'] || req.socket.remoteAddress
  )?.toString();
  const userAgent = req.get('User-Agent');

  // updating the user session
  const session = await UserSession.updateOne(
    { userId: user._id },
    {
      $set: {
        userAgent,
        ipAddress,
        refreshToken,
        lastLogin: Date.now(),
      },
    },
    {
      upsert: true, // upsert -> update + insert, if session is ther update if not then create it
      new: true, // new:true -> return the updated information
    },
  );

  // // temporary quetsion creating for testing
  // const question = await Question.create({
  //   uid: 1,
  //   title: 'question number one',
  //   description: 'description of question number one',
  //   difficulty: 'easy',
  //   submitted: 5,
  //   accepted: 3,
  //   topics: ['array', 'two pointer', 'hash table'],
  //   hints: ['hint1', 'hint2', 'hint3'],
  // });
  // const temp = [
  //   {
  //     questionUId: 1,
  //     input: '6\n-5 2 3 0 7 4\n7',
  //     output: '3 4',
  //   },
  //   {
  //     questionUId: 1,
  //     input: '7\n1 5 3 5 1 2 4\n7',
  //     output: '3 5',
  //   },
  //   {
  //     questionUId: 1,
  //     input: '4\n2 2 2 2\n4',
  //     output: '0 1',
  //   },
  //   {
  //     questionUId: 1,
  //     input: '10\n10 -3 7 1 4 9 -2 8 0 5\n6',
  //     output: '1 5',
  //   },
  //   {
  //     questionUId: 1,
  //     input: '8\n1000000 3 500000 -500000 0 7 -3 2\n100002',
  //     output: '-1',
  //   },
  // ];

  // const testcase = await Testcase.insertMany(temp);
  // console.log(testcase);
  // sending the response
  // options for cookies
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  };
  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user, session, accessToken, refreshToken },
        'user loggedin successfully !!',
      ),
    );
});

const currentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

const userLogout = asyncHandler(async (req, res) => {
  console.log(req.user?.role);
  const session = await UserSession.findOneAndUpdate(
    {
      userId: req.user?._id,
      refreshToken: { $exists: true },
    },
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );
  if (!session) {
    console.warn(`No session found for user ${req.user?._id}`);
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(
      new ApiResponse(200, {}, `${req.user?.role} logged out successfully`),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    // getting refreshToken from cookies or body
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, 'Unauthorized Access');
    }

    // decoding the refreshToken
    let decodedToken;
    try {
      decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }

    // finding the session of the current user
    const session = await UserSession.findOne({ userId: decodedToken?._id });

    if (!session || !session.refreshToken) {
      throw new ApiError(401, 'Refresh Token not found in session');
    }

    // calculating timeLeft to expire refreshToken
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = decodedToken.exp - currentTime;

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    };

    if (
      // if refreshToken will expires soon or different accessToken
      timeLeft < 2 * 24 * 60 * 60 ||
      incomingRefreshToken !== session.refreshToken
    ) {
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        decodedToken._id,
      );

      const updateRefreshToken = await UserSession.updateOne(
        { userId: decodedToken._id },
        {
          $set: {
            refreshToken,
          },
        },
      );

      if (!updateRefreshToken) {
        throw new ApiError(
          400,
          'Something went wrong while refreshing refreshToken',
        );
      }

      return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
          new ApiResponse(
            200,
            { accessToken, refreshToken },
            'accessToken and refreshToken is refreshed successfully',
          ),
        );
    } else {
      // refreshtoken expiry time is large
      const accessToken = await generateAccessToken(decodedToken._id);
      return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .json(
          new ApiResponse(
            200,
            { accessToken },
            'accessToken refresh successfully',
          ),
        );
    }
  } catch (error) {
    throw new ApiError(
      400,
      error?.message ||
        'Something went wrong while refreshing the access token',
    );
  }
});

const getUserProfile = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new ApiError(404, 'UserId not found!!');
    }

    const userDoc = await User.findOne({ username: userId })
      .select('_id fullName')
      .lean();
    if (!userDoc) {
      throw new ApiError(404, 'User not found');
    }
    const uid = userDoc._id;

    const userprofile = await UserProfile.findOne({ userId: uid }).lean();
    if (!userprofile) {
      throw new ApiError(400, 'User Profile not found!!');
    }
    const distQuestionSolved = await Submission.aggregate([
      { $match: { userId: uid, status: 'passed' } },
      { $group: { _id: '$questionUId' } },
      { $count: 'uniqueQuestionCount' },
    ]);
    const totalSolved = distQuestionSolved[0]?.uniqueQuestionCount || 0;

    const [totalSubmissions, passedSubmissions] = await Promise.all([
      Submission.countDocuments({ userId: uid }),
      Submission.countDocuments({ userId: uid, status: 'passed' }),
    ]);

    const acceptanceRate =
      totalSubmissions > 0
        ? Math.round((passedSubmissions / totalSubmissions) * 10000) / 100
        : 0;

    const months = 12;
    const fromDate = new Date();
    fromDate.setUTCDate(1);
    fromDate.setUTCHours(0, 0, 0, 0);
    fromDate.setUTCMonth(fromDate.getUTCMonth() - (months - 1));

    const monthlyAgg = await Submission.aggregate([
      {
        $match: {
          userId: uid,
          status: 'passed',
          createdAt: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    const aggMap = new Map(
      monthlyAgg.map((item) => {
        const key = `${String(item.year).padStart(4, '0')}-${String(item.month).padStart(2, '0')}`;
        return [key, item.count];
      }),
    );

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthlySolved = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(
        Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth() + i, 1),
      );
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth() + 1;
      const key = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`;
      monthlySolved.push({
        key,
        year,
        month,
        label: monthNames[month - 1],
        count: aggMap.get(key) || 0,
      });
    }

    let solvedByDifficulty = [
      { name: 'Easy', value: 0, color: '#10b981' },
      { name: 'Medium', value: 0, color: '#f59e0b' },
      { name: 'Hard', value: 0, color: '#ef4444' },
    ];

    try {
      const solvedIdsAgg = await Submission.aggregate([
        { $match: { userId: uid, status: 'passed' } },
        { $group: { _id: '$questionUId' } },
        { $project: { questionUId: '$_id', _id: 0 } },
      ]);
      const solvedIds = solvedIdsAgg.map((r) => r.questionUId).filter(Boolean);
      if (solvedIds.length && typeof Question !== 'undefined') {
        const difficulties = await Question.aggregate([
          { $match: { uid: { $in: solvedIds } } },
          { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        ]);

        const diffMap = difficulties.reduce((acc, cur) => {
          acc[String(cur._id).toLowerCase()] = cur.count;
          return acc;
        }, {});

        solvedByDifficulty = solvedByDifficulty.map((item) => ({
          ...item,
          value: diffMap[item.name.toLowerCase()] || 0,
        }));
      }
    } catch (err) {
      console.warn(
        'Could not compute solvedByDifficulty:',
        err?.message || err,
      );
    }

    const N = 10;

    const solvedHistory = await Submission.aggregate([
      { $match: { userId: uid, status: 'passed' } },
      { $sort: { createdAt: -1 } },
      { $limit: N },
      {
        $lookup: {
          from: 'questions',
          localField: 'questionUId',
          foreignField: 'uid',
          as: 'questionDoc',
        },
      },
      { $unwind: { path: '$questionDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          sid: '$_id',
          uid: '$questionDoc.uid',
          title: '$questionDoc.title',
          difficulty: '$questionDoc.difficulty',
          topic: { $arrayElemAt: ['$questionDoc.topics', 0] },
          date: '$createdAt',
        },
      },
    ]);

    const date = new Date(userprofile.createdAt);
    const formattedDate = `${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

    const totalQuestions = await Question.countDocuments();

    const userProfileData = {
      username: userId,
      fullName: userDoc.fullName,
      avatarUrl: userprofile.avatarUrl,
      bio: userprofile.bio,
      joinedDate: formattedDate,
      location: userprofile.country,
      totalSolved,
      totalQuestions,
      acceptanceRate,
      monthlySolved: monthlySolved,
      solvedByDifficulty,
      solvedHistory,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, userProfileData, 'User profile data'));
  } catch (error) {
    return next(error);
  }
});

export {
  userRegsiter,
  userLogin,
  currentUser,
  userLogout,
  refreshAccessToken,
  getUserProfile,
};
