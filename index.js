'use strict';

const app = require('commander');
const chalk = require('chalk');

const cmd = require('./lib/commands');

const pkg = require('./package');

app
  .version(pkg.version)
  .description('WordPress Staging Environment');

app
  .command('new [domain]')
  .description('Creates a new staging website')
  .action(domain => {
    if (typeof domain !== 'undefined') {
      cmd.new(domain);
    } else {
      console.log('Please specify a domain!');
    }
  });

app.parse(process.argv);

if (!app.args.length) app.help();