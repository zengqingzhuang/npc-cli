const {exec} = require('child_process');
const semver = require('semver');
const inquirer = require('inquirer');
const logger = require('./logger');
const chalk = require('chalk');
const ora = require('ora');
const pkg = require('../package.json');
module.exports = () => 
    new Promise((resolve, reject) => {
        exec(`npm view ${pkg.name} version`, (err, stdout) => err ? reject(err) : resolve(stdout));
    })
    .then(latestVersion => {
        if (semver.gt(latestVersion, pkg.version)) {
            console.log(chalk.yellow('  A newer version of npc-cli is available.'));
            console.log();
            console.log('  latest:    ' + chalk.green(latestVersion));
            console.log('  installed: ' + chalk.red(pkg.version));
            console.log();
            return inquirer.prompt([
                {
                    type: 'input',
                    message: 'upgrade npc-cli? [y/n]' + '\n',
                    name: 'type',
                    default: 'y'
                }
            ]).then(answer => {
                if (answer.type === 'y') {
                    return true;
                }
                return false;
            });
        }
        logger.success(`npc-cli current version is the latest`);
    })
    .then(isUpdate => {
        if (isUpdate) {
            const spinner = ora(`Installing latest version`).start();
            exec(`npm install ${pkg.name}@latest -g`, err => {
                spinner.stop();
                if (err) {
                    return Promise.reject(err);
                }
                logger.success(`npc-cli upgraded to latest version`);
                process.exit(0);
            });
        }
    })
    .catch(err => {
        logger.error(err);
        process.exit(1);
    });