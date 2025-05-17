import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { SessionSchema } from '../models/sessionSchema.model.js';
import { UserProfile } from '../models/userProfile.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

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

  // if image in multer file upload it on cloudinary
  let avatarCloudinaryUrl;
  if (avatarFileLocalPath) {
    const fileSize = req.file?.size;
    if (fileSize > 100000) {
      throw new ApiError(400, 'uploaded image required less than 100kb');
    }
    console.log('file Size: ', fileSize);
    avatarCloudinaryUrl = await uploadOnCloudinary(avatarFileLocalPath);
    if (!avatarCloudinaryUrl) {
      throw new ApiError(400, 'cloudinary upload failed');
    }
  }

  // created a user in user model
  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
  });

  // giving error if user is not created
  if (!user) {
    throw new ApiError(400, 'something went wrong while creating a user');
  }

  // uploading user avatar on userprofile model by using user._id
  const finalAvatarUrl = defaultAvatar || avatarCloudinaryUrl.url;
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

export { userRegsiter };
