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

router.get('/recruiter', async function(req, res, next) {
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
		hostType: 'zpApi', 
		method: 'GET', 
		url: `/recruiter/detail/uid/${req.query.uid}`, 
		data: req.query, 
		req,
		res,
		next
	})
	let info = data.data
  // 头像
  let avatarUrl = await loadImage(info.avatar.smallUrl)
  ctx.drawImage(avatarUrl, 290, 71, 168, 168)

  // 背景图1
  let recruiter1 = await loadImage(public + '/images/recruiter1.png')
  ctx.drawImage(recruiter1, 0, 0, 750, 515)

  // vip
  if (info.companyInfo.id) {
    let recruiter5 = await loadImage(public + '/images/recruiter5.png')
    ctx.drawImage(recruiter5, 410, 190, 46, 46)
  }

  // 个人资料
  ctx.fillStyle = '#fff'
  ctx.font = '46px PingFangSC';
  ctx.textAlign = 'center'
  ctx.fillText(info.name, 375, 259)
  ctx.font = '26px PingFangSC';
  pocessor.ellipsis(ctx, info.position, 500, 375, 324)
  ctx.font = '28px PingFangSC';
  let cutString = ''
  let ellipsisWidth = ctx.measureText('...').width
  let companyDesc = `Ta属于【${info.companyInfo.companyShortname}】星球`
  if (ctx.measureText(companyDesc).width > 466) {
    for (let i = 0; i < companyDesc.length; i++) {
      cutString = cutString + companyDesc[i]
      if (ctx.measureText(cutString).width >= 466 - ellipsisWidth) {
        cutString = cutString + '...'
        ctx.fillText(cutString, 375, 369)
        break
      }
    }
  } else {
    ctx.fillText(companyDesc, 375, 369)
  }

  let curHeight = 515

  // 开始主要内容
  let recruiter2 = await loadImage(public + '/images/recruiter2.png')
  ctx.drawImage(recruiter2, 0, curHeight, 750, 100)
  let recruiter3 = await loadImage(public + '/images/recruiter3.png')
  ctx.drawImage(recruiter3, 79, curHeight - 20, 163, 32)
  ctx.fillStyle = '#282828'
  ctx.font = '28px PingFangSC';
  ctx.textAlign = 'left'
  ctx.fillText('个人简介', 114, curHeight - 22)

  // 描述
  curHeight = curHeight + 60
  let descString = ''
  let descWidth = 0
  if (!info.brief) info.brief = '你还未填写个人简介，快去填写吧~'
  curHeight = pocessor.lineFeed(ctx, info.brief, 590, 80, curHeight, recruiter2, 750, 48)

  // 在招职位
  ctx.drawImage(recruiter2, 0, curHeight, 750, 100)
  curHeight = curHeight + 30
  ctx.drawImage(recruiter3, 79, curHeight, 163, 32)
  ctx.fillText('在招职位', 114, curHeight - 2)

  curHeight = curHeight + 70

  // 请求数据
  let positionData = await httpRequest({
    hostType: 'zpApi', 
    method: 'GET', 
    url: `/position/list`, 
    data: {recruiter: req.query.uid, count: 2, is_online: 1}, 
    req,
    res,
    next
  })
  let positionList = positionData.data
  positionList.map((item, index) => {
    positionItem(item, index)
  })

  function positionItem(item, index) {
    ctx.drawImage(recruiter2, 0, curHeight, 750, 135)
    // 职位名
    ctx.fillStyle = '#282828'
    ctx.font = '32px PingFangSC';
    ctx.textAlign = 'left'
    pocessor.ellipsis(ctx, item.positionName, 390, 80, curHeight)
    // 其他
    ctx.font = '32px PingFangSC';
    ctx.fillText(`${item.city}-${item.district} · ${item.workExperienceName} · ${item.educationName}`, 80, curHeight + 40)
    // 薪资
    ctx.fillStyle = '#FF7F4C'
    ctx.font = '36px PingFangSC';
    ctx.textAlign = 'right'
    ctx.fillText(`${item.emolumentMin}~${item.emolumentMax}K`, 670, curHeight)
    curHeight = curHeight + 102
    // 虚线
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#CED7DC'
    ctx.setLineDash([4, 6], 0)
    ctx.moveTo(80, curHeight)
    ctx.lineTo(670, curHeight)
    ctx.stroke()
    curHeight = curHeight + 20
  }

  // 请求数据
  let qrCode = await httpRequest({
    hostType: 'pubApi', 
    method: 'GET', 
    url: `/share/recruiter_share`, 
    data: {recruiterUid: req.query.uid}, 
    req,
    res,
    next
  })
  let qrCodeUrl = await loadImage(qrCode.data.positionQrCodeUrl)
  ctx.drawImage(qrCodeUrl, 77, curHeight + 193, 167, 167)
  let recruiter4 = await loadImage(public + '/images/recruiter4.png')
  ctx.drawImage(recruiter4, 0, curHeight, 750, 408)
  ctx.fillStyle = '#282828'
  ctx.font = '26px PingFangSC';
  ctx.textAlign = 'center'
  ctx.fillText('长按识别查看全部在招职位', 375, curHeight + 34)
  ctx.fillStyle = '#fff'
  ctx.font = '30px PingFangSC';
  ctx.textAlign = 'left'
  ctx.fillText('像我这么Nice的面试官', 280, curHeight + 210)
  ctx.fillText('已经不多见了！', 280, curHeight + 250)
  ctx.font = '24px PingFangSC';
  ctx.fillText(`长按识别，查看Ta的详情`, 280, curHeight + 306)
  curHeight = curHeight + 408

  const newCanvas = createCanvas(750, curHeight);
  const newCtx = newCanvas.getContext('2d');
  newCtx.putImageData(ctx.getImageData(0, 0, 750, curHeight), 0, 0)

	newCanvas.toDataURL('image/png', (err, jpeg) => {
		let data = {
			httpStatus: 200,
			data: {
				url: jpeg
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