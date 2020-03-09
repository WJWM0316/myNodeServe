var express = require('express');
var router = express.Router();
var path = require('path');
var public = path.resolve('./public')
var {createCanvas, loadImage, registerFont} = require('canvas');

registerFont(public + '/font/PingFangSC.ttf', { family: 'PingFangSC' })
registerFont(public + '/font/PingFangSC-bold.ttf', { family: 'PingFangSC-bold' })
registerFont(public + '/font/PingFangSC-light.ttf', { family: 'PingFangSC-light' })

var httpRequest = require('../../config/httpRequest.js')
var pocessor = require('../../utils/canvasPocessor.js')
var randomCopy = require('../../utils/randomCopy.js')

router.get('/position', async function(req, res, next) {
	const canvas = createCanvas(750, 5000);
	const ctx = canvas.getContext('2d');
	ctx.textBaseline = "top"
  if (req.query.token) req.headers['Authorization'] = req.query.token
	if (req.headers['authorization-app']) {
		req.headers['Authorization'] = req.headers['authorization-app']
	}
	ctx.fillStyle = '#652791'
	ctx.fillRect(0, 0, 750, 5000)

	// 请求数据
	let data = await httpRequest({
		hostType: 'qzApi',
		method: 'GET', 
		url: `/position/${req.query.id}`, 
		data: req.query, 
		req,
		res,
		next
	})
	let info = data.data

  // 头像
  let avatarUrl = await loadImage(info.recruiterInfo.avatar.smallUrl)
  ctx.drawImage(avatarUrl, 80, 40, 98, 98)

  // 背景图1
  let bg1 = await loadImage(public + '/images/position1.png')
  ctx.drawImage(bg1, 0, 0, 750, 402)

  // 个人资料
  ctx.fillStyle = '#ffffff'
  ctx.font = '28px PingFangSC';
  pocessor.ellipsis(ctx, `${info.recruiterInfo.name} | ${info.recruiterInfo.position}`, 360, 212, 57)
  ctx.font = '22px PingFangSC';
  ctx.fillText(randomCopy.agreedTxtB(), 212, 97)

  // 主要内容
  ctx.textAlign = 'center'
  ctx.font = 'bold 46px PingFangSC-bold';
  pocessor.ellipsis(ctx, info.positionName, 500, 375, 244)
  ctx.fillText(`${info.emolumentMin}~${info.emolumentMax}K`, 375, 317)
  ctx.font = 'light 24px PingFangSC-light';
  ctx.textAlign = 'left'
  let cityWidth = ctx.measureText(info.city).width
  let edWidth = ctx.measureText(info.educationName).width
  let exWidth = ctx.measureText(info.workExperienceName).width
  let allWidth = cityWidth + edWidth + exWidth + 90 + 30 + 80
  let msgWidth = 375 - allWidth / 2
  let adressIcon = await loadImage(public + '/images/adress.png')
  ctx.drawImage(adressIcon, msgWidth, 404, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.city, msgWidth, 404)
  msgWidth = msgWidth + cityWidth + 40
  let experienceIcon = await loadImage(public + '/images/experience.png')
  ctx.drawImage(experienceIcon, msgWidth, 404, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.workExperienceName, msgWidth, 404)
  msgWidth = msgWidth + exWidth + 40
  let degreeIcon = await loadImage(public + '/images/degree.png')
  ctx.drawImage(degreeIcon, msgWidth, 404, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.educationName, msgWidth, 404)


  // 画笔Y坐标
  let curHeight = 483
  // 画个性标签
  let r = 24
  let nextLabel = true
  let position = {}
  position = {
    x: 59,
    y: curHeight
  }
  ctx.font = 'light 26px PingFangSC-light';
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 1
  info.lightspotInfo.map((item, index) => {
    addLabel(item, index)
  })
  function addLabel(item, index) {
    // 下个标签的宽度
    let newLabelWidth = 0
    if (index < info.lightspotInfo.length-1) {
      newLabelWidth = ctx.measureText(info.lightspotInfo[index+1]).width + 2*r
    }
    
    let metricsW = ctx.measureText(item).width // 文本宽度
    ctx.fillText(item, position.x + r, position.y + r - 18)

    ctx.beginPath()
    ctx.moveTo(position.x + r, position.y)
    ctx.lineTo(position.x + r + metricsW, position.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(position.x + r, position.y + r, r, 0.5*Math.PI, 1.5*Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(position.x + r + metricsW, position.y + 2*r)
    ctx.lineTo(position.x + r, position.y + 2*r)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(position.x + r + metricsW, position.y + r, r, 1.5*Math.PI, 0.5*Math.PI)
    ctx.stroke()
    // 下一个标签的横坐标
    position.x = position.x + 2*r + metricsW + 16
    // 判断是否需要换行
    if (newLabelWidth > (750 - 59*2 -position.x)) {
      position.x = 59
      position.y = position.y + 2*r + 15
      curHeight = position.y
    }
  }
	
	// 画公司信息
  let companyInfo = info.companyInfo
  if (info.lightspotInfo.length > 0) {
    curHeight = curHeight + 94
  }
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(88, curHeight + 34, 98, 98)

  let cWidth = 98,
  cHeight = 98,
  cX = 88,
  cY = curHeight + 34
  // // 横向长图
  // if (cWidth > cHeight) {
  //   cHeight = 98 * cHeight / cWidth
  //   cWidth = 98
  //   cX = 88
  //   cY = curHeight + 34 + ((98 - cHeight) / 2)
  // } else if (cWidth < cHeight) {
  //   cWidth = 98 * cWidth / cHeight
  //   cHeight = 98
  //   cY = curHeight + 34
  //   cX = 88 + (98 - cWidth) / 2
  // } else {
  //   cWidth = 98
  //   cHeight = 98
  //   cX = 88
  //   cY = curHeight + 34
  // }
  let companyUrl = await loadImage(info.companyInfo.logoInfo.smallUrl)
  ctx.drawImage(companyUrl, cX, cY, cWidth, cHeight)
  ctx.getImageData
  let bg2 = await loadImage(public + '/images/position2.png')
  ctx.drawImage(bg2, 38, curHeight, 674, 166)
  ctx.font = 'bold 32px PingFangSC-bold';
  let companyName = companyInfo.companyShortname
  // 需要省略号
  pocessor.ellipsis(ctx, companyName, 456, 210, curHeight + 43)
	ctx.font = 'light 26px PingFangSC-light';
  // 需要省略号
  let desc = `${companyInfo.industry} · ${companyInfo.financingInfo} · ${companyInfo.employeesInfo}`
  pocessor.ellipsis(ctx, desc, 456, 210, curHeight + 89)
    
  // 画团队描述
  curHeight = curHeight + 131
  let bg3 = await loadImage(public + '/images/position3.png')
  ctx.drawImage(bg3, 0, curHeight, 750, 174)
  curHeight = curHeight + 174
  let bg4 = await loadImage(public + '/images/position4.png')
  ctx.drawImage(bg4, 0, curHeight, 750, 180)
  // 画职位标签
  let padding = 20
  curHeight = curHeight + 30
  let teamPosition = {
    x: 80,
    y: curHeight
  }
  ctx.font = '24px PingFangSC';
  info.skillsLabel.map((item, index) => {
    addTeamLabel(item, index)
  })
  function addTeamLabel(item, index) {
    let metricsW = ctx.measureText(item.name).width // 当前文本宽度
    ctx.fillStyle = '#EFE9F4'
    ctx.fillRect(teamPosition.x, teamPosition.y, metricsW + 40, 42)
    ctx.fillStyle = '#652791'
    ctx.fillText(item.name, teamPosition.x + padding, teamPosition.y + 5)
    // 下个标签的宽度
    let newLabelWidth = 0
    if (index < info.skillsLabel.length-1) {
      newLabelWidth = ctx.measureText(info.skillsLabel[index+1].name).width + 2*padding
    }
    // 下一个标签的横坐标
    teamPosition.x = teamPosition.x + 2*padding + metricsW + 12
    // 判断是否需要换行
    if (newLabelWidth > (750 - 80 - teamPosition.x)) {
      teamPosition.x = 80
      teamPosition.y = teamPosition.y + 2*padding + 15
      curHeight = teamPosition.y
    }
  }

  let descWidth = 0
  let descString = ''
  let descIndex = 0
  
  curHeight = curHeight + 90
  ctx.font = 'light 28px PingFangSC-light';
  ctx.fillStyle = '#282828'
  if (!info.describe) info.describe = '你还未填写职位详情，快去填写吧~'
  curHeight = pocessor.lineFeed(ctx, info.describe, 570, 80, curHeight, bg4, 750, 100)
  let position6 = await loadImage(public + '/images/position6.png')
  ctx.drawImage(position6, 0, curHeight - 200, 74, 92)
  
  // 请求数据
	let qrCode = await httpRequest({
		hostType: 'pubApi', 
		method: 'GET', 
		url: `/share/position_share`, 
		data: {positionId : req.query.id, type: 'qrpl'}, 
		req,
		res,
		next
	})
	let qrCodeUrl = await loadImage(qrCode.data.positionQrCodeUrl)
  ctx.drawImage(qrCodeUrl, 75, curHeight + 88, 170, 170)
  let bg5 = await loadImage(public + '/images/position5.png')
  ctx.drawImage(bg5, 0, curHeight + 10, 750, 287)
  ctx.font = '30px PingFangSC';
  ctx.fillStyle = '#fff'
  ctx.fillText('长按打开小程序与Ta约面吧！', 276, curHeight + 130)
  ctx.font = 'light 24px PingFangSC-light';
  ctx.fillText(`Ta还有${info.recruiterInfo.positionNum}个职位在招！`, 276, curHeight + 181)
  curHeight = curHeight + 287

  const newCanvas = createCanvas(750, curHeight);
  const newCtx = newCanvas.getContext('2d');

  newCtx.putImageData(ctx.getImageData(0, 0, 750, curHeight), 0, 0)

	newCanvas.toDataURL('image/png', (err, jpeg) => {
		let data = {
			httpStatus: 200,
			data: {
				url: jpeg,
        posterData: info
			}
		}
		res.json(data)
	 	// res.render('index',{
	 	// 	 title:'study book' ,
	 	// 	 jpeg:jpeg,
	 	// 	 description:'照片墙'
	 	// })
	});
})

module.exports = router;