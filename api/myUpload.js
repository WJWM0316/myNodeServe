const OSS = require('ali-oss');
var fs = require('fs');
var Global = require("../config/global.js");

let store = null,
		params = {
			region: 'oss-cn-shenzhen',
			accessKeyId: 'LTAI4FoZC4y49VRud5TTB3sG',
			accessKeySecret: 'MCPrzFfL8ByZG4vFlgdzjuu9BQdIE1',
			bucket: Global.bucket
		}
module.exports = myUpload = function ({fileName, files}) {
	return new Promise((resolve, reject) => {
		if (params) {
			store = new OSS({
				//云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
				region: params.region,
				accessKeyId: params.accessKeyId,
				accessKeySecret: params.accessKeySecret,
				bucket: params.bucket
			})
		}
		// var date  = new Date(),
		// 		year  = date.getFullYear(),
		// 		month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1,
		// 		day   = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
		// 		
				
		let fileFullPath = `/front-assets/delicate/${fileName}`
		return store.put(fileFullPath, files).then(result => {
			console.log(result)
			if (fs.existsSync(files)) fs.unlinkSync(files)
			resolve(result)
		}).catch(err => {
			console.log(err)
			if (fs.existsSync(files)) fs.unlinkSync(files)
			reject(err)
		})
	})
}

