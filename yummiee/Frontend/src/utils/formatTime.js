/**
 * Formats cooking time in minutes into a human-readable string.
 * e.g. 30 -> "30 min", 60 -> "1 hr", 90 -> "1 hr 30 min", 120 -> "2 hrs"
 */
export function formatTime(totalMinutes) {
  const timeNum = Number(totalMinutes);
  if (!timeNum || isNaN(timeNum) || timeNum <= 0) return "0 min";

  if (timeNum < 60) {
    return `${timeNum} min`;
  }

  const hours = Math.floor(timeNum / 60);
  const minutes = timeNum % 60;

  const hrStr = hours === 1 ? "1 hr" : `${hours} hrs`;
  if (minutes === 0) {
    return hrStr;
  }

  return `${hrStr} ${minutes} min`;
}
