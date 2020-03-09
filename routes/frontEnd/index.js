var express = require('express');
var router = express.Router();
var httpRequest = require('../../config/httpRequest.js')
var pocessor = require('../../utils/timePocessor.js')
var request = require('request');

// 限时抢购
router.get('/surface/rapidly', async function(req, res, next) {
	let data = await httpRequest({
		hostType: 'qzApi', 
		method: 'GET', 
		url: '/surface/rapidly', 
		data: req.query, 
		req,
		res,
		next
	})
	let getData = data.data,
			output = {
				buttons: getData.buttons,
				joinUserTotal: getData.joinUserTotal,
				toastTips: getData.toastTips,
				joinUserAvatars: [],
				items: []
			}
	getData.joinUserAvatars.forEach((item) => {
		output.joinUserAvatars.push({smallUrl: item.smallUrl})
	})
	getData.items.forEach((item) => {
		let restTime = pocessor.restTime(new Date(item.endTime).getTime())
		output.items.push(
			{
				id: item.id,
				logo: item.companyInfo.logoInfo.smallUrl,
				companyShortname: item.companyInfo.companyShortname,
				oneSentenceIntro: item.companyInfo.oneSentenceIntro,
				employeesInfo: item.companyInfo.employeesInfo,
				industry: item.companyInfo.industry,
				financingInfo: item.companyInfo.financingInfo,				
				positionName: item.positionName,
				city: item.city,
				district: item.district,
				workExperienceName: item.workExperienceName,
				educationName: item.educationName,
				applyNum: item.applyNum,
				seatsNum: item.seatsNum,
				natureApplyNum: item.natureApplyNum,
				annualSalary: item.annualSalary,
				salary: `${item.emolumentMin}~${item.emolumentMax}K`,
				numOfVisitors: item.numOfVisitors,
				endTime: item.endTime,
				day: restTime.day,
				hour: restTime.hour,
				minute: restTime.minute,
				second: restTime.second,
			})
	})
	data.data = output
	res.json(data)
});

// 近期精选
router.get('/surface/recent', async function(req, res, next) {
	let data = await httpRequest({
		hostType: 'qzApi', 
		method: 'GET', 
		url: '/surface/recent', 
		data: req.query,
		req,
		res,
		next
	})
	let getData = data.data,
			output = []
	getData.forEach((item) => {
		let restTime = pocessor.restTime(new Date(item.endTime).getTime())
		output.push(
			{
				id: item.id,
				logo: item.companyInfo.logoInfo.smallUrl,
				companyShortname: item.companyInfo.companyShortname,
				oneSentenceIntro: item.companyInfo.oneSentenceIntro,
				employeesInfo: item.companyInfo.employeesInfo,
				industry: item.companyInfo.industry,
				financingInfo: item.companyInfo.financingInfo,				
				positionName: item.positionName,
				city: item.city,
				district: item.district,
				workExperienceName: item.workExperienceName,
				educationName: item.educationName,
				applyNum: item.applyNum,
				seatsNum: item.seatsNum,
				natureApplyNum: item.natureApplyNum,
				annualSalary: item.annualSalary,
				salary: `${item.emolumentMin}~${item.emolumentMax}K`,
				numOfVisitors: item.numOfVisitors,
				endTime: item.endTime,
				day: restTime.day,
				hour: restTime.hour,
				minute: restTime.minute,
				second: restTime.second,
			})
	})
	data.data = output
	res.json(data)
});

// 急速约面城市列表
router.get('/surface/city/list', async function(req, res, next) {
	let data = await httpRequest({
		hostType: 'qzApi', 
		method: 'GET', 
		url: '/surface/city/list', 
		data: req.query, 
		req,
		res,
		next
	})
	res.json(data)
});

router.get('/getkouzhao', async function(req, res, next) {
	return
	request({
		url: 'https://mina2.hbbyun.com/HBBAPI/GetData',
		method: 'post',
		headers: {
			'Accept': '*/*',
			'Cache-Control': 'no-cache',
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36 MicroMessenger/7.0.4.501 NetType/WIFI MiniProgramEnv/Windows WindowsWechat',
			'Referer': 'https://servicewechat.com/wxb455dc8601ea1ac2/22/page-frame.html',
			'Host': 'mina2.hbbyun.com',
			'Connection': 'keep-alive',
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		form: {
			'HBBWSType': 7,
			'IsRSA': 0,
			'strAuthorizationCode': 'hbb',
			'strJsonData': '{"tableData":[{"EntID":"881350672161","UserID":"888420198324","AppID":"@AppID","Secret":"@Secret","BSN":"@BSN","UserName":"采芝林电商","UserCode":"13611468273","DtbCYTypeID":"2","VipID":"VIP350672161780142547","VipName":"WXIAN","ShopID":"889089848428","ShopName":"采芝林中药智能代煎商城","BaseID":"005058867","BaseCode":"1","BaseName":"采芝林药业有限公司","DepID":"613468883","DepName":"广州采芝林药业连锁店","SalesManID":"888420198324","SalesManCode":"13611468273","SalesManName":"采芝林电商","CustCountry":"","CustProvince":"广东省","CustCity":"广州市","CustDistrict":"天河区","CustMainAddress":"长兴街道长湴西大街42菜鸟驿站","CustZip":"","CustPhone":"13543498702","CustName":"吴生","Remark":"","Count":1,"Qua":1,"SalesAmo":15,"Amo":15,"DisAmo":0,"FeeAmo":8,"CouponAmo":0,"TotalAmo":23,"LocalSheetID":"20200304170433689123970","FollowUserID":"888420198324","SheetFile":"","AppName":"HBB_MinaMall","PosType":"3"}],"Item1":[{"GoodsID":"886452308791","GoodsCode":"0202","GoodsCoverImg":"881350672161/Goods/1581041033000_308191621.jpg","GoodsName":"【保为康】一次性防护口罩（10只装）","GoodsTypeID":"0","IsInventory":"1","Unit":"包","PUnit":"","SkuID":"887452308791","SkuCode":"0202","SkuItems":"","PSalesPrice":15,"SalesPrice":15,"PUnitPrice":15,"Price":15,"SalesAmo":15,"Amo":15,"DisAmo":0,"CostPrice":0,"Qua":1,"PQua":0,"MQua":1,"Ref":1,"ItemID":1,"SalType":"2","PromotePlanSheetID":"133759694"}]}',
			'strKeyName': 'PosSalSheet_PosSalSheetSubmit_V9_Add'
		}
	}, function (err, response, body) {
		console.log(body)
	})
});

module.exports = router;



