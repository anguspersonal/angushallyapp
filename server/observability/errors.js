const ErrorTypes = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  DEPENDENCY: 'dependency',
  RATE_LIMIT: 'rate_limit',
  INTERNAL: 'internal',
};

const STATUS_BY_TYPE = {
  [ErrorTypes.VALIDATION]: 400,
  [ErrorTypes.AUTHENTICATION]: 401,
  [ErrorTypes.AUTHORIZATION]: 403,
  [ErrorTypes.NOT_FOUND]: 404,
  [ErrorTypes.RATE_LIMIT]: 429,
  [ErrorTypes.DEPENDENCY]: 502,
  [ErrorTypes.INTERNAL]: 500,
};

const ERROR_TAXONOMY = {
  HABIT_INVALID_PERIOD: {
    type: ErrorTypes.VALIDATION,
    status: 400,
    errorClass: 'validation',
    isUserFacing: true,
    isRecoverable: true,
  },
  HABIT_INVALID_METRIC: {
    type: ErrorTypes.VALIDATION,
    status: 400,
    errorClass: 'validation',
    isUserFacing: true,
    isRecoverable: true,
  },
  HABIT_STATS_PROVIDER_MISSING: {
    type: ErrorTypes.DEPENDENCY,
    status: 501,
    errorClass: 'dependency',
    isUserFacing: true,
    isRecoverable: false,
  },
  HABIT_STATS_FETCH_FAILED: {
    type: ErrorTypes.DEPENDENCY,
    status: 500,
    errorClass: 'dependency',
    isUserFacing: false,
    isRecoverable: true,
  },
  HABIT_INVALID_TYPE: {
    type: ErrorTypes.VALIDATION,
    status: 400,
    errorClass: 'validation',
    isUserFacing: true,
    isRecoverable: true,
  },
  HABIT_AGGREGATE_PROVIDER_MISSING: {
    type: ErrorTypes.DEPENDENCY,
    status: 501,
    errorClass: 'dependency',
    isUserFacing: true,
    isRecoverable: false,
  },
  HABIT_DETAIL_FETCH_FAILED: {
    type: ErrorTypes.DEPENDENCY,
    status: 500,
    errorClass: 'dependency',
    isUserFacing: false,
    isRecoverable: true,
  },
  HABIT_CREATE_FAILED: {
    type: ErrorTypes.DEPENDENCY,
    status: 500,
    errorClass: 'dependency',
    isUserFacing: false,
    isRecoverable: true,
  },
  HABIT_LIST_FAILED: {
    type: ErrorTypes.DEPENDENCY,
    status: 500,
    errorClass: 'dependency',
    isUserFacing: false,
    isRecoverable: true,
  },
  CONTENT_NOT_FOUND: {
    type: ErrorTypes.NOT_FOUND,
    status: 404,
    errorClass: 'not_found',
    isUserFacing: true,
    isRecoverable: true,
  },
  CONTENT_FETCH_FAILED: {
    type: ErrorTypes.DEPENDENCY,
    status: 500,
    errorClass: 'dependency',
    isUserFacing: false,
    isRecoverable: true,
  },
};

function classifyError(error, { defaultCode = 'UNEXPECTED_ERROR', defaultType = ErrorTypes.INTERNAL } = {}) {
  const code = error?.code || defaultCode;
  const taxonomy = ERROR_TAXONOMY[code];
  const type = taxonomy?.type || error?.type || defaultType;
  const status = taxonomy?.status || error?.status || STATUS_BY_TYPE[type] || 500;
  const isUserFacing = taxonomy?.isUserFacing ?? Boolean(error?.isUserSafe);
  const isRecoverable = taxonomy?.isRecoverable ?? Boolean(error?.isRetryable);
  const errorClass = taxonomy?.errorClass || type || 'internal';

  return {
    code,
    status,
    type,
    isUserFacing,
    isRecoverable,
    errorClass,
  };
}

function mapErrorToResponse(error, { defaultMessage = 'Internal Server Error' } = {}) {
  const classification = classifyError(error);
  const message = classification.isUserFacing && error?.message ? error.message : defaultMessage;

  return {
    status: classification.status,
    body: {
      error: message,
      code: classification.code,
    },
    classification,
  };
}

module.exports = { ErrorTypes, mapErrorToResponse, classifyError, ERROR_TAXONOMY };
