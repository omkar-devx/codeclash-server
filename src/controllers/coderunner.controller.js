import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Testcase } from '../models/testcase.model.js';
import {
  judge0BatchedSubmission,
  judge0BatchedSubmissionResult,
} from '../utils/judge0.js';
import { Submission } from '../models/submission.model.js';

const codeRun = asyncHandler(async (req, res) => {
  // get quesId,langId,code from the body and check all is present or not
  const { questionUId, language_id, source_code } = req.body;
  if (!questionUId || !language_id || !source_code) {
    throw new ApiError(401, 'missing fields during code running');
  }

  // get the testcase for the current quesUID
  const testcases = await Testcase.find({ questionUId })
    .sort({ createdAt: 1 })
    .limit(3);
  if (!testcases || testcases.length === 0) {
    throw new ApiError(404, 'testcase not found for the current question');
  }

  // create a submission object to send to code execution
  const submissions = testcases.map((testcase) => ({
    language_id,
    source_code: Buffer.from(source_code).toString('base64'),
    stdin: Buffer.from(testcase.input).toString('base64'),
    expected_output: Buffer.from(testcase.output).toString('base64'),
    cpu_time_limit: '2.0', // 2s for cpu
    cpu_extra_time: '0.5', // extra cpu time
    wall_time_limit: '5.0', // total time combining, Cpu, I/O, Sleep, Waiting
    memory_limit: 131072, // 131MB of memory limit
    stack_limit: 32000, // stack limit 32MB
    max_processes_and_or_threads: 50, // limits parallelism
    redirect_stderr_to_stdout: true, // Combine error and normal output
    enable_network: false, // Disable internet/network access
    number_of_runs: 1, // number of run it takes
  }));

  // create a submission and get the token as  response
  const tokenizedResult = await judge0BatchedSubmission({ submissions });
  if (!tokenizedResult) {
    throw new ApiError(400, 'token is not generated after code submission');
  }

  console.log('code is submitted successfully !!');

  // combine all the token into one to get the result
  const tokenString = await tokenizedResult.map((obj) => obj.token).join(',');

  const result = await judge0BatchedSubmissionResult(tokenString);
  if (!result || !result.submissions || result.submissions.length === 0) {
    throw new ApiError(
      400,
      'something went wrong while get batched submission - (controller)',
    );
  }

  console.log('submission result is fetched successfully !!');

  const safeDecode = (str) =>
    str ? Buffer.from(str, 'base64').toString('utf-8') : '';
  const output = result.submissions.map(
    ({
      stdin,
      expected_output,
      stdout,
      created_at,
      finished_at,
      time,
      memory,
      token,
      number_of_runs,
      memory_limit,
      stack_limit,
      status,
      language,
    }) => ({
      stdin: safeDecode(stdin),
      expected_output: safeDecode(expected_output),
      stdout: safeDecode(stdout),
      created_at,
      finished_at,
      time,
      memory,
      token,
      number_of_runs,
      memory_limit,
      stack_limit,
      status,
      language,
    }),
  );

  res
    .status(200)
    .json(new ApiResponse(200, { source_code, output }, 'testcase'));
});

const codeSubmit = asyncHandler(async (req, res) => {
  // fetch user
  const user = req.user;
  if (!user) {
    throw new ApiError(401, 'Unauthorized Access');
  }
  const userId = user._id;

  // fetching fields from body
  const { questionUId, language_id, source_code } = req.body;
  if (!questionUId || !language_id || !source_code) {
    throw new ApiError(400, 'field is missing during submission');
  }

  // finding testcase by  using questionUid
  const testcases = await Testcase.find({ questionUId });
  if (!testcases || testcases.length === 0) {
    throw new ApiError(401, 'testcase is not found of this question');
  }

  // creating a array of submission for multiple testcases
  const submissions = testcases.map((testcase) => ({
    language_id,
    source_code: Buffer.from(source_code).toString('base64'),
    stdin: Buffer.from(testcase.input).toString('base64'),
    expected_output: Buffer.from(testcase.output).toString('base64'),
    cpu_time_limit: '2.0', // 2s for cpu
    cpu_extra_time: '0.5', // extra cpu time
    wall_time_limit: '5.0', // total time combining, Cpu, I/O, Sleep, Waiting
    memory_limit: 131072, // 131MB of memory limit
    stack_limit: 32000, // stack limit 32MB
    max_processes_and_or_threads: 50, // limits parallelism
    redirect_stderr_to_stdout: true, // Combine error and normal output
    enable_network: false, // Disable internet/network access
    number_of_runs: 1, // number of run it takes
  }));

  // submission to judge0
  const tokenizedResult = await judge0BatchedSubmission({ submissions });
  if (!tokenizedResult) {
    throw new ApiError(400, 'token is not generated after code submission');
  }

  // created a token to string to get the result
  const tokenString = await tokenizedResult.map((obj) => obj.token).join(',');

  console.log('code is submited successfully !!');

  // get the result by using token
  const result = await judge0BatchedSubmissionResult(tokenString);
  if (!result || !result.submissions || result.submissions.length === 0) {
    throw new ApiError(
      400,
      'something went wrong while get batched submission - (controller)',
    );
  }

  console.log('submission result is fetched successfully !!');

  // creating fields for DB submission
  let maxTime = 0;
  let maxMemory = 0;
  let failedTestCase = null;
  let status = 'passed';
  let message = 'Accepted';
  let testcase_count = testcases.length;

  for (const test of result.submissions) {
    const time = parseFloat(test.time);
    if (time > maxTime) maxTime = time;

    if (test.memory > maxMemory) maxMemory = test.memory;

    if (status !== 'failed' && test.status.id >= 4) {
      failedTestCase = Buffer.from(test.stdin, 'base64').toString();
      status = 'failed';
      message = test.status.description;
    }
  }

  // submitting the submission to DB
  const submit = await Submission.create({
    userId,
    questionUId,
    source_code,
    testcase_count,
    time: maxTime,
    memory: maxMemory,
    failedTestCase,
    status,
    message,
  });
  if (!submit) {
    throw new ApiError(
      400,
      'something went wrong while submitting the submission to DB',
    );
  }

  res.status(200).json(new ApiResponse(200, { submit }, 'code is submitted'));
});

export { codeRun, codeSubmit };
