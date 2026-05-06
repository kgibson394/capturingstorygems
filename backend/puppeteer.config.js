const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Tells Puppeteer to download Chrome to: backend/.cache/puppeteer
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};