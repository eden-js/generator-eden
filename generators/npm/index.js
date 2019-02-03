// Require class dependencies
const Generator = require('yeoman-generator');

// Require dependencies
const fs              = require('fs');
const normalizeData   = require('normalize-package-data');
const semver          = require('semver');
const validateName    = require('validate-npm-package-name');
const validateLicense = require('validate-npm-package-license');

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
  constructor(args, opts) {
    // Run super
    super(args, opts);

    // Add force option
    this.option('force', null);

    // Add package name option
    this.option('package-name', {
      type        : String,
      description : 'Package name',
    });

    // Add package version option
    this.option('package-version', {
      type        : String,
      description : 'Package version',
    });

    // Add package description option
    this.option('package-description', {
      type        : String,
      description : 'Package description',
    });

    // Add package bin option
    this.option('package-bin', {
      type        : String,
      description : 'Package bin',
    });

    // Add package test option
    this.option('package-test', {
      type        : String,
      description : 'Package test command',
    });

    // Add package repository option
    this.option('package-repository', {
      type        : String,
      description : 'Package repository',
    });

    // Add package license option
    this.option('package-license', {
      type        : String,
      description : 'Package license',
    });

    // Set private variables
    this._config = Object.create(null);
  }

  /**
   * Cleans up a given name to be allowed as a package name
   *
   * @param   {string} name
   *
   * @returns {string}
   */
  _niceName(name) {
    // Return cleaned name
    return name.replace(/^node-|[.-]js$/g, '').replace(' ', '-').toLowerCase();
  }

  /**
   * Constructs the 'package.json' object using this generator's config
   *
   * @returns {API.IPackageJSON}
   */
  _constructPackageJSON() {
    /** @type {API.IPackageJSON} */
    const packageJSON = {};

    // Set variables
    packageJSON.name = this._config.packageName;
    packageJSON.version = this._config.packageVersion;
    packageJSON.description = this._config.packageDescription;
    packageJSON.main = this._config.packageMain;
    packageJSON.bin = this._config.packageBin;
    packageJSON.directories = this._config.packageDirectories;
    packageJSON.scripts = {
      test : this._config.packageTest,
    };
    packageJSON.repository = this._config.packageRepository;
    packageJSON.keywords = this._config.packageKeywords;
    packageJSON.author = this._config.packageAuthor;
    packageJSON.license = this._config.packageLicense;

    // Normalize package json
    normalizeData(packageJSON);

    // Remove old data
    delete packageJSON.readme;
    delete packageJSON._id;

    // Return package json
    return packageJSON;
  }

  /**
   * Prompts for the name of this NPM package
   *
   * @returns {Promise}
   */
  async askForPackageName() {
    // Check force
    if (this.options.force) {
      // Set package name in config
      this._config.packageName = this._niceName(this.options['package-name'] || '');

      // Return
      return;
    }

    // Prompt for package name
    const packageName = (await this.prompt({
      type    : 'input',
      name    : 'packageName',
      message : 'Package name',
      default : this._niceName(this.options['package-name'] || this.appname),
    })).packageName;

    // Validate package name
    const validation = validateName(packageName);

    // Check validation
    if (validation.validForNewPackages) {
      // Set package name in config
      this._config.packageName = this._niceName(packageName);

      // Return
      return;
    }

    // Delete from options
    delete this.options['package-name'];

    // Log error
    console.error(`Sorry, ${(validation.errors || []).concat(validation.warnings || []).join(' and ')}.`);

    // Ask for package name again
    return await this.askForPackageName();
  }

  /**
   * Prompts for the version of this NPM package
   *
   * @returns {Promise}
   */
  async askForPackageVersion() {
    // Check force
    if (this.options.force) {
      // Set package version in config
      this._config.packageVersion = this.options['package-version'];

      // Return
      return;
    }

    // Prompt for package version
    const packageVersion = (await this.prompt({
      type    : 'input',
      name    : 'packageVersion',
      message : 'Package version',
      default : semver.valid(this.options['package-version']) ? this.options['package-version'] : '1.0.0',
    })).packageVersion;

    // Validate package version
    if (semver.valid(packageVersion)) {
      // Set package version in config
      this._config.packageVersion = packageVersion;

      // Return
      return;
    }

    // Delete from options
    delete this.options['package-version'];

    // Log error
    console.error(`invalid version: "${packageVersion}"`);

    // Ask for package version again
    return await this.askForPackageVersion();
  }

  /**
   * Prompts for the description of this NPM package
   */
  async askForPackageDescription() {
    // Check force
    if (this.options.force) {
      // Set package description in config
      this._config.packageDescription = this.options['package-description'];

      // Return
      return;
    }

    // Prompt for package description
    this._config.packageDescription = (await this.prompt({
      type    : 'input',
      name    : 'packageDescription',
      message : 'Package description',
      default : this.options['package-description'],
    })).packageDescription;
  }

  /**
   * Prompts for the entry point of this NPM package
   */
  async askForPackageMain() {
    // Check force
    if (this.options.force) {
      // Set package main in config
      this._config.packageMain = this.options['package-main'];

      // Return
      return;
    }

    // Set index
    let index = 'index.js';

    // Run try/catch
    try {
      // Read destination directory
      let files = fs.readdirSync(this.destinationRoot('.'));

      // Filter files
      files = files.filter((file) => {
        // Return file check
        return file.match(/\.js$/);
      });

      // Check files
      if (files.indexOf('index.js') !== -1) {
        // Update index
        index = 'index.js';
      } else if (files.indexOf('main.js') !== -1) {
        // Update index
        index = 'main.js';
      } else if (files.indexOf(`${this.appname}.js`) !== -1) {
        // Update index
        index = `${this.appname}.js`;
      }
    } catch (ignored) {
      // Ignored
    }

    // Prompt for package main
    this._config.packageMain = (await this.prompt({
      type    : 'input',
      name    : 'packageMain',
      message : 'Package entry point',
      default : this.options['package-main'] || index,
    })).packageMain;
  }

  /**
   * Checks the destination directory for a bin folder
   */
  checkPackageBin() {
    // Check force
    if (this.options.force) {
      // Set package bin in config
      this._config.packageBin = this.options['package-bin'];

      // Return
      return;
    }

    // Run try/catch
    try {
      // Read destination bin directory
      const files = fs.readdirSync(this.destinationPath('bin'));

      // Set package bin in config
      this._config.packageBin = this.options['package-bin'] || files.filter((file) => {
        // Return file check
        return file.match(/\.js$/);
      })[0];
    } catch (ignored) {
      // Ignored
    }
  }

  /**
   * Checks the destination directory for folders
   */
  checkPackageDirectories() {
    // Run try/catch
    try {
      // Read destination directory
      const dirs = fs.readdirSync(this.destinationRoot('.'));

      /** @type {API.IDirectories} */
      const directories = Object.create(null);

      // Map dirs
      dirs.forEach((dir) => {
        // Switch dir
        switch (dir) {
          case 'example':
          case 'examples':
            return directories.example = dir;
          case 'test':
          case 'tests':
            return directories.test = dir;
          case 'doc':
          case 'docs':
            return directories.doc = dir;
          case 'man':
            return directories.man = dir;
          case 'lib':
          case 'libs':
            return directories.lib = dir;
        }
      });

      // Check object keys
      if (Object.keys(directories).length) {
        // Set package directories in config
        this._config.packageDirectories = directories;
      }
    } catch (ignored) {
      // Ignored
    }
  }

  /**
   * Prompts for the test script to use for this NPM package
   */
  async askForPackageTest() {
    // Check force
    if (this.options.force) {
      // Set package test in config
      this._config.packageTest = this.options['package-test'];

      // Return
      return;
    }

    // Set script
    let script;

    // Run try/catch
    try {
      // Read destination node_modules directory
      const dirs = fs.readdirSync(this.destinationPath('node_modules'));

      // Check dirs
      if (dirs.indexOf('tap') !== -1) {
        // Update script
        script = 'tap test/*.js';
      } else if (dirs.indexOf('expresso') !== -1) {
        // Update script
        script = 'expresso test';
      } else if (dirs.indexOf('mocha') !== -1) {
        // Update script
        script = 'mocha';
      }
    } catch (ignored) {
      // Ignored
    }

    // Prompt for package test
    this._config.packageTest = (await this.prompt({
      type    : 'input',
      name    : 'packageTest',
      message : 'Package test command',
      default : this.options['package-test'] || script,
    })).packageTest || 'echo "Error: no test specified" && exit 1';
  }

  /**
   * Prompts for the repository of this NPM package
   */
  async askForPackageRepository() {
    // Check force
    if (this.options.force) {
      // Set package repository in config
      this._config.packageRepository = this.options['package-repository'];

      // Return
      return;
    }

    // Set repository
    let repository = this.options['package-repository'];

    // Run try/catch
    try {
      // Set gconf
      let gconf = fs.readFileSync(this.destinationPath('.git', 'config'), 'utf8');

      // Check gconf
      if (gconf) {
        // Update gconf
        gconf = gconf.split(/\r?\n/);

        // Set index
        const index = gconf.indexOf('[remote "origin"]');

        // Check index
        if (index !== -1) {
          repository = gconf[index + 1];

          // Check repository
          if (!repository.match(/^\s*url =/)) repository = gconf[index + 2];

          // Update repository
          repository = repository.match(/^\s*url =/) ? repository.replace(/^\s*url = /, '') : null;
        }
      }
    } catch (ignored) {
      // Ignored
    }

    // Check repository
    if (repository && repository.match(/^git@github.com:/)) {
      // Update repository
      repository = repository.replace(/^git@github.com:/, 'https://github.com');
    }

    // Prompt for package repository
    this._config.packageRepository = (await this.prompt({
      type    : 'input',
      name    : 'packageRepository',
      message : 'Package repository',
      default : repository,
    })).packageRepository;
  }

  /**
   * Prompts for the keywords of this NPM package
   */
  async askForPackageKeywords() {
    // Check force
    if (this.options.force) {
      // Return
      return;
    }

    // Prompt for package description
    const packageKeywords = (await this.prompt({
      type    : 'input',
      name    : 'packageKeywords',
      message : 'Package keywords',
    })).packageDescription;

    // Check package keywords
    if (packageKeywords) {
      // Set package repository in config
      this._config.packageKeywords = packageKeywords.split(/[\s,]+/);
    }
  }

  /**
   * Prompts for the author of this NPM package
   */
  async askForPackageAuthor() {
    // Check force
    if (this.options.force) {
      // Set package author in config
      this._config.packageAuthor = this.options['package-author'];

      // Return
      return;
    }

    // Prompt for package author
    this._config.packageAuthor = (await this.prompt({
      type    : 'input',
      name    : 'packageAuthor',
      message : 'Package author',
      default : this.options['package-author'],
    })).packageAuthor;
  }

  /**
   * Prompts for the license of this NPM package
   */
  async askForPackageLicense() {
    // Check force
    if (this.options.force) {
      // Set package license in config
      this._config.packageLicense = this.options['package-license'];

      // Return
      return;
    }

    // Prompt for package license
    const packageLicense = (await this.prompt({
      type    : 'input',
      name    : 'packageLicense',
      message : 'Package license',
      default : validateLicense(this.options['package-license'] || '').validForNewPackages ? this.options['package-license'] : 'ISC',
    })).packageLicense;

    // Set validation
    const validation = validateLicense(packageLicense);

    // Validate package license
    if (validation.validForNewPackages) {
      // Set package license in config
      this._config.packageLicense = packageLicense;

      // Return
      return;
    }

    // Delete from options
    delete this.options['package-license'];

    // Log error
    console.error(`Sorry, ${(validation.errors || []).concat(validation.warnings || []).join(' and ')}.`);

    // Ask for package license again
    return await this.askForPackageLicense();
  }

  /**
   * Complete NPM 'package.json' generation
   */
  end() {
    // Write package data to 'package.json' in destination directory
    fs.writeFileSync(this.destinationPath('package.json'), JSON.stringify(this._constructPackageJSON(), null, 2), 'utf8');
  }
}

/**
 * Export Eden NPM Generator class
 *
 * @type {EdenNPMGenerator}
 */
exports = module.exports = EdenNPMGenerator;
