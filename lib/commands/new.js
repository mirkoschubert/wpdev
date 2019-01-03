'use strict';

const chalk = require('chalk');

const ssh = require('../core/ssh.class');
const ui = require('../core/ui.class');

const home_path = '/www/htdocs/w01802b5';
const wpcli_path = '/www/htdocs/w01802b5/wp-cli/wp-cli.phar';

global.env = {};
global.env.HOME_PATH = '/www/htdocs/w01802b5';
global.env.WPCLI_PATH = '/www/htdocs/w01802b5/wp-cli/wp-cli.phar';

async function getWPCliVersion(ssh) {
  try {
    const request = await ssh.execCommand( wpcli_path + ' --version', { cwd: home_path });
    if (!request.sterr) {
      const version = request.stdout.substr(7);
      ui.message('WP-Cli Version: ' + version);
    } else {
      ui.error("It seems that WP-Cli isn't installed on your server.");
    }
  } catch (e) {
    console.error(e);
  }
}

function createStagingDomain(domain) {
  const token = require('crypto').randomBytes(8).toString('hex');  
  return 'staging-' + token + '.' + domain;
}

module.exports = async (domain) => {

  const staging_domain = createStagingDomain(domain);
  const install_dir = global.env.HOME_PATH + '/' + staging_domain;

  // TODO: Check versions and ssh config 

  ui.headline('Prerequisites');
  ui.info('Before you can install a new WordPress staging environment, you have to setup some preferences manually.');
  ui.info('Please create the new subdomain ' + chalk.yellow(staging_domain) + ' at your hosting provider!');
  ui.info('In addition, you have to create a database and hold those credentials ready.\n');

  const ready = ui.askBool('Are you ready to continue?');

  if (ready) {
    ui.headline('Configuration');
    ui.info('Please create a database for your new staging installation!\n');
    const host = ui.ask('Host', 'localhost');
    const dbname = ui.ask('Database Name');
    const dbuser = ui.ask('Database User');
    const dbpass = ui.ask('Database Password');
    const dbpref = ui.ask('Prefix', 'wp_');
    console.log(host, dbname, dbuser, dbpass, dbpref);

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