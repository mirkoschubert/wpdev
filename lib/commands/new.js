'use strict';

const chalk = require('chalk');
const semver = require('semver');

const ssh = require('../core/ssh.class');
const ui = require('../core/ui.class');

const home_path = '/www/htdocs/w01802b5';
const wpcli_path = '/www/htdocs/w01802b5/wp-cli/wp-cli.phar';

global.env = {};
global.env.HOME_PATH = '/www/htdocs/w01802b5';
global.env.WPCLI_PATH = '/www/htdocs/w01802b5/wp-cli/wp-cli.phar';

function createStagingDomain(domain) {
  const token = require('crypto').randomBytes(8).toString('hex');  
  return 'staging-' + token + '.' + domain;
}

function prerequisities(stagingDomain) {
  ui.headline('Prerequisites');
  ui.info('Before you can install a new WordPress staging environment, you have to setup some preferences manually.');
  ui.info('Please create the new subdomain ' + chalk.yellow(stagingDomain) + ' at your hosting provider!');
  ui.info('In addition, you have to create a database and hold those credentials ready.\n');

  return ui.askBool('Are you ready to continue?');
}

function configuration() {
  let wpConfig = {};

  ui.headline('Configuration');
  ui.info('Please create a database for your new staging installation!\n');
  wpConfig.dbhost = ui.ask('Host', 'localhost');
  wpConfig.dbname = ui.ask('Database Name');
  wpConfig.dbuser = ui.ask('Database User');
  wpConfig.dbpass = ui.ask('Database Password');
  wpConfig.dbpref = ui.ask('Prefix', 'wp_');

  return wpConfig;
}

module.exports = async (domain) => {

  const staging_domain = createStagingDomain(domain);
  const install_dir = home_path + '/' + staging_domain;

  // Ceck versions
  const versions = await ssh.checkVersions();
  //console.log(versions);
  if (!semver.satisfies(versions.php, '>= 7.2')) {
    ui.info('\n' + chalk.red('Warning') + ': WordPress works best with PHP version 7.2! You only have version ' + chalk.yellow(versions.php) + ' installed.');
  }
  if (!semver.satisfies(versions.wpcli, '>= 2')) {
    ui.error('Please update your WP-Cli installation to at least 2.0!');
    process.exit(1);
  }


  if (prerequisities(staging_domain)) {

    const wpConfig = configuration();
    console.log(wpConfig);

    ui.headline('Installation');

    const connected = await ssh.connect();

    if (connected) {
      ui.message('SSH connection established.', 200);

      const exists = await ssh.exists(install_dir);

      if (!exists) {
        try {
          await ssh.mkDir(install_dir);
        } catch (e) {
          console.error(e);
        }
        ui.message(chalk.yellow(install_dir) + ' has been created.');
      } else {
        ui.error('Staging directory already exists! We try it anyway...');
        const empty = await ssh.isEmpty(install_dir);
        if (!empty) {
          ui.error('Staging directory is not empty. Please check the path and try again!');
          ssh.disconnect();
          exit(1);
        }
      }

      ssh.disconnect();
      ui.message('SSH connection closed.', 200);
    } else {
      ui.error('SSH connection failed!');
    }

    

  }

  

  // const shell = await ssh.requestShell();

  // await getWPCliVersion(ssh);
}