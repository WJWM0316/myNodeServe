var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

var public = path.resolve('./public')
var {createCanvas, loadImage, registerFont} = require('canvas');
var Global = require("../../config/global.js"); //根据环境变量，获取对应的IP
var myUpload = require("../../api/myUpload.js");

registerFont(public + '/font/PingFangSC.ttf', { family: 'PingFangSC' })
registerFont(public + '/font/PingFangSC-bold.ttf', { family: 'PingFangSC-bold' })
registerFont(public + '/font/PingFangSC-light.ttf', { family: 'PingFangSC-light' })

var httpRequest = require('../../config/httpRequest.js')
var pocessor = require('../../utils/canvasPocessor.js')



router.get('/wantActivityPoster', async function(req, res, next) {
  const canvas = createCanvas(750, 1334);
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = "top"
  if (req.query.token) req.headers['Authorization'] = req.query.token
  if (req.headers['authorization-app']) {
    req.headers['Authorization'] = req.headers['authorization-app']
  }
  // 画背景
  let imgUrl = req.query.type === 'activity3' ? await loadImage(public + '/images/wantYou_activity3.jpg') : await loadImage(public + '/images/wantYou_activity2.jpg')
  ctx.drawImage(imgUrl, 0, 0, 750, 1334);

  let data = await httpRequest({
    hostType: 'zpApi', 
    method: 'GET', 
    url: `/cur/user_info`, 
    data: req.query, 
    req,
    res,
    next
  })
  let info = data.data || null
  console.log(info, 11)
  // 头像
  ctx.save();
  ctx.arc(287 + 87, 184 + 87, 87, 0, Math.PI * 2);
  
  ctx.clip();
  let avatarUrl = await loadImage(info.avatarInfo.smallUrl)
  ctx.drawImage(avatarUrl, 287, 184, 174, 174)
  ctx.restore()

  let p = req.query.type === 'activity3' ? `${Global.webHost}/wantYou_b?uid=${info.id}&type=platformEntry` : `${Global.webHost}/wantYou_b?uid=${info.id}`
  let knacks = req.query.type === 'activity3' ? 3 : 2
  let qrCodeData = await httpRequest({
    hostType: 'pubApi', 
    method: 'POST', 
    url: `/share/mini/program/qr/code`, 
    data: {path: 'page/common/pages/webView/webView', params: `p=${encodeURIComponent(p)}`, type: 'want_you_activity', knacks}, 
    req,
    res,
    next
  })


  ctx.arc(270 + 105, 1007 + 105,  105, 0, Math.PI * 2);
  ctx.clip();
  if (qrCodeData.data.url) {
    let qrCode = await loadImage(qrCodeData.data.url)
    ctx.drawImage(qrCode, 270, 1007, 210, 210);
  }
  
  

  canvas.toDataURL('image/png', (err, jpeg) => {
    var base64Data = jpeg.replace(/^data:image\/\w+;base64,/, "");
    let dataBuffer = Buffer.from(base64Data, 'base64');
    let path = `${public}/files/${req.query.uid}.jpg`,
       fileName = `${req.query.uid}_${new Date().getTime()}.jpg`
    fs.writeFileSync(path, dataBuffer)
    myUpload({fileName, files: path}).then(res0 => {
     let jsonData = {
       httpStatus: 200,
       data: {
         url: `${Global.cdnHost}/${res0.name}`
       }
     }
     res.json(jsonData)
    }).catch(e => {
     res.json(e)
     console.log(e, 33)
    })
      // res.render('index',{
   //      title:'study book' ,
   //      jpeg:jpeg,
   //      description:'照片墙'
   //   })
  });
})

module.exports = router;