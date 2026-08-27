export default function errorMiddleware(err, req, res, next) {
    return res.json({
        message: err.message
    });
}