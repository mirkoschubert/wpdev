'use strict';

const readlineSync = require('readline-sync');
const chalk = require('chalk');
const moment = require('moment');

class UI {

  constructor() {
    this.mode = 'normal';
  }

  mode(mode) {
    this.mode = (typeof mode !== 'undefined' && ['mute', 'normal', 'verbose'].indexOf(mode) !== -1) ? mode : 'normal';
  }

  headline(str) {
    console.log('\n' + chalk.green(str.toUpperCase()) + '\n');
  }

  message(msg, state, showTime) {

    // Check if UI Mode exists and the message has the right format
    if (typeof msg !== 'string' && typeof msg !== 'object') return;
    if (typeof msg === 'object' && typeof msg[this.mode] === 'undefined') return;

    // Check if msg is a string and turn it into an object
    if (typeof msg === 'string') msg = {
      mute: msg,
      normal: msg,
      verbose: msg
    };
    // fill in the blanks
    ['mute', 'normal', 'verbose'].forEach(mode => {
      if (typeof msg[mode] === 'undefined') msg[mode] = '';
    });

    let _state = '';
    if (state && typeof state === 'object') {
      _state = (state.code === 200) ? chalk.green('[' + state.msg + ']') : chalk.red('[' + state.msg + ']');
    } else if (state && typeof state === 'string') {
      _state = (state !== '') ? chalk.dim('[' + state.toUpperCase() + ']') : '';
    }
    const _time = (typeof showTime !== 'undefined' && showTime === false) ? '          ' : chalk.dim('[' + moment().format('HH:mm:ss') + ']');
    const _message = msg[this.mode];

    console.log(_time + ' ' + _message + ' ' + _state);
  }

  info(msg, showTime) {
    showTime = showTime || false;
    const _message = chalk.white(msg);
    const _time = (showTime) ? chalk.dim('[' + moment().format('HH:mm:ss') + '] ') : '';
    console.log(_time + _message);
  }

  error(msg, showTime) {
    showTime = showTime || false;
    const _message = chalk.red(msg);
    const _time = (showTime) ? chalk.dim('[' + moment().format('HH:mm:ss') + '] ') : '';
    console.log(_time + _message);
  }

  ask(question, defaults) {
    defaults = defaults || '';
    const message = (defaults !== '') ? chalk.white(question) + chalk.dim(" (" + defaults + ")") + chalk.white(": ") : chalk.white(question + ": ");

    let answer = readlineSync.question(message);
    if (answer === '') answer = defaults;
    return answer;
  }

  askBool(question, defaults) {
    defaults = defaults || true;
    const message = chalk.white(question) + " " + (defaults) ? chalk.dim("(Y/n)") : chalk.dim("(y/N)") + ": ";
    let answer = readlineSync(message);
    if (answer === '') answer = defaults;
    if (answer === 'y' || answer === 'Y') return true;
    if (answer === 'n' || answer === 'N') return false;
  }

}

module.exports = new UI();