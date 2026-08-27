export default function paginationMiddleware(req, res, next) {
    req.page = req.query.page || 0;
    req.pageSize = req.query.pageSize || 10;
    req.pageOffset = req.page * req.pageSize;
    
    next();
}