export const getRatingDesc = (step, val) => {
  if (!step.ratingDesc || val === 0) return "";
  if (val <= 3) return step.ratingDesc.low;
  if (val <= 6) return step.ratingDesc.mid;
  return step.ratingDesc.high;
};
