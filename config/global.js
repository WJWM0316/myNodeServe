var NODE_ENV = process.env.NODE_ENV;
var GLOBALCONFIG = {
    kz      : '',
	nodeApi : "", // nodeJs 代理转发的域名
	qzApi   : "", // 求职端的域名
	zpApi   : "", // 招聘端的域名
	pubApi  : "", // pub公共端域名
	webHost : "", // h5链接
	cdnHost : "", // cdn
	bucket  : ""  // oss bucket
}		
switch (NODE_ENV) {
    case 'dev': // 测试
        GLOBALCONFIG.kz = 'https://mina2.hbbyun.com'
        GLOBALCONFIG.nodeApi = "http://192.168.5.52:3000"
        GLOBALCONFIG.qzApi   = "https://qiuzhi-api.lieduoduo.ziwork.com"
        GLOBALCONFIG.zpApi   = "https://zhaopin-api.lieduoduo.ziwork.com"
        GLOBALCONFIG.pubApi  = "https://pub-api.lieduoduo.ziwork.com"
        GLOBALCONFIG.webHost = "https://h5.lieduoduo.ziwork.com"
		GLOBALCONFIG.cdnHost = 'https://attach.lieduoduo.ziwork.com'
		GLOBALCONFIG.bucket  = 'lieduoduo-uploads-test'
        break;
    case 'pro': // 正式
        GLOBALCONFIG.nodeApi = "https://node.lieduoduo.com"
        GLOBALCONFIG.qzApi   = "https://qiuzhi-api.lieduoduo.com"
        GLOBALCONFIG.zpApi   = "https://zhaopin-api.lieduoduo.com"
        GLOBALCONFIG.pubApi  = "https://pub-api.lieduoduo.com"
        GLOBALCONFIG.webHost = "https://h5.lieduoduo.com"
    	GLOBALCONFIG.cdnHost = 'https://attach.lieduoduo.com'
    	GLOBALCONFIG.bucket  = 'lieduoduo-uploads-pro'
        break
}

module.exports = GLOBALCONFIG;