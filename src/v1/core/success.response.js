'use strict';

const {StatusCodes,ReasonPhrases} = require('../utils/httpStatusCode');

class SuccessResponse {
    constructor({ message, statusCode =StatusCodes.OK, data  }) {
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
    }

    send(res) {
        return res.status(this.statusCode).json({
            status: ReasonPhrases.OK,
            code: this.statusCode,
            message: this.message,
            data: this.data
        });
    }
}

class OKResponse extends SuccessResponse {
    constructor({ message = ReasonPhrases.OK, data = null }) {
        super({ message, statusCode: StatusCodes.OK, data });
    }
}

class CreatedResponse extends SuccessResponse {
    constructor({ message = ReasonPhrases.ACCEPTED, data = null }) {
        super({ message, statusCode: StatusCodes.CREATED, data });
    }
}


module.exports = {
    OKResponse,
    CreatedResponse,
    SuccessResponse
};