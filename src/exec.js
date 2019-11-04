const {mkdir, exists} = require('fs');
const {exec} = require('child_process');

/**
 * 执行脚本
 *
 * @param {String} cmd
 * @return {Promise}
 */
exports.execAsync = cmd =>
    new Promise((resolve, reject) => {
        exec(cmd, (err, stdout) => err ? reject(err) : resolve(stdout));
    });

/**
 * 创建文件夹
 *
 * @param {String} path
 * @return {Promise}
 */
exports.mkdirAsync = path =>
    new Promise((resolve, reject) => {
        mkdir(path, (err, stdout) => err ? reject(err) : resolve(stdout));
    });

/**
 * 判断文件夹是否存在
 *
 * @param {String} path
 * @return {Promise}
 */
exports.existsAsync = path =>
    new Promise((resolve) => {
        exists(path, exists => resolve(exists));
    });