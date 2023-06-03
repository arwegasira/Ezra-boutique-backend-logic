
const CustomError = require('./CustomError');
const {StatusCodes} = require('http-status-codes');

class BadrequestError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.BAD_REQUEST;
    }
}

module.exports = BadrequestError;