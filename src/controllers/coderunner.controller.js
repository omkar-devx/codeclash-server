// controllers/yourControllerFile.js
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
  const mode = req.query.mode === 'quick' ? 'full' : 'quick';

  const { questionUId, language_id, source_code } = req.body;
  // console.log(req.body);
  if (!questionUId || !language_id || !source_code) {
    throw new ApiError(401, 'missing fields during code running');
  }

  // fetch testcases
  const testcases = await Testcase.find({ questionUId })
    .sort({ createdAt: 1 })
    .limit(3);
  if (!testcases || testcases.length === 0) {
    throw new ApiError(404, 'testcase not found for the current question');
  }

  // choose testcases based on mode
  // const usedTestcases = mode === 'quick' ? testcases.slice(0, 3) : testcases;

  // time limits per mode — tune as needed
  const limits =
    mode === 'quick'
      ? { cpu: '1.0', extra: '0.2', wall: '2.0' }
      : { cpu: '2.0', extra: '0.5', wall: '5.0' };

  const submissions = testcases.map((testcase) => ({
    language_id,
    source_code: Buffer.from(source_code).toString('base64'),
    stdin: Buffer.from(testcase.input).toString('base64'),
    expected_output: null,
    cpu_time_limit: limits.cpu,
    cpu_extra_time: limits.extra,
    wall_time_limit: limits.wall,
    memory_limit: 131072,
    stack_limit: 32000,
    max_processes_and_or_threads: 50,
    redirect_stderr_to_stdout: true,
    enable_network: false,
    number_of_runs: 1,
  }));

  // create a submission and get the token as response
  const tokenizedResult = await judge0BatchedSubmission({ submissions });
  if (!tokenizedResult) {
    throw new ApiError(400, 'token is not generated after code submission');
  }

  // combine tokens
  const tokenString = tokenizedResult.map((obj) => obj.token).join(',');

  // choose polling window depending on mode
  const polling =
    mode === 'quick'
      ? { maxRetries: 40, intervalMs: 500 } // ~20s
      : { maxRetries: 180, intervalMs: 1000 }; // ~180s

  const result = await judge0BatchedSubmissionResult(
    tokenString,
    polling.maxRetries,
    polling.intervalMs,
  );

  if (!result || !result.submissions || result.submissions.length === 0) {
    throw new ApiError(
      400,
      'something went wrong while get batched submission - (controller)',
    );
  }

  const safeDecode = (str) =>
    str ? Buffer.from(str, 'base64').toString('utf-8') : '';

  const output = result.submissions.map((submission, idx) => {
    const stdoutDecode = safeDecode(submission.stdout).trim();
    const stdinDecode = safeDecode(submission.stdin);
    const compileDecode = safeDecode(submission.compile_output);
    const stderrDecode = safeDecode(submission.stderr);
    const testcaseArray = testcases[idx].output;

    let verdict = submission.status.description;

    // Optional: double-check Wrong Answer vs Accepted
    if (submission.status.id === 3) {
      const isAccepted = testcaseArray.some(
        (exp) => exp.trim() === stdoutDecode,
      );
      verdict = isAccepted ? 'Accepted' : 'Wrong Answer';
    }

    return {
      stdin: stdinDecode,
      expected_output: testcaseArray[0],
      stdout: stdoutDecode,
      stderr: stderrDecode,
      compile_output: compileDecode,
      created_at: submission.created_at,
      finished_at: submission.finished_at,
      time: submission.time,
      memory: submission.memory,
      token: submission.token,
      status: submission.status,
      verdict,
      language: submission.language,
    };
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { source_code, output }, 'Code Runned Successfully'),
    );
});

