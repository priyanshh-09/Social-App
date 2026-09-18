const errorMiddleware = (err, req, res, next) => {
  console.log(err);
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    message: err.message || "Server error",
  });
};

export default errorMiddleware;
