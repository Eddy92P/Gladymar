import dayjs from 'dayjs';

export const DISPLAY_DATE_FORMAT = 'DD/MM/YYYY';

export const formatDisplayDate = (date, fallback = '') => {
	if (!date) return fallback;
	const parsed = dayjs(date);
	return parsed.isValid() ? parsed.format(DISPLAY_DATE_FORMAT) : fallback;
};
