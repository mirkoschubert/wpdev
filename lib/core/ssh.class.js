'use strict';

const node_ssh = require('node-ssh');
const execa = require('execa');

class SSH {

  constructor() {
    const defaultConfig = {
      connect: {
        host: 'w01802b5.kasserver.com',
        username: 'ssh-w01802b5',
        privateKey: '/users/mirkoschubert/.ssh/id_rsa'
      },
      paths: {
        home: '/www/htdocs/w01802b5',
        wpcli: '/www/htdocs/w01802b5/wp-cli/wp-cli.phar'
      }
    }
    // TODO: config file
    this.config = defaultConfig;
    this.ssh = new node_ssh();
  }

  async connect() {
    try {
      await this.ssh.connect(this.config.connect);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  
  disconnect() {
    this.ssh.dispose();
  }

  async mkDir(dir) {
    const response = await this.ssh.execCommand('mkdir ' + dir);

    if (response.stderr) {
      this.disconnect();
      throw new Error(response.stderr);
    }
  }
  
  async exists(dir) {
    try {
      const response = await this.ssh.execCommand('ls ' + dir);
      return (!response.stderr);
    } catch (e) {
      this.disconnect();
      throw new Error(e);
    }

  }

  async isEmpty(dir) {
    try {
      const response = await this.ssh.execCommand('ls -A ' + dir);
      if (!response.stderr) {
        return (!response.stdout);
      }
    } catch (e) {
      this.disconnect();
      throw new Error(e);
    }
  }

  async checkVersions() {
    const versions = {};

    await this.connect();
    const php = await this.ssh.execCommand('php -v');
    const wpcli = await this.ssh.execCommand(this.config.paths.wpcli + ' --version');
    this.disconnect();
    const node = await execa('node', ['-v']);
    const npm = await execa('npm', ['-v']);

    versions.php = (!php.stderr) ? php.stdout : php.stderr;
    versions.wpcli = (!wpcli.stderr) ? wpcli.stdout.substr(7) : wpcli.stderr;
    versions.node = (!node.stderr) ? node.stdout.substr(2) : node.stderr;
    versions.npm = (!npm.stderr) ? npm.stdout : npm.stderr;

    return versions;
  }

}

module.exports = new SSH();