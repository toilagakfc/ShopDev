'use strict';
/**
 * Asynchronous handler for Express routes.
 * This function wraps an async route handler and catches any errors,
 * passing them to the next middleware.
 *
 * @param {Function} fn - The async function to wrap.
 * @returns {Function} - A new function that handles the request, response, and next parameters.
 */
const asyncHandler = fn => (req, res, next) => {
    return (fn(req, res, next)).catch(next);
}

module.exports = {
    asyncHandler
};