/**
 * Generates a unique certificate code in the format 'IFAL-YEAR-XXXXXX'.
 * @returns {string} The generated unique certificate code.
 * @deprecated Use generateValidationCode for more specific codes.
 */
export const generateCertificateCode = (): string => {
  const year = new Date().getFullYear();
  // Generates a random 6-character alphanumeric string
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `IFAL-${year}-${randomPart}`;
};


/**
 * Generates a unique validation code by combining student and event IDs.
 * Format: EVT<eventId>-<last 6 digits of studentId>
 * @param {string} studentId - The student's registration ID.
 * @param {number} eventId - The event's unique ID.
 * @returns {string} The generated validation code.
 */
export const generateValidationCode = (studentId: string, eventId: number): string => {
    const studentIdPart = studentId.slice(-6);
    const eventIdPart = eventId.toString().padStart(4, '0');
    
    return `EVT${eventIdPart}-${studentIdPart}`;
}
