// limiter.js
import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/ApiResponse.js';

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per minute
  handler: (req, res) => {
    return res
      .status(429)
      .json(
        new ApiResponse(429, {}, 'Too many requests, please try again later.'),
      );
  },
});
