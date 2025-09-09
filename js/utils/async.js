// ==================== ASYNC UTILITY FUNCTIONS ====================

/**
 * Sleep function that returns an awaitable timeout
 * @param {number} ms - Number of milliseconds to sleep
 * @returns {Promise} Promise that resolves after the specified time
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
