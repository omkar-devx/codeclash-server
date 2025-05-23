import axios from 'axios';

const RapidApiURI = 'https://judge0-ce.p.rapidapi.com';

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
      `${RapidApiURI}/submissions`,
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
  try {
    const response = await axios.get(
      `${RapidApiURI}/submissions/${rapidApiTokens}`,
      {
        params: {
          base64_encoded: 'true',
          fields: '*',
        },
        headers: getHeaders,
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

const judge0BatchedSubmission = async (submissionsPayload) => {
  try {
    const response = await axios.post(
      `${RapidApiURI}/submissions/batch`,
      submissionsPayload,
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

const judge0BatchedSubmissionResult = async (rapidApiTokens) => {
  try {
    const response = await axios.get(`${RapidApiURI}/submissions/batch`, {
      params: {
        tokens: RapidApitokens,
        base64_encoded: 'true',
        fields: '*',
      },
      headers: getHeaders,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error(
      error?.response?.data || error.message || 'Something went wrong',
    );
    return null;
  }
};

export {
  Judge0SingleSubmission,
  Judge0SingleSubmissionResult,
  judge0BatchedSubmission,
  judge0BatchedSubmissionResult,
};
