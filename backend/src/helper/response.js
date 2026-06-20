export const sendSuccess = (res, message, data = null) => {
  return res.status(200).json({
    success: true,
    message: message,
    content: data,
  });
};

export const sendError = (res, message) => {
  return res.status(400).json({
    success: false,
    message: message,
  });
};

export const sendServerError = (res) => {
  return res.status(500).json({
    success: false,
    message: 'Server Interval Error.',
  });
};