const codeSubmit = asyncHandler(async (req, res) => {
  const mode = req.query.mode === 'full' ? 'quick' : 'full';

  const user = req.user;
  if (!user) {
    throw new ApiError(401, 'Unauthorized Access');
  }
  const userId = user._id;

  const { questionUId, language_id, source_code } = req.body;
  if (!questionUId || !language_id || !source_code) {
    throw new ApiError(400, 'field is missing during submission');
  }

  const testcases = await Testcase.find({ questionUId }).sort({ createdAt: 1 });
  if (!testcases || testcases.length === 0) {
    throw new ApiError(401, 'testcase is not found of this question');
  }

  // const usedTestcases = mode === 'quick' ? testcases.slice(0, 1) : testcases;

  const limits =
    mode === 'quick'
      ? { cpu: '1.0', extra: '0.2', wall: '2.0' }
      : { cpu: '2.0', extra: '0.5', wall: '5.0' };

  const submissions = testcases.map((testcase) => ({
    language_id,
    source_code: Buffer.from(source_code).toString('base64'),
    stdin: Buffer.from(testcase.input).toString('base64'),
    expected_output: null,
    cpu_time_limit: limits.cpu,
    cpu_extra_time: limits.extra,
    wall_time_limit: limits.wall,
    memory_limit: 131072,
    stack_limit: 32000,
    max_processes_and_or_threads: 50,
    redirect_stderr_to_stdout: true,
    enable_network: false,
    number_of_runs: 1,
  }));

  const tokenizedResult = await judge0BatchedSubmission({ submissions });
  if (!tokenizedResult) {
    throw new ApiError(400, 'token is not generated after code submission');
  }

  const tokenString = tokenizedResult.map((obj) => obj.token).join(',');

  const polling =
    mode === 'quick'
      ? { maxRetries: 40, intervalMs: 500 }
      : { maxRetries: 180, intervalMs: 1000 };

  const result = await judge0BatchedSubmissionResult(
    tokenString,
    polling.maxRetries,
    polling.intervalMs,
  );

  if (!result || !result.submissions || result.submissions.length === 0) {
    throw new ApiError(
      400,
      'something went wrong while get batched submission - (controller)',
    );
  }

  let maxTime = 0;
  let maxMemory = 0;
  let failedTestCase = null;
  let status = 'passed';
  let message = 'Accepted';
  let testcase_count = testcases.length;
  let compile_output = '';
  let expected_output = '';
  let stdout = '';
  let testcase_passed = 0;

  for (let i = 0; i < result.submissions.length; i++) {
    let test = result.submissions[i];
    let testcaseArray = testcases[i].output;
    stdout = test.stdout
      ? Buffer.from(test.stdout, 'base64').toString().trim()
      : '';
    if (testcaseArray.includes(stdout)) {
      testcase_passed++;
    }
  }

  for (let i = 0; i < result.submissions.length; i++) {
    let test = result.submissions[i];
    let testcaseArray = testcases[i].output;

    const time = parseFloat(test.time);
    if (time > maxTime) maxTime = time;

    if (test.memory > maxMemory) maxMemory = test.memory;
    stdout = test.stdout
      ? Buffer.from(test.stdout, 'base64').toString().trim()
      : '';
    if (!testcaseArray.includes(stdout)) {
      failedTestCase = Buffer.from(test.stdin, 'base64').toString();
      status = 'failed';
      message = 'Wrong Answer';
      compile_output = test.compile_output
        ? Buffer.from(test.compile_output, 'base64').toString()
        : '';
      expected_output = testcaseArray[0];
      break;
    }

    if (test.status.id !== 3) {
      failedTestCase = Buffer.from(test.stdin, 'base64').toString();
      status = 'failed';
      message = test.status.description;
      compile_output = test.compile_output
        ? Buffer.from(test.compile_output, 'base64').toString()
        : '';
      expected_output = testcaseArray[0];
      break;
    }
  }

  const submit = await Submission.create({
    userId,
    questionUId,
    source_code,
    testcase_count,
    testcase_passed,
    time: maxTime,
    memory: maxMemory,
    failedTestCase,
    expected_output,
    stdout,
    status,
    compile_output,
    message,
  });
  if (!submit) {
    throw new ApiError(
      400,
      'something went wrong while submitting the submission to DB',
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { submit }, 'code is submitted'));
});

export { codeRun, codeSubmit };
