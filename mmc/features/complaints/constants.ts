/** Max stored size per complaint photo (enforced on API after compress). */
export const COMPLAINT_PHOTO_MAX_BYTES = 100 * 1024;

/** Max size per photo before server compress (multipart upload). */
export const COMPLAINT_PHOTO_RAW_MAX_BYTES = 10 * 1024 * 1024;

export const COMPLAINT_PHOTO_MAX_COUNT = 3;

export const COMPLAINT_PHOTO_MAX_DIMENSION = 1920;

export const COMPLAINT_PHOTOS_R2_PREFIX = "complaint-photos";
