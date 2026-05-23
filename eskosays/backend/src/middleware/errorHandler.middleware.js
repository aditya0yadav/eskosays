const errorHandler = (err, req, res, next) => {
    // Prefer the status on the error itself (e.g. 413 from body-parser, 400 for bad JSON)
    // Fall back to res.statusCode, then default to 500
    const statusCode = err.status || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
    console.error(`[Error] ${req.method} ${req.path} → ${statusCode}: ${err.message}`);
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };