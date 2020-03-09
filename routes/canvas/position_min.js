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

router.get('/position_min', async function(req, res, next) {
	const canvas = createCanvas(750, 1180);
	const ctx = canvas.getContext('2d');
	ctx.textBaseline = "top"
  if (req.query.token) req.headers['Authorization'] = req.query.token
	if (req.headers['authorization-app']) {
		req.headers['Authorization'] = req.headers['authorization-app']
	}
	ctx.fillStyle = '#652791'
	ctx.fillRect(0, 0, 750, 1180)

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
  ctx.drawImage(avatarUrl, 300, 131, 150, 150)
  
  // 二维码
  let qrCode = await httpRequest({
    hostType: 'pubApi', 
    method: 'GET', 
    url: `/share/position_share`, 
    data: {positionId : req.query.id, type: 'qrpe'}, 
    req,
    res,
    next
  })
  let qrCodeUrl = await loadImage(qrCode.data.positionQrCodeUrl)
  ctx.drawImage(qrCodeUrl, 289, 831, 175, 175)
  // 背景图1
  let bg1 = await loadImage(public + '/images/exPosition.png')
  ctx.drawImage(bg1, 0, 0, 750, 1180)

  // 个人资料
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = '34px PingFangSC';
  pocessor.ellipsis(ctx, `${info.recruiterInfo.name}`, 260, 375, 306)
  ctx.font = '24px PingFangSC';
  pocessor.ellipsis(ctx, `${info.recruiterInfo.companyShortname} | ${info.recruiterInfo.position}`, 550, 375, 354)
  ctx.font = '22px PingFangSC';
  ctx.fillText(randomCopy.agreedTxtB(), 375, 413)

  // 主要内容
  ctx.font = '58px PingFangSC';
  pocessor.ellipsis(ctx, info.positionName, 640, 375, 558)
  ctx.font = '50px PingFangSC';
  ctx.fillText(`${info.emolumentMin}K~${info.emolumentMax}K`, 375, 632)

  // icon
  ctx.font = '24px PingFangSC';
  ctx.textAlign = 'left'
  let cityWidth = ctx.measureText(info.city).width
  let edWidth = ctx.measureText(info.educationName).width
  let exWidth = ctx.measureText(info.workExperienceName).width
  let allWidth = cityWidth + edWidth + exWidth + 90 + 30 + 80
  let msgWidth = 375 - allWidth / 2
  let adressIcon = await loadImage(public + '/images/adress.png')
  ctx.drawImage(adressIcon, msgWidth, 714, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.city, msgWidth, 717)
  msgWidth = msgWidth + cityWidth + 40
  let experienceIcon = await loadImage(public + '/images/experience.png')
  ctx.drawImage(experienceIcon, msgWidth, 714, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.workExperienceName, msgWidth, 717)
  msgWidth = msgWidth + exWidth + 40
  let degreeIcon = await loadImage(public + '/images/degree.png')
  ctx.drawImage(degreeIcon, msgWidth, 714, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.educationName, msgWidth, 717)

  let r = 24
  ctx.textAlign = 'left'
  function addLabel(item, index) {
    let x=0, y=0
    switch(index) {
      case 0: 
        x = 270
        y = 204
        break
      case 1:
        x = 520
        y = 136
        break
      case 2: 
        x = 238
        y = 128
        break
      case 3:
        x = 494
        y = 200
        break
      case 4: 
        x = 445
        y = 64
        break
      case 5:
        x = 276
        y = 64
        break
      case 6:
        x = 212
        y = 265
        break
      case 7:
        x = 538
        y = 266
        break
    }
    let metricsW = ctx.measureText(item).width // 文本宽度
    if (index === 0 || index === 2 || index === 5 || index === 6) {
      x = x - metricsW - 2*r
    }
    ctx.strokeStyle = '#fff'
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + r + metricsW, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x + r, y + r, r, 0.5*Math.PI, 1.5*Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + r + metricsW, y + 2*r)
    ctx.lineTo(x + r, y + 2*r)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x + r + metricsW, y + r, r, 1.5*Math.PI, 0.5*Math.PI)
    ctx.stroke()
    ctx.fillText(item, x + r, y + 11)
  }
  info.lightspotInfo.map((item, index) => {
    addLabel(item, index)
  })

  ctx.textAlign = 'center'
  ctx.font = '26px PingFangSC';
  ctx.fillText('长按打开小程序查看职位详情', 375, 1024)

  if (info.recruiterInfo.recruiterTypes.length !== 0) {
    let types = ''
    info.recruiterInfo.recruiterTypes.map((item, index) => {
      if (index === 0) {
        types = item.name
      } else {
        types = `${types}、${item.name}`
      }
    })
    let string = `Ta还有${pocessor.ellipsisText(ctx, types, 275)}等${info.recruiterInfo.positionNum}个职位在招 !`
    pocessor.ellipsis(ctx, string, 554, 375, 1071, '#FFFFFF', {color: '#ffffff', r:21, y:1066, maxWidth: 750, height: 42, opacity: 0.3})
  }
	canvas.toDataURL('image/png', (err, jpeg) => {
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

router.get('/position_min/1', async function(req, res, next) {
  const canvas = createCanvas(750, 1180)
  const ctx = canvas.getContext('2d')

  const drawRoundRectBg = (ctx, x, y, width, height, radius) => {
    ctx.fillStyle = 'rgba(255,255,255,.16)'
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    ctx.lineTo(width - radius + x, y);
    ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    ctx.lineTo(width + x, height + y - radius);
    ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    ctx.lineTo(radius + x, height +y);
    ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    ctx.closePath();
    ctx.fill()
  }

  const drawTipsBg = (ctx, x, y, w, h) => {
    let offsetX = 50
    let offsetY = 10
    // ctx.globalAlpha = .6
    ctx.fillStyle = 'rgba(255,255,255,.6)'

    ctx.beginPath()
    ctx.moveTo(x + 10 + offsetX, y + 0 - offsetY)
    ctx.lineTo(x + 0 + offsetX, y + 10 - offsetY)
    ctx.lineTo(x + 10*2 + offsetX, y + 10 - offsetY)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x+w, y)
    ctx.arc(x+w,y+h/2, h/2, Math.PI / 180, Math.PI * 2)
    ctx.lineTo(x+w, y+h)
    ctx.lineTo(x, y+h)
    ctx.closePath()
    ctx.fill()
  }

  ctx.textBaseline = 'top'
  if (req.query.token) req.headers['Authorization'] = req.query.token
  if (req.headers['authorization-app']) {
    req.headers['Authorization'] = req.headers['authorization-app']
  }
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 750, 1180)

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
  ctx.drawImage(avatarUrl, 78, 623, 112, 112)
  // 二维码
  let qrCode = await httpRequest({
    hostType: 'pubApi', 
    method: 'GET', 
    url: `/share/position_share`, 
    data: {positionId : req.query.id, type: 'qrpe'}, 
    req,
    res,
    next
  })
  let qrCodeUrl = await loadImage(qrCode.data.positionQrCodeUrl)
  ctx.drawImage(qrCodeUrl, 504, 913, 172, 172)
  // 背景图1
  let bg1 = await loadImage(public + '/images/position_20190827_1.png')
  ctx.drawImage(bg1, 0, 0, 750, 1180)

  // 个人资料 
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.font = '34px PingFangSC';
  pocessor.ellipsis(ctx, `${info.recruiterInfo.name}`, 371, 224, 644)
  ctx.font = '24px PingFangSC';
  pocessor.ellipsis(ctx, `${info.recruiterInfo.companyShortname} | ${info.recruiterInfo.position}`, 421, 224, 691)
  drawTipsBg(ctx, 80, 765, ctx.measureText(randomCopy.agreedTxtB()).width + 35, 60)
  ctx.font = '24px PingFangSC';
  ctx.fillStyle = '#652791'
  ctx.fillText(randomCopy.agreedTxtB(), 104, 782)

  // 主要内容
  ctx.fillStyle = '#ffffff'
  ctx.font = '60px PingFangSC';
  ctx.textAlign = 'left'
  pocessor.ellipsis(ctx, info.positionName, 608, 78, 161)
  ctx.font = '50px PingFangSC';
  ctx.textAlign = 'left'
  ctx.fillText(`${info.emolumentMin}K~${info.emolumentMax}K`, 78, 240)

  // icon
  ctx.font = '24px PingFangSC';
  ctx.textAlign = 'left'
  let cityWidth = ctx.measureText(info.city).width
  let edWidth = ctx.measureText(info.educationName).width
  let exWidth = ctx.measureText(info.workExperienceName).width
  let msgWidth = 78

  // 工作地址
  let adressIcon = await loadImage(public + '/images/adress.png')
  ctx.drawImage(adressIcon, msgWidth, 324, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.city, msgWidth, 324)
  msgWidth = msgWidth + cityWidth + 40

  // 工作年限
  let experienceIcon = await loadImage(public + '/images/experience.png')
  ctx.drawImage(experienceIcon, msgWidth, 324, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.workExperienceName, msgWidth, 324)
  msgWidth = msgWidth + exWidth + 40

  // 学历
  let degreeIcon = await loadImage(public + '/images/degree.png')
  ctx.drawImage(degreeIcon, msgWidth, 324, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.educationName, msgWidth, 324)

  // 标签
  let labelBoxWidth = 610
  let row1 = 80
  let computedX = row1
  let row2 = row1
  let row3 = row1
  let marginRight = 18
  let padding = 40
  function addLabel(item, index) {
    ctx.textAlign = 'left'
    let x = 0, y = 0, x1 = 0, x2 = 0
    if(computedX + ctx.measureText(item).width < labelBoxWidth) {
      x = computedX
      computedX = x + ctx.measureText(item).width + padding + marginRight
      y = 387
    } else if((computedX + ctx.measureText(item).width >= labelBoxWidth) && (computedX + ctx.measureText(item).width < labelBoxWidth * 2)) {
      x = row2
      x1 = computedX
      computedX = x1 + ctx.measureText(item).width + padding + marginRight
      row2 = x + ctx.measureText(item).width + padding + marginRight
      y = 451
    } else {
      x = row3
      x2 = computedX
      computedX = x2 + ctx.measureText(item).width + padding + marginRight
      row3 = x + ctx.measureText(item).width + padding + marginRight
      y = 515
    }
    drawRoundRectBg(ctx, x, y, ctx.measureText(item).width + padding, 50, 25)
    ctx.font = '24px PingFangSC';
    ctx.fillStyle = '#fff'
    ctx.fillText(item, x + 20, y + 12)
  }
  info.lightspotInfo.map((item, index) => addLabel(item, index))

  ctx.textAlign = 'left'
  
  if(info.recruiterInfo.recruiterTypes.length) {
    ctx.font = '26px PingFangSC';
    // ctx.fillText('长按打开小程序查看职位详情', 123, 933)
    let string = 'Ta还有'
    let recruiterTypes = info.recruiterInfo.recruiterTypes.slice(0, 3)
    let curWidth = 0
    let designWidth = 400
    let string1 = ''
    let string2 = ''
    recruiterTypes.map((item, index, arr) => string += `${item.name}${index !== arr.length - 1 ? '、' : ''}`)
    string += `等${info.recruiterInfo.positionNum}个职位在招 !`
    for(let char of string) {
      curWidth += ctx.measureText(char).width
      if(curWidth < designWidth) {
        string1 += char
      } else {
        string2 += char
      }
    }
    ctx.font = '22px PingFangSC';
    ctx.fillText(string1, 123, 975)
    ctx.fillText(string2, 123, 1010)
  }
  canvas.toDataURL('image/png', (err, jpeg) => {
    // let data = {
    //  httpStatus: 200,
    //  data: {
    //    url: jpeg
    //  }
    // }
    // res.json(data)
    res.render('index',{
       title:'study book' ,
       jpeg:jpeg,
       description:'照片墙'
    })
  });
})

router.get('/position_min/2', async function(req, res, next) {
  const canvas = createCanvas(750, 1180)
  const ctx = canvas.getContext('2d')

  const drawRoundRectBg = (ctx, x, y, width, height, radius) => {
    ctx.fillStyle = 'rgba(255,255,255,.16)'
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    ctx.lineTo(width - radius + x, y);
    ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    ctx.lineTo(width + x, height + y - radius);
    ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    ctx.lineTo(radius + x, height +y);
    ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    ctx.closePath();
    ctx.fill()
  }

  const drawBg1 = (cxt, x, y, width, height, radius) => {
      cxt.fillStyle = '#fff'
      cxt.fillRect(x, y, 1, height)
      cxt.fillStyle = 'rgba(255,255,255,.06)'
      cxt.beginPath()
      cxt.arc(x, y, 0, Math.PI, Math.PI * 3 / 2)
      cxt.lineTo(width - radius + x, y)
      cxt.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2)
      cxt.lineTo(width + x, height + y - radius)
      cxt.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2)
      cxt.lineTo(radius + x, height +y)
      cxt.arc(x, height + y, 0, Math.PI * 1 / 2, Math.PI)
      cxt.closePath()
      cxt.fill()
  }

  const drawTipsBg = (ctx, x, y, w, h) => {
    let offsetX = 50
    let offsetY = 10
    // ctx.globalAlpha = .6
    ctx.fillStyle = 'rgba(255,255,255,.6)'

    ctx.beginPath()
    ctx.moveTo(x + 10 + offsetX, y + 0 - offsetY)
    ctx.lineTo(x + 0 + offsetX, y + 10 - offsetY)
    ctx.lineTo(x + 10*2 + offsetX, y + 10 - offsetY)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x+w, y)
    ctx.arc(x+w,y+h/2, h/2, Math.PI / 180, Math.PI * 2)
    ctx.lineTo(x+w, y+h)
    ctx.lineTo(x, y+h)
    ctx.closePath()
    ctx.fill()
  }

  ctx.textBaseline = 'top'
  if (req.query.token) req.headers['Authorization'] = req.query.token
  if (req.headers['authorization-app']) {
    req.headers['Authorization'] = req.headers['authorization-app']
  }
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 750, 1180)

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
  ctx.drawImage(avatarUrl, 78, 623, 112, 112)
  // 二维码
  let qrCode = await httpRequest({
    hostType: 'pubApi', 
    method: 'GET', 
    url: `/share/position_share`, 
    data: {positionId : req.query.id, type: 'qrpe'}, 
    req,
    res,
    next
  })
  let qrCodeUrl = await loadImage(qrCode.data.positionQrCodeUrl)
  ctx.drawImage(qrCodeUrl, 504, 913, 172, 172)
  // 背景图1
  let bg1 = await loadImage(public + '/images/position_20190827_1.png')
  ctx.drawImage(bg1, 0, 0, 750, 1180)

  // 个人资料 
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.font = '34px PingFangSC';
  pocessor.ellipsis(ctx, `${info.recruiterInfo.name}`, 371, 224, 644)
  ctx.font = '24px PingFangSC';
  pocessor.ellipsis(ctx, `${info.recruiterInfo.companyShortname} | ${info.recruiterInfo.position}`, 421, 224, 691)
  drawTipsBg(ctx, 80, 765, ctx.measureText(randomCopy.agreedTxtB()).width + 35, 60)
  ctx.font = '24px PingFangSC';
  ctx.fillStyle = '#652791'
  ctx.fillText(randomCopy.agreedTxtB(), 104, 782)

  // 主要内容
  ctx.fillStyle = '#ffffff'
  ctx.font = '60px PingFangSC';
  ctx.textAlign = 'left'
  pocessor.ellipsis(ctx, info.positionName, 608, 78, 161)
  ctx.font = '50px PingFangSC';
  ctx.textAlign = 'left'
  ctx.fillText(`${info.emolumentMin}K~${info.emolumentMax}K`, 78, 240)

  // icon
  ctx.font = '24px PingFangSC';
  ctx.textAlign = 'left'
  let cityWidth = ctx.measureText(info.city).width
  let edWidth = ctx.measureText(info.educationName).width
  let exWidth = ctx.measureText(info.workExperienceName).width
  let msgWidth = 78

  // 工作地址
  let adressIcon = await loadImage(public + '/images/adress.png')
  ctx.drawImage(adressIcon, msgWidth, 324, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.city, msgWidth, 324)
  msgWidth = msgWidth + cityWidth + 40

  // 工作年限
  let experienceIcon = await loadImage(public + '/images/experience.png')
  ctx.drawImage(experienceIcon, msgWidth, 324, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.workExperienceName, msgWidth, 324)
  msgWidth = msgWidth + exWidth + 40

  // 学历
  let degreeIcon = await loadImage(public + '/images/degree.png')
  ctx.drawImage(degreeIcon, msgWidth, 324, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.educationName, msgWidth, 324)

  ctx.fillStyle = '#fff'
  ctx.font = '26px PingFangSC';
  ctx.fillText('公司福利：', 133, 434)
  ctx.fillText('晋升快福利多，欢迎来撩！', 133, 477)
  drawBg1(ctx, 85, 400, 520, 146, 4)

  ctx.textAlign = 'left'
  
  if(info.recruiterInfo.recruiterTypes.length) {
    ctx.font = '26px PingFangSC';
    // ctx.fillText('长按打开小程序查看职位详情', 123, 933)
    let string = 'Ta还有'
    let recruiterTypes = info.recruiterInfo.recruiterTypes.slice(0, 3)
    let curWidth = 0
    let designWidth = 400
    let string1 = ''
    let string2 = ''
    recruiterTypes.map((item, index, arr) => string += `${item.name}${index !== arr.length - 1 ? '、' : ''}`)
    string += `等${info.recruiterInfo.positionNum - 1}个职位在招 !`
    for(let char of string) {
      curWidth += ctx.measureText(char).width
      if(curWidth < designWidth) {
        string1 += char
      } else {
        string2 += char
      }
    }
    ctx.fillStyle = '#fff'
    ctx.font = '22px PingFangSC';
    ctx.fillText(string1, 123, 975)
    ctx.fillText(string2, 123, 1010)
  }
  canvas.toDataURL('image/png', (err, jpeg) => {
    // let data = {
    //  httpStatus: 200,
    //  data: {
    //    url: jpeg
    //  }
    // }
    // res.json(data)
    res.render('index',{
       title:'study book' ,
       jpeg:jpeg,
       description:'照片墙'
    })
  });
})

router.get('/position_min/3', async function(req, res, next) {
  const canvas = createCanvas(750, 1180)
  const ctx = canvas.getContext('2d')

  const drawRoundRectBg = (ctx, x, y, width, height, radius) => {
    ctx.fillStyle = 'rgba(255,255,255,.16)'
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    ctx.lineTo(width - radius + x, y);
    ctx.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    ctx.lineTo(width + x, height + y - radius);
    ctx.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    ctx.lineTo(radius + x, height +y);
    ctx.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    ctx.closePath();
    ctx.fill()
  }

  const drawBg1 = (cxt, x, y, width, height, radius) => {
      cxt.fillStyle = '#fff'
      cxt.fillRect(x, y, 1, height)
      cxt.fillStyle = 'rgba(255,255,255,.06)'
      cxt.beginPath()
      cxt.arc(x, y, 0, Math.PI, Math.PI * 3 / 2)
      cxt.lineTo(width - radius + x, y)
      cxt.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2)
      cxt.lineTo(width + x, height + y - radius)
      cxt.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2)
      cxt.lineTo(radius + x, height +y)
      cxt.arc(x, height + y, 0, Math.PI * 1 / 2, Math.PI)
      cxt.closePath()
      cxt.fill()
  }

  const drawTipsBg = (ctx, x, y, w, h) => {
    let offsetX = 50
    let offsetY = 10
    // ctx.globalAlpha = .6
    ctx.fillStyle = 'rgba(255,255,255,.6)'

    ctx.beginPath()
    ctx.moveTo(x + 10 + offsetX, y + 0 - offsetY)
    ctx.lineTo(x + 0 + offsetX, y + 10 - offsetY)
    ctx.lineTo(x + 10*2 + offsetX, y + 10 - offsetY)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x+w, y)
    ctx.arc(x+w,y+h/2, h/2, Math.PI / 180, Math.PI * 2)
    ctx.lineTo(x+w, y+h)
    ctx.lineTo(x, y+h)
    ctx.closePath()
    ctx.fill()
  }

  const drawBg2 = (cxt, x, y, width, height, radius) => {

      cxt.fillStyle = 'rgba(249,246,252,0.39)'
      cxt.beginPath()
      cxt.moveTo(x - 10, y + 15)
      cxt.lineTo(x, y + 15)
      cxt.lineTo(x, y + 30)
      cxt.fill()

      cxt.beginPath()
      cxt.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2)
      cxt.lineTo(width - radius + x, y)
      cxt.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2)
      cxt.lineTo(width + x, height + y - radius)
      cxt.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2)
      cxt.lineTo(radius + x, height +y)
      cxt.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI)
      cxt.closePath()
      cxt.fill()
  }

  const drawBg4 = (cxt, x, y, width, height, radius,fillColor) => {
    ctx.fillStyle = fillColor
    ctx.beginPath()
    ctx.moveTo(x, y + radius)
    ctx.lineTo(x, y + height - radius)
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height)
    ctx.lineTo(x + width - radius, y + height)
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius)
    ctx.lineTo(x + width, y + radius)
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y)
    ctx.lineTo(x + radius, y)
    ctx.quadraticCurveTo(x, y, x, y + radius)
    ctx.fill()
  }

  const drawRoundRectPath = (ctx, x, y, width, height, r) => {
    ctx.strokeStyle = '#f00'
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + width, y, x + width, y + r, r)
    ctx.arcTo(x + width, y + height, x + width - r, y + height, r)
    ctx.arcTo(x, y + height, x, y + height - r, r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.stroke()
  }

  ctx.textBaseline = 'top'
  if (req.query.token) req.headers['Authorization'] = req.query.token
  if (req.headers['authorization-app']) {
    req.headers['Authorization'] = req.headers['authorization-app']
  }
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 750, 1180)

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
  ctx.drawImage(avatarUrl, 71, 66, 142, 142)
  // 二维码
  let qrCode = await httpRequest({
    hostType: 'pubApi', 
    method: 'GET', 
    url: `/share/position_share`, 
    data: {positionId : req.query.id, type: 'qrpe'}, 
    req,
    res,
    next
  })
  let qrCodeUrl = await loadImage(qrCode.data.positionQrCodeUrl)
  ctx.drawImage(qrCodeUrl, 277, 796, 196, 196)
  // 背景图1
  let bg1 = await loadImage(public + '/images/position_20190902956.png')
  ctx.drawImage(bg1, 0, 0, 750, 1180)

  // 个人资料 
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.font = '34px PingFangSC'
  pocessor.ellipsis(ctx, `${info.recruiterInfo.name}`, 371, 248, 80)
  ctx.font = '24px PingFangSC'
  pocessor.ellipsis(ctx, `${info.recruiterInfo.companyShortname} | ${info.recruiterInfo.position}`, 421, 248, 121)
  drawTipsBg(ctx, 80, 765, ctx.measureText(randomCopy.agreedTxtB()).width + 35, 60)
  ctx.font = '24px PingFangSC'
  ctx.fillStyle = '#fff'
  ctx.fillText(randomCopy.agreedTxtB(), 248, 173)
  drawBg2(ctx, 222, 160, ctx.measureText(randomCopy.agreedTxtB()).width + 35, 50, 16)

  // 职位信息
  ctx.textAlign = 'center'
  ctx.fillStyle = '#282828'
  ctx.font = '58px PingFangSC'
  pocessor.ellipsis(ctx, info.positionName, 550, 375, 374)
  ctx.font = '60px PingFangSC'
  ctx.fillStyle = '#652791'
  ctx.fillText(`${info.emolumentMin}K~${info.emolumentMax}K`, 375, 452)

  // icon
  ctx.font = '24px PingFangSC'
  ctx.textAlign = 'left'
  let cityWidth = ctx.measureText(info.city).width
  let edWidth = ctx.measureText(info.educationName).width
  let exWidth = ctx.measureText(info.workExperienceName).width
  let msgWidth = 196

  // 工作地址
  ctx.fillStyle = '#000'
  let adressIcon = await loadImage(public + '/images/adress.png')
  ctx.drawImage(adressIcon, msgWidth, 550, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.city, msgWidth, 550)
  msgWidth = msgWidth + cityWidth + 40

  // 工作年限
  let experienceIcon = await loadImage(public + '/images/experience.png')
  ctx.drawImage(experienceIcon, msgWidth, 550, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.workExperienceName, msgWidth, 550)
  msgWidth = msgWidth + exWidth + 40

  // 学历
  let degreeIcon = await loadImage(public + '/images/degree.png')
  ctx.drawImage(degreeIcon, msgWidth, 550, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.educationName, msgWidth, 550)

  // 绘制标签
  const addLabel = (item, index) => {
    if(index < 2) {
      drawRoundRectPath(ctx, 10, 615, ctx.measureText(item).width, 42, 30)
      console.log(item, 'first')
    } else if(index >= 2 && index < 5) {
      drawRoundRectPath(ctx, 10, 667, ctx.measureText(item).width, 42, 30)
      console.log(item, 'second')
    } else {
      drawRoundRectPath(ctx, 10, 719, ctx.measureText(item).width, 42, 30)
      console.log(item, 'three')
    }
  }
  info.lightspotInfo.map((item, index) => addLabel(item, index))

  // ctx.fillStyle = '#fff'
  // ctx.font = '26px PingFangSC';
  // ctx.fillText('公司福利：', 133, 434)
  // ctx.fillText('晋升快福利多，欢迎来撩！', 133, 477)
  // drawBg1(ctx, 85, 400, 520, 146, 4)

  ctx.textAlign = 'center'
  
  if(info.recruiterInfo.recruiterTypes.length) {
    ctx.font = '26px PingFangSC';
    // ctx.fillText('长按打开小程序查看职位详情', 123, 933)
    let string = 'Ta还有'
    let recruiterTypes = info.recruiterInfo.recruiterTypes.slice(0, 3)
    let curWidth = 0
    let designWidth = 400
    recruiterTypes.map((item, index, arr) => string += `${item.name}${index !== arr.length - 1 ? '、' : ''}`)
    string += `等${info.recruiterInfo.positionNum - 1}个职位在招 !`
    ctx.fillStyle = '#fff'
    ctx.font = '22px PingFangSC';
    ctx.fillText(string, 375, 1077)
    drawBg4(ctx, (750 - ctx.measureText(string).width) / 2 - 20, 1071, ctx.measureText(string).width + 40, 42, 21, 'rgba(255,255,255,0.22)')
  }
  canvas.toDataURL('image/png', (err, jpeg) => {
    // let data = {
    //  httpStatus: 200,
    //  data: {
    //    url: jpeg
    //  }
    // }
    // res.json(data)
    res.render('index',{
       title:'study book' ,
       jpeg:jpeg,
       description:'照片墙'
    })
  });
})

module.exports = router;