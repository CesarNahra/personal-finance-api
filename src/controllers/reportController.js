import reportService from '../services/reportService.js';

function getSummary(req, res, next) {
  try {
    const summary = reportService.getSummary(req.query);

    return res.status(200).json({
      data: summary
    });
  } catch (error) {
    return next(error);
  }
}

export default {
  getSummary
};