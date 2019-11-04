const {success, warning, error} = require('log-symbols');
const {greenBright, whiteBright, yellowBright, redBright} = require('chalk');

/**
 * 打印提示消息
 *
 * @param {String} message
 */
exports.info = message => {
    console.log(`${success} ${whiteBright(`npc-cli:info  ${message}`)}`);
};

/**
 * 打印警告消息
 *
 * @param {String} message
 */
exports.warning = message => {
    console.log(`${warning} ${yellowBright(`npc-cli:warn  ${message}`)}`);
};

/**
 * 打印错误消息
 *
 * @param {String} message
 */
exports.error = message => {
    console.log(`${error} ${redBright(`npc-cli:error  ${message}`)}`);
};

/**
 * 打印成功消息
 *
 * @param {String} message
 */
exports.success = message => {
    console.log(`${success} ${greenBright(`npc-cli:success  ${message}`)}`)
};