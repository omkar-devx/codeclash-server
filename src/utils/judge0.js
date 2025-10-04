import axios from 'axios';
import { ApiError } from './ApiError.js';

// CODECLASH PERSONAL CODE EXECUTION SYSTEM
const codeExecutionUrl = process.env.CODECLASH_CODE_EXECUTION;

const postHeaders = {
  'Content-Type': 'application/json',
};

const getHeaders = {};

// RAPID API CONFG
// const codeExecutionUrl = 'https://judge0-ce.p.rapidapi.com';

// const postHeaders = {
//   'x-rapidapi-key': process.env.RAPID_API_KEY,
//   'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//   'Content-Type': 'application/json',
// };

// const getHeaders = {
//   'x-rapidapi-key': process.env.RAPID_API_KEY,
//   'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
// };

const JUDGE0_POST_TIMEOUT = 120000; // 120s for POST (submissions)
const JUDGE0_GET_TIMEOUT = 10000; // 10s for each GET attempt
const DEFAULT_POLL_INTERVAL_MS = 1000; // poll every 1s
const DEFAULT_MAX_RETRIES = 120; // up to ~120s of polling

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const judge0BatchedSubmission = async ({ submissions }) => {
  try {
    const response = await axios.post(
      `${codeExecutionUrl}/submissions/batch`,
      { submissions },
      {
        params: { base64_encoded: 'true' },
        headers: postHeaders,
        timeout: JUDGE0_POST_TIMEOUT,
      },
    );
    // Response should be an array with tokens
    return response.data;
  } catch (error) {
    console.error(
      'judge0BatchedSubmission error:',
      error?.response?.data || error?.message,
    );
    return null;
  }
};

const judge0BatchedSubmissionResult = async (
  tokenString,
  maxRetries = DEFAULT_MAX_RETRIES,
  intervalMs = DEFAULT_POLL_INTERVAL_MS,
) => {
  try {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await axios.get(
          `${codeExecutionUrl}/submissions/batch`,
          {
            params: {
              tokens: tokenString,
              base64_encoded: 'true',
              fields: '*',
            },
            headers: getHeaders,
            timeout: JUDGE0_GET_TIMEOUT,
          },
        );

        const data = response?.data;
        if (
          data &&
          Array.isArray(data.submissions) &&
          data.submissions.length > 0
        ) {
          const allDone = data.submissions.every(
            (submission) => submission.status?.id > 2,
          );

          if (allDone) {
            return data;
          }
          // else continue polling
        }
      } catch (err) {
        console.warn(
          `judge0 result fetch attempt ${attempt + 1} failed:`,
          err?.response?.data || err?.message,
        );
      }
      await sleep(intervalMs);
    }
    throw new Error('Timeout: Submission processing took too long');
  } catch (err) {
    throw err;
  }
};

export { judge0BatchedSubmission, judge0BatchedSubmissionResult };
