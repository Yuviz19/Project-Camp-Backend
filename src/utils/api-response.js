class ApiResponse{
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; // statusCodes below 400 are generally treated as success
  }
}

export { ApiResponse };
