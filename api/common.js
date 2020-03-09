const OSS = require('ali-oss');
var fs = require('fs');

let store = null,
		options = null
module.exports = ossPut = function ({files, params}) {
	return new Promise((resolve, reject) => {
		if (params) {
			store = new OSS({
				//云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
				accessKeyId: params.accessKeyId,
				accessKeySecret: params.accessKeySecret,
				bucket: params.bucket,
				endpoint: params.endpoint,
				stsToken: params.stsToken
			})
			
			let callback = JSON.parse(params.callback)
			options = {
				callback: {
					// 您的回调服务器地址，如http://oss-demo.aliyuncs.com:23450或http://127.0.0.1:9090。
					url: callback.url,
					// 设置回调请求消息头中Host的值，如oss-cn-hangzhou.aliyuncs.com。
					host: callback.host,
					// 设置发起回调请求的Content-Type。
					body: callback.body,
					contentType: 'application/x-www-form-urlencoded'
				}
			}
		}
		var date  = new Date(),
				year  = date.getFullYear(),
				month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1,
				day   = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
				
		return store.put(params.fileFullPath, files, options).then(result => {
			if (fs.existsSync(files)) fs.unlinkSync(files)
			if (params.private === '1') store.putACL(params.fileFullPath, 'private');
			console.log(result)
			resolve(result)
		}).catch(err => {
			if (fs.existsSync(files)) fs.unlinkSync(files)
			console.log(err)
			reject(err)
		})
	})
}

