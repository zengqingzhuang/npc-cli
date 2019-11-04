const {execAsync, existsAsync} = require('./exec');
const ora = require('ora');
const logger = require('./logger');
const semver = require('semver');
const pkg = require('../package.json');

//依赖公共代码库
const comRepos = ['fe-base', 'tools', 'fe-common', 'mockup'];

const spinner = ora();

/**
 * 校验node版本和参数
 *
 * @param {Object} program
 */
const validParams = program =>
    new Promise(resolve => {
        if (program.public === undefined && program.private === undefined) {
            logger.error('public or private params must');
            process.exit(1);
        }
        if (program.codeList === undefined) {
            logger.error('code-list params must');
            process.exit(1);
        }
        if (!semver.satisfies(process.version, pkg.engines.node)) {
            logger.error('Please use nodejs 8.x version，init error！');
            process.exit(1);
        }
        resolve();
    });

/**
 * 拼接git代码地址
 *
 * @param {Object} program
 * @param {String} code
 * @return {Promise}
 */
const gitPath = (program, code) => {
    return existsAsync(`${code}`).then(exists => {
        if (exists) {
            logger.info(`# ${code} existing`);
            return;
        }
        const {user, host, port} = program;

        const codeName = comRepos.includes(code) && !code.startsWith('fe-') ? `fe-${code}` : code;
        const directory = 
            (program.private && (code === 'fe-common' || program.codeList.includes(code)))
            ? 'bce-private-console' : 'bce-console';
        const cmd = `git clone ssh://${user}@${host}:${port}/baidu/${directory}/${codeName} ${code}`
                    + ` && `
                    + `scp -p -P ${port} ${user}@${host}:hooks/commit-msg ${code}/.git/hooks/`;
        return execAsync(cmd).catch(() => process.exit(1));
    });
};

/**
 * 设置软连接
 *
 * @param {String} codeName 代码库名称
 * @return {Promise}
 */
const codeLink = codeName => {
    return existsAsync(`${codeName}`).then(exists => {
        if (!exists) {
            return;
        }
        return execAsync(`cd src && ln -s ../${codeName}/fe_source ${codeName.replace('console-', '')}`);
    });
};

/**
 * 获取依赖库git代码地址
 *
 * @param {String} message
 * @return {Array}
 */
const getGitPaths = program => comRepos.concat(program.codeList).map(code => gitPath(program, code));

/**
 * 获取需要创建软连接的分支
 *
 * @param {String} message
 * @return {Array}
 */
const getCodeLinks = program => program.codeList.map(code => codeLink(code));

module.exports = program => {
    validParams(program)
    .then(() => {
        spinner.start('Downloading code list...');
        console.log();
        return Promise.all(getGitPaths(program))
        .then(() => {
            console.log();
            logger.success(`# All dependent code library download success`);
            spinner.stop();
        });
    })
    .then(() => {
        logger.info(`# Delete dep and src`);
        return execAsync(`rm -rf dep src`);
    })
    .then(() => {
        logger.info(`# Create dep link`);
        return execAsync(`ln -s fe-base/dep dep`);
    })
    .then(() => {
        logger.info(`# Create src folder`);
        return execAsync(`mkdir src`);
    })
    .then(() => {
        logger.info(`# Create common link`);
        return execAsync(`cd src && ln -s ../fe-common common`);
    })
    .then(() => {
        logger.info(`# Create code link`);
        return Promise.all(getCodeLinks(program));
    })
    .then(() => {
        spinner.start('Start install dependencies');
        return execAsync(`cd mockup && npm install && cd ../tools && npm install`).then(() => spinner.stop());
    })
    .then(() => {
        logger.success(`# Project init success`)
        const help = `
            # Helpful hints
            # Start server
            $$ ./server.sh

            # Open browser
            $$ open https://localhost.qasandbox.bcetest.baidu.com:8899/?ed&no_xss
        `;
        logger.info(help);
        process.exit(0);
    })
};