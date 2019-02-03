// Require class dependencies
const Generator = require('C:/Users/JackT/AppData/Local/Microsoft/TypeScript/2.9/node_modules/@types/yeoman-generator/index');

/**
 * Create Eden App Generator class
 */
class EdenAppGenerator extends Generator {
  /**
   * Construct Eden App Generator class
   *
   * @param {string|string[]} args
   * @param {{}} opts
   */
  constructor(args, opts) {
    // Run super
    super(args, opts);
  }
}

/**
 * Export Eden App Generator class
 *
 * @type {EdenAppGenerator}
 */
exports = module.exports = EdenAppGenerator;
