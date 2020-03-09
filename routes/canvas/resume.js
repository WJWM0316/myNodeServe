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

router.get('/resume', async function(req, res, next) {
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
		url: `/jobhunter/resume`, 
		data: req.query, 
		req,
		res,
		next
	})
	let info = data.data
  // 头像
  let avatarUrl = await loadImage(info.avatar.smallUrl)
  ctx.drawImage(avatarUrl, 306, 55, 138, 138)

  // 背景图1
  let resume1 = await loadImage(public + '/images/resume1.png')
  ctx.drawImage(resume1, 0, 0, 750, 401)
  // 个人资料
  ctx.fillStyle = '#282828'
  ctx.font = '46px PingFangSC';
  ctx.textAlign = 'center'
  ctx.fillText(info.name, 375, 219)
  // 就职信息
  let curHeight = 265
  if (info.lastCompanyName) {
    ctx.font = '26px PingFangSC';
    curHeight = curHeight + 42
    pocessor.ellipsis(ctx, `${info.lastCompanyName} | ${info.lastPosition}`, 500, 375, curHeight - 26)
  }
  // 工作状态
  let resume2 = null
  if (info.jobStatusDesc) {
    curHeight = curHeight + 28
    resume2 = await loadImage(public + '/images/resume2.png')
    ctx.drawImage(resume2, 0, curHeight, 750, 120)
    ctx.fillStyle = '#EFE9F4'
    ctx.fillRect(278, curHeight, 195, 38)
    ctx.font = '24px PingFangSC';
    ctx.fillStyle = '#652791'
    ctx.fillText(info.jobStatusDesc, 375, curHeight + 4)
  }

  // 学历标签等
  curHeight = curHeight + 60
  ctx.fillStyle = '#282828'
  ctx.font = '24px PingFangSC';
  ctx.textAlign = 'left'
  let ageDesc = ''
  if (!info.age) {
    ageDesc = '未填'
  } else {
    ageDesc = `${info.age}岁`
  }
  let workAgeWidth = ctx.measureText(info.workAgeDesc).width
  let edWidth = ctx.measureText(ageDesc).width
  let exWidth = ctx.measureText(`${info.degreeDesc}`).width
  let allWidth = workAgeWidth + edWidth + exWidth + 90 + 30 + 80
  let msgWidth = 375 - allWidth / 2
  let experienceIcon = await loadImage(public + '/images/experience.png')
  ctx.drawImage(experienceIcon, msgWidth, curHeight, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.workAgeDesc, msgWidth, curHeight + 1)
  msgWidth = msgWidth + workAgeWidth + 40
  let birthdayIcon = await loadImage(public + '/images/birthday.png')
  ctx.drawImage(birthdayIcon, msgWidth, curHeight, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(ageDesc, msgWidth, curHeight + 1)
  msgWidth = msgWidth + edWidth + 40
  let degreeIcon = await loadImage(public + '/images/degree.png')
  ctx.drawImage(degreeIcon, msgWidth, curHeight, 30, 30)
  msgWidth = msgWidth + 40
  ctx.fillText(info.degreeDesc, msgWidth, curHeight + 1)
  ctx.drawImage(resume2, 0, curHeight + 30, 750, 50)

  // 画个性标签
  if (info.personalizedLabels.length > 0) {
    curHeight = curHeight + 76
    let r = 24
    let nextLabel = true
    let position = {}
    position = {
      x: 78,
      y: curHeight
    }
    ctx.fillStyle = '#ffffff'
    ctx.font = '26px PingFangSC';
    ctx.lineWidth = 1
    ctx.drawImage(resume2, 0, curHeight, 750, 65)
    info.personalizedLabels.map((item, index) => {
      addLabel(item, index)
    })
    function addLabel(item, index) {
    // 下个标签的宽度
      let newLabelWidth = 0
      if (index < info.personalizedLabels.length-1) {
        newLabelWidth = ctx.measureText(info.personalizedLabels[index+1].labelName || info.personalizedLabels[index+1].name).width + 2*r
      }
      let metricsW = ctx.measureText(item.labelName || item.name).width // 文本宽度
      ctx.fillStyle = '#652791'
      ctx.fillText(item.labelName || item.name, position.x + r, position.y + r - 16)
      ctx.strokeStyle = '#CEC5DF'
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
      if (newLabelWidth > (750 - 78 - position.x)) {
        position.x = 78
        position.y = position.y + 2*r + 15
        curHeight = position.y
        ctx.drawImage(resume2, 0, curHeight, 750, 65)
      }
    }
  }

  // 个人简介
  let descWidth = 0
  let descString = ''
  let descIndex = 0
  curHeight = curHeight + 60
  ctx.fillStyle = '#282828'
  ctx.font = '28px PingFangSC';
  ctx.drawImage(resume2, 0, curHeight, 750, 78)
  curHeight = curHeight + 30
  if (!info.signature) info.signature = '你还未填写个性签名，说说你的想法吧~'
  curHeight = pocessor.lineFeed(ctx, info.signature, 590, 80, curHeight + 28, resume2, 750, 120)

  // 求职意向
  ctx.drawImage(resume2, 0, curHeight, 750, 100)
  curHeight = curHeight + 30
  let resume3 = await loadImage(public + '/images/resume3.png')
  ctx.drawImage(resume3, 80, curHeight, 193, 50)
  ctx.fillText('求职意向', 125, curHeight + 8)
  // 虚线
  ctx.beginPath()
  ctx.lineWidth = 1
  ctx.setLineDash([4, 6], 0)
  ctx.moveTo(291, curHeight + 25)
  ctx.lineTo(666, curHeight + 25)
  ctx.stroke()
  curHeight = curHeight + 70
  if (info.expects.length > 0) {
    info.expects.map((item, index) => {
      expectsItem(item, index)
    })
  } else {
    ctx.textAlign = 'center'
    ctx.drawImage(resume2, 0, curHeight, 750, 100)
    curHeight = curHeight + 36
    ctx.fillText('尚未完善', 375, curHeight - 28)
  }
  
  function expectsItem(item, index) {
    ctx.drawImage(resume2, 0, curHeight, 750, 150)
    let title = `${item.position} | ${item.city}`
    let nameWidth = ctx.measureText(title).width
    let nameString = ''
    let nameStringWidth = 0
    // 职位名
    ctx.textAlign = 'left'
    ctx.fillStyle = '#282828'
    ctx.font = '32px PingFangSC';
    pocessor.ellipsis(ctx, title, 390, 80, curHeight)
    // 其他
    ctx.font = '24px PingFangSC';
    let desc = ''
    item.fields.map((n, i) => {
      if (desc) {
        desc = desc + ' · ' + n.field
      } else {
        desc = n.field
      }
    })
    pocessor.ellipsis(ctx, desc, 390, 80, curHeight + 48)

    // 薪资
    ctx.font = '36px PingFangSC';
    ctx.fillStyle = '#FF7F4C'
    ctx.textAlign = 'right'
    ctx.fillText(`${item.salaryFloor}~${item.salaryCeil}K`, 670, curHeight)
    curHeight = curHeight + 102

    // 虚线
    if (index < info.expects.length - 1) {
      ctx.beginPath()
      ctx.lineWidth = 1
      ctx.strokeStyle = '#CED7DC'
      ctx.setLineDash([4, 6], 0)
      ctx.moveTo(80, curHeight)
      ctx.lineTo(670, curHeight)
      ctx.stroke()
      curHeight = curHeight + 20
    }
  }  

  curHeight = curHeight + 25


  // 工作经历
  ctx.drawImage(resume2, 0, curHeight, 750, 100)
  curHeight = curHeight + 20
  ctx.textAlign = 'left'
  ctx.fillStyle = '#282828'
  ctx.font = '28px PingFangSC';
  ctx.drawImage(resume3, 80, curHeight, 193, 50)
  ctx.fillText('工作经历', 125, curHeight + 8)
  // 虚线
  ctx.beginPath()
  ctx.lineWidth = 1
  ctx.strokeStyle = '#282828'
  ctx.setLineDash([4, 6], 0)
  ctx.moveTo(291, curHeight + 25)
  ctx.lineTo(666, curHeight + 25)
  ctx.stroke()


  curHeight = curHeight + 70
  if (info.careers.length > 0) {
    info.careers.map((item, index) => {
      careersItem(item, index)
    })
  } else {
    ctx.textAlign = 'center'
    ctx.drawImage(resume2, 0, curHeight, 750, 100)
    ctx.fillText('尚未完善', 375, curHeight + 36)
    curHeight = curHeight + 76
  }

  function careersItem(item, index) {
    ctx.drawImage(resume2, 0, curHeight, 750, 200)
    let title = `${item.company}`
    let nameWidth = ctx.measureText(title).width
    let nameString = ''
    let nameStringWidth = 0
    // 职位名
    ctx.fillStyle = '#282828'
    ctx.font = '32px PingFangSC';
    ctx.setTtextAlign = 'left'
    pocessor.ellipsis(ctx, title, 390, 80, curHeight)
    
    // 日期
    if (item.startTimeDesc) {
      ctx.textAlign = 'right'
      ctx.fillStyle = '#626262'
      ctx.font = '24px PingFangSC';
      item.startTimeDesc = item.startTimeDesc.split('-').join('.')
      item.endTimeDesc = item.endTimeDesc.split('-').join('.')
      pocessor.ellipsis(ctx, `${item.startTimeDesc}-${item.endTimeDesc}`, 390, 670, curHeight)
    }

    // 其他
    ctx.font = '28px PingFangSC';
    ctx.textAlign = 'left'
    pocessor.ellipsis(ctx, item.position, 390, 80, curHeight + 44)

    if (item.technicalLabels.length) {
      let padding = 20
      curHeight = curHeight + 105
      let teamPosition = {
        x: 80,
        y: curHeight
      }
      ctx.font = '24px PingFangSC';

      item.technicalLabels.map((item, index) => {
        addTeamLabel(item.labelName, index)
      })

      function addTeamLabel(n, j) {
        let metricsW = ctx.measureText(n).width // 当前文本宽度
        ctx.fillStyle = '#EFE9F4'
        ctx.fillRect(teamPosition.x, teamPosition.y, metricsW + 40, 42)
        ctx.fillStyle = '#652791'
        ctx.fillText(n, teamPosition.x + padding, teamPosition.y + 5)

        // 下个标签的宽度
        let newLabelWidth = 0
        if (j < item.technicalLabels.length-1) {
          newLabelWidth = ctx.measureText(item.technicalLabels[j+1].labelName).width + 2*padding
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
    }
    curHeight = curHeight + 70
    if (index < info.careers.length - 1) {
      // 虚线
      ctx.beginPath()
      ctx.lineWidth = 1
      ctx.strokeStyle = '#CED7DC'
      ctx.setLineDash([4, 6], 0)
      ctx.moveTo(80, curHeight)
      ctx.lineTo(670, curHeight)
      ctx.stroke()
    }
    curHeight = curHeight + 20
  }

  // 教育经历
  ctx.drawImage(resume2, 0, curHeight, 750, 100)
  curHeight = curHeight + 20
  ctx.textAlign = 'left'
  ctx.fillStyle = '#282828'
  ctx.font = '28px PingFangSC';
  ctx.drawImage(resume3, 80, curHeight, 193, 50)
  ctx.fillText('教育经历', 125, curHeight + 8)
  
  // 虚线
  ctx.beginPath()
  ctx.lineWidth = 1
  ctx.strokeStyle = '#282828'
  ctx.setLineDash([4, 6], 0)
  ctx.moveTo(291, curHeight + 25)
  ctx.lineTo(666, curHeight + 25)
  ctx.stroke()

  curHeight = curHeight + 80
  if (info.educations.length > 0) {
    info.educations.map((item, index) => {
      educationsItem(item, index)
    })
  } else {
    ctx.textAlign = 'center'
    ctx.drawImage(resume2, 0, curHeight, 750, 100)
    ctx.fillText('尚未完善', 375, curHeight + 2)
    curHeight = curHeight + 70
    // 虚线
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#CED7DC'
    ctx.setLineDash([4, 6], 0)
    ctx.moveTo(80, curHeight)
    ctx.lineTo(670, curHeight)
    ctx.stroke()
  }
    

  function educationsItem(item, index) {
    ctx.drawImage(resume2, 0, curHeight, 750, 150)
    let title = `${item.school}`
    let nameWidth = ctx.measureText(title).width
    let nameString = ''
    let nameStringWidth = 0
    // 职位名
    ctx.textAlign = 'left'
    ctx.fillStyle = '#282828'
    ctx.font = '32px PingFangSC';
    pocessor.ellipsis(ctx, title, 390, 80, curHeight)

    
    // 日期
    if (item.startTimeDesc) {
      ctx.textAlign = 'right'
      ctx.fillStyle = '#626262'
      ctx.font = '24px PingFangSC';
      item.startTimeDesc = item.startTimeDesc.split('-').join('.')
      item.endTimeDesc = item.endTimeDesc.split('-').join('.')
      ctx.fillText(`${item.startTimeDesc}-${item.endTimeDesc}`, 670, curHeight + 12)
    }
    

    // 专业
    if (item.degreeDesc) {
      curHeight = curHeight + 72
      ctx.textAlign = 'left'
      ctx.fillStyle = '#282828'
      ctx.font = '28px PingFangSC';
      pocessor.ellipsis(ctx, `${item.degreeDesc} · ${item.major}`, 390, 80, curHeight -28)
    }
    curHeight = curHeight + 40

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
  let qrCode = await httpRequest({
    hostType: 'pubApi', 
    method: 'GET', 
    url: `/share/resume_share`, 
    data: {resumeUid: req.query.uid}, 
    req,
    res,
    next
  })
  let qrCodeUrl = await loadImage(qrCode.data.positionQrCodeUrl)
  ctx.drawImage(qrCodeUrl, 113, curHeight + 42, 168, 168)
  let resume4 = await loadImage(public + '/images/resume4.png')
  ctx.drawImage(resume4, 0, curHeight, 750, 412)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#652791'
  ctx.font = '32px PingFangSC';
  ctx.fillText('长按查看Ta的完整简历', 311, curHeight + 118)
  
  curHeight = curHeight + 412

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