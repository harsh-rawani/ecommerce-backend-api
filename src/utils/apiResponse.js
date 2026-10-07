export class ApiResponse {
    static success(res, statusCode, message, data = null, meta = null) {
      const payload = {
        success: true,
        message,
        ...(data !== null && { data }),
        ...(meta !== null && { meta })
      };
      return res.status(statusCode).json(payload);
    }
  
    static error(res, statusCode, message, errorCode, details = null) {
      const payload = {
        success: false,
        message,
        error: {
          code: errorCode,
          ...(details && { details })
        }
      };
      return res.status(statusCode).json(payload);
    }
  }