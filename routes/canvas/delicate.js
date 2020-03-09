var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

var public = path.resolve('./public')
var {createCanvas, loadImage} = require('canvas');
var Global = require("../../config/global.js"); //根据环境变量，获取对应的IP
var myUpload = require("../../api/myUpload.js");
var httpRequest = require('../../config/httpRequest.js')


router.get('/delicate', async function(req, res, next) {
	try {
		
	
  const canvas = createCanvas(750, 1334);
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = "top"
  if (req.query.token) req.headers['Authorization'] = req.query.token
  if (req.headers['authorization-app']) {
    req.headers['Authorization'] = req.headers['authorization-app']
  }
	
  // 画背景
  let imgUrl = await loadImage(public + '/images/delicateBg.jpg')
  ctx.drawImage(imgUrl, 0, 0, 750, 1334);

  let p = `${Global.webHost}/delicate?vkey=${req.query.vkey}&from=h5Activity`
  let qrCodeData = await httpRequest({
    hostType: 'pubApi', 
    method: 'POST', 
    url: `/share/mini/program/qr/code`, 
    data: {path: 'page/common/pages/webView/webView', params: `p=${encodeURIComponent(p)}`, type: 'exquisite_activity'}, 
    req,
    res,
    next
  })
  if (qrCodeData.data.url) {
		ctx.arc(509 + 143 / 2, 1109 + 143 / 2,  143 / 2, 0, Math.PI * 2);
		ctx.clip();
    let qrCode = await loadImage(qrCodeData.data.url)
    ctx.drawImage(qrCode, 509, 1109, 143, 143);
  }

  canvas.toDataURL('image/jpeg', (err, jpeg) => {
		let data = {
			httpStatus: 200,
			data: {
				url: jpeg
			}
		}
		res.json(data)
		
		
		// var base64Data = jpeg.replace(/^data:image\/\w+;base64,/, "");
		// let dataBuffer = Buffer.from(base64Data, 'base64');
		// let path = `${public}/files/${req.query.vkey}.jpg`,
		// 		fileName = `${req.query.vkey}_${new Date().getTime()}.jpg`
		// fs.writeFileSync(path, dataBuffer)
		// myUpload({fileName, files: path}).then(res0 => {
		// 	let jsonData = {
		// 	  httpStatus: 200,
		// 	  data: {
		// 	    url: `${Global.cdnHost}/${res0.name}`
		// 	  }
		// 	}
		// 	res.json(jsonData)
		// }).catch(e => {
		// 	res.json(e)
		// 	console.log(e, 33)
		// })
			// res.render('index',{
   //      title:'study book' ,
   //      jpeg:jpeg,
   //      description:'照片墙'
   //   })
  });
	} catch (e) {
		console.log(e, 222222222222)
	}
})

module.exports = router;