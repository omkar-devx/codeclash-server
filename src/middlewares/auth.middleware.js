import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // getting token from cookies
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer', '');

    if (!token) {
      throw new ApiError(400, 'Unauthorized Access');
    }

    // decode the token
    // console.log(req.cookies);
    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    // console.log(decodedToken);
    // finding user by id present in the token
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(400, 'Invalid Access Token');
    }

    // here we creating a new object user and initializing it with user
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid Access Token');
  }
});
