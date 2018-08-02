// Require class dependencies
const Generator = require('yeoman-generator');

// Require dependencies
const slugify      = require('slugg');
const validateName = require('validate-npm-package-name');

/**
 * Create Eden NPM Generator class
 */
class EdenNPMGenerator extends Generator {

  /**
   * Construct Eden NPM Generator class
   *
   * @param {string|string[]} args
   * @param {{}} opts
   */
  constructor (args, opts) {
    // Run super
    super(args, opts);

    // Set private variables
    this._config = Object.create(null);
  }

  /**
   * Constructs the 'package.json' object using this generator's config
   *
   * @returns {API.IPackageJSON}
   */
  _constructPackageJSON () {

  }

  /**
   * Prompts for the name of this NPM package
   *
   * @returns {Promise}
   */
  async askForPackageName () {
    // Check config
    if (!this._config.packageName) {
      // Prompt for module name
      const packageName = await this.prompt({
        'type'    : 'input',
        'name'    : 'packageName',
        'message' : 'Package name',
        'default' : slugify(this.appname)
      });

      // Validate package name
      if (!validateName(packageName).validForNewPackages) return await this.askForPackageName();

      // Set package name in config
      this._config.packageName = packageName;
    }
  }

  end () {
    this.log(this._config);
  }

}

/**
 * Export Eden NPM Generator class
 *
 * @type {EdenNPMGenerator}
 */
exports = module.exports = EdenNPMGenerator;
