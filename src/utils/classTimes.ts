// Staff close a class time by adding "(Full)" to it in the program settings,
// e.g. "Class 2: 12:00 pm - 2:00 pm (Full)".
const FULL_SUFFIX = /\s*\(full\)\s*$/i;

export const isClassTimeFull = (time: string) => FULL_SUFFIX.test(time);

export const classTimeLabel = (time: string) => time.replace(FULL_SUFFIX, '');
