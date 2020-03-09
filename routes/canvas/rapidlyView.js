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

router.get('/rapidlyViwe', async function(req, res, next) {
	const canvas = createCanvas(750, 1300);
	const ctx = canvas.getContext('2d');
	ctx.textBaseline = "top"
	if (req.query.token) req.headers['Authorization'] = req.query.token
	if (req.headers['authorization-app']) {
		req.headers['Authorization'] = req.headers['authorization-app']
	}
	// 画背景
	
	let imgUrl = await loadImage(public + '/images/specialJobBg.png')
	ctx.drawImage(imgUrl, 0, 0, 750, 1300);

	// 请求数据
	let data = await httpRequest({
		hostType: 'qzApi', 
		method: 'GET', 
		url: '/surface/rapidly', 
		data: req.query, 
		req,
		res,
		next
	})
	let list = data.data.items,
			curY = 464,
			curX = 121
  list.forEach((item, index) => {
  	if (index > 5) return
  	if (index % 2 === 0) {
  		curX = 121
  		if (index > 0) curY += 156
  	} else {
  		curX = 409
  	}
  	ctx.font = 'bold 30px PingFangSC';
    let nextPositionX = pocessor.ellipsis(ctx, item.positionName, 220, curX, curY, "#282828") + 10
    // ctx.font = 'normal 22px PingFangSC';
    // pocessor.ellipsis(ctx, item.city, 80, nextPositionX + 5, curY + 5, '#8452A7', {x: nextPositionX, y: curY, padding: 5, height: 30, color: '#EFE9F4'})
    let txt = `${item.emolumentMin}~${item.emolumentMax}K`
    if (item.annualSalary > 12) txt = `${txt}·${item.annualSalary}薪`
    ctx.font = 'bold 32px PingFangSC';
    ctx.fillStyle = '#FF7F4C'
    ctx.fillText(txt, curX, curY + 44)
  })

	let qrcode = await httpRequest({
		hostType: 'pubApi', 
		method: 'GET', 
		url: '/share/other', 
		data: {type: 'surface_rapidly'}, 
		req,
		res,
		next
	})
	
	ctx.beginPath();
	ctx.arc(105 + 94, 1033 + 94 + 33, 94, 0, Math.PI * 2);
	ctx.clip();
	let qrcodeUrl = await loadImage(qrcode.data.positionQrCodeUrl)
	ctx.drawImage(qrcodeUrl, 106, 1033 + 36, 186, 186);

	canvas.toDataURL('image/png', (err, jpeg) => {
		let data = {
			httpStatus: 200,
			data: {
				url: jpeg
			}
		}
		res.json(data)
		// res.render('index',{
	 // 		 title:'study book' ,
	 // 		 jpeg:jpeg,
	 // 		 description:'照片墙'
	 // 	})
	});
})

module.exports = router;