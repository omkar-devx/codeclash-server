import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { SessionSchema } from '../models/sessionSchema.model.js';

const userRegsiter = asyncHandler(async (req, res) => {
  //   res.status(200).json({
  //     message: 'ok',
  //   });

  // 1) get user details from frontend
  // 2) validation - not empty
  // 3) check if user aleady exists: usernames , email
  // 4) check for images, check for avatar
  // 5) upload them to cloudinary, is avatar uploaded?
  // 6) create user object - create entry in db
  // 7) remove password and refresh token field  from response
  // 8) check for user creation
  // 9) return response

  const { fullName, username, email, password } = req.body;

  if (
    [fullName, username, email, password].some((field) => field?.trim() === '')
  ) {
    throw new ApiError(400, 'All Fields are Compulsory');
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new ApiError(400, 'user with email or username already exists');
  }

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findOne(user._id);

  if (!createdUser) {
    throw new ApiError(400, 'something went wrong while creating a user');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, 'user created successfully.'));
});

export { userRegsiter };
