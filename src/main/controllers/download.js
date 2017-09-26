/**
 * 下载文件
 */
import { ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import request from 'request'

fs.exists('./downloads', exists => {
    if (!exists) {
        fs.mkdirSync('./downloads')
    }
})

global.rootPath = path.resolve('./downloads')

function downloadFile(uri, filename, callback) {
    var stream = fs.createWriteStream(filename)
    request(uri)
        .pipe(stream)
        .on('close', callback)
}

ipcMain.on('download', (event, { url, downloadPath, filename }) => {
    downloadFile(url, path.resolve(downloadPath, filename), function() {
        event.sender.send('download-success', filename)
    })
})
