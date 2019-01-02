'use strict';

const chalk = require('chalk');

const SSH = require('node-ssh');
const ssh = new SSH();

const ui = require('../core/ui.class');

const home_path = '/www/htdocs/w01802b5';
const wpcli_path = '/www/htdocs/w01802b5/wp-cli/wp-cli.phar';
var install_path = '';

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

async function mkStagingDir(ssh, domain) {

  const token = require('crypto').randomBytes(8).toString('hex');
  const stagingDomain = 'staging-' + token + '.' + domain;

  const response = await ssh.execCommand('mkdir ' + stagingDomain, { cwd: home_path });

  if (!response.stderr) {
    install_path = home_path + '/' + stagingDomain;
    ui.message(chalk.yellow(stagingDomain) + ' has been created. Please setup the same subdomain!');
  } else {
    ui.error("Something went wrong... The directory " + chalk.yellow(stagingDomain) + "hasn't been created!");
    ssh.dispose();
    exit(1);
  }
}


module.exports = async (domain) => {

  ui.headline('Configuration');
  ui.info('Please create a database for your new staging installation!\n', false);
  const host = ui.ask('Host', 'localhost');
  const dbname = ui.ask('Database Name');
  const dbuser = ui.ask('Database User');
  const dbpass = ui.ask('Database Password');
  const dbpref = ui.ask('Prefix', 'wp_');
  console.log(host, dbname, dbuser, dbpass, dbpref);

  ui.headline('Installation');

  /* try {
    await ssh.connect({
      host: 'w01802b5.kasserver.com',
      username: 'ssh-w01802b5',
      privateKey: '/users/mirkoschubert/.ssh/id_rsa'
    });
  } catch (err) {
    console.error(err);
  } */
  
  //ui.message('SSH connection established.');

  // const shell = await ssh.requestShell();

  // await getWPCliVersion(ssh);

  //await mkStagingDir(ssh, domain);

  //console.log(install_path);

  //ssh.dispose();
  ui.message('Bye!');
}