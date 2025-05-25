import axios from 'axios';
import { ApiError } from './ApiError.js';

// CODECLASH PERSONAL CODE EXECUTION SYSTEM
// const codeExecutionUrl = process.env.CODECLASH_CODE_EXECUTION;

// const postHeaders = {
//   'Content-Type': 'application/json',
// };

// const getHeaders = {};

// RAPID API CONFG
const codeExecutionUrl = 'https://judge0-ce.p.rapidapi.com';

const postHeaders = {
  'x-rapidapi-key': process.env.RAPID_API_KEY,
  'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
  'Content-Type': 'application/json',
};

const getHeaders = {
  'x-rapidapi-key': process.env.RAPID_API_KEY,
  'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
};

const Judge0SingleSubmission = async (
  languageId,
  sourceCodeBase64,
  stdInBase64,
) => {
  try {
    const response = await axios.post(
      `${codeExecutionUrl}/submissions`,
      {
        language_id: languageId,
        source_code: sourceCodeBase64,
        stdin: stdInBase64,
      },
      {
        params: {
          base64_encoded: 'true',
          wait: 'false',
          fields: '*',
        },
        headers: postHeaders,
        timeout: 10000,
      },
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error(
      error?.response?.data || error.message || 'Something went wrong',
    );
    return null;
  }
};

const Judge0SingleSubmissionResult = async (rapidApiTokens) => {
  return new Promise((resolve, reject) => {
    const intervalId = setTimeout(async () => {
      try {
        const response = await axios.get(`${codeExecutionUrl}/submission`, {
          params: {
            tokens: tokenString,
            base64_encoded: 'true',
            fields: '*',
          },
          headers: getHeaders,
        });
        const data = response.data;
        if (data.status <= 2) {
          console.log('processing....');
        } else {
          clearInterval(intervalId);
          resolve(data);
        }
      } catch (error) {
        clearInterval(intervalId);
        reject(
          error?.response?.data || error.message || 'something went wrong ',
        );
      }
    }, 1000);
  });
};

const judge0BatchedSubmission = async ({ submissions }) => {
  try {
    const response = await axios.post(
      `${codeExecutionUrl}/submissions/batch`,
      { submissions },
      {
        params: {
          base64_encoded: 'true',
        },
        headers: postHeaders,
        timeout: 10000,
      },
    );
    return response.data;
  } catch (error) {
    console.error(
      error?.response?.data || error.message || 'Something went wrong',
    );
    return null;
  }
};

const judge0BatchedSubmissionResult = async (
  tokenString,
  maxRetries = 30,
  intervalMs = 1000,
) => {
  return new Promise((resolve, reject) => {
    let retries = 0;

    const intervalId = setInterval(async () => {
      try {
        // only try for 30 time means 30s
        retries++;
        if (retries > maxRetries) {
          clearInterval(intervalId);
          return reject(
            new Error('Timeout: Submission processing took too long'),
          );
        }
        // fetching the result by using given compiled token
        const response = await axios.get(
          `${codeExecutionUrl}/submissions/batch`,
          {
            params: {
              tokens: tokenString,
              base64_encoded: 'true',
              fields: '*',
            },
            headers: getHeaders,
            timeout: 10000,
          },
        );
        if (!response) {
          throw new ApiError(400, 'server may not functioning');
        }

        // get the data from response and check every submission status must be > 2 means processing completed
        const data = response.data;
        const allDone = data.submissions.every(
          (submission) => submission.status.id > 2,
        );

        // resolve if processing is completed and clear the interval to out of it
        if (!allDone) {
          console.log('processing.......');
        } else {
          clearInterval(intervalId);
          resolve(data);
        }
      } catch (error) {
        clearInterval(intervalId);
        reject(
          error?.response?.data || error.message || 'Something went wrong',
        );
      }
    }, intervalMs);
  });
};

export {
  Judge0SingleSubmission,
  Judge0SingleSubmissionResult,
  judge0BatchedSubmission,
  judge0BatchedSubmissionResult,
};
