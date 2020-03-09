var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

var public = path.resolve('./public')
var {createCanvas, loadImage, registerFont} = require('canvas');
var Global = require("../../config/global.js"); //根据环境变量，获取对应的IP

registerFont(public + '/font/PingFangSC.ttf', { family: 'PingFangSC' })
registerFont(public + '/font/PingFangSC-bold.ttf', { family: 'PingFangSC-bold' })
registerFont(public + '/font/PingFangSC-light.ttf', { family: 'PingFangSC-light' })

var httpRequest = require('../../config/httpRequest.js')



router.get('/rewardList', async function(req, res, next) {
  const canvas = createCanvas(750, 1334);
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = "top"
  if (req.query.token) req.headers['Authorization'] = req.query.token
  if (req.headers['authorization-app']) {
    req.headers['Authorization'] = req.headers['authorization-app']
  }
  // 画背景
  let imgUrl = await loadImage(public + '/images/rewardList.jpg')
  ctx.drawImage(imgUrl, 0, 0, 750, 1334);

  let data = await httpRequest({
    hostType: 'pubApi', 
    method: 'POST', 
    url: `/activity/mini/program/qr/code`, 
    data: req.query, 
    req,
    res,
    next
  })
  let info = data.data || null
  console.log(data, info, 11111111111111)

  ctx.arc(284 + 87, 832 + 87,  87, 0, Math.PI * 2);
  ctx.clip();
  if (info.qrCodeUrl) {
    let qrCode = await loadImage(info.qrCodeUrl)
    ctx.drawImage(qrCode, 284, 832, 174, 174);
  }
  
  

  canvas.toDataURL('image/png', (err, jpeg) => {
  let jsonData = {
     httpStatus: 200,
     data: {
       url: jpeg
     }
   }
   res.json(jsonData)
   // res.render('index',{
   //    title:'study book' ,
   //    jpeg:jpeg,
   //    description:'照片墙'
   //  })
  })

})

module.exports = router;