'use strict';

const SSH = require('node-ssh');
const ssh = new SSH();
const ui = require('../core/ui.class');

const home_path = '/www/htdocs/w01802b5';
const wpcli_path = '/www/htdocs/w01802b5/wp-cli/wp-cli.phar';

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

async function remoteDirExists(dir) {

}

function generateStagingID() {
  
}



module.exports = async (domain) => {

  ui.message('New command with ' + domain + ' loaded!');

  try {
    await ssh.connect({
      host: 'w01802b5.kasserver.com',
      username: 'ssh-w01802b5',
      privateKey: '/users/mirkoschubert/.ssh/id_rsa'
    });
  } catch (err) {
    console.error(err);
  }
  
  ui.message('SSH connection established.');

  const shell = await ssh.requestShell();

  await getWPCliVersion(ssh);
/*   const version = await ssh.execCommand(wpcli_path + ' --version', { cwd: home_path });

  if (version.stderr === '') console.log(version.stdout);
 */
  ssh.dispose();
  ui.message('Bye!');
}