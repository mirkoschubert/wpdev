'use strict';

const node_ssh = require('node-ssh');

class SSH {

  constructor() {
    const defaultConfig = {
      connect: {
        host: 'w01802b5.kasserver.com',
        username: 'ssh-w01802b5',
        privateKey: '/users/mirkoschubert/.ssh/id_rsa'
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
      throw Error(response.stderr);
    }
  }
  
  async exists(dir) {

  }

  async isEmpty(dir) {

  }

}

module.exports = new SSH();