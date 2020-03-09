var fs = require('fs');
var express = require('express');
var router = express.Router();
var path = require('path');
var ossPut = require('../../api/common.js');
var public = path.resolve('./public')
var httpRequest = require('../../config/httpRequest.js')
var filesPocessor = require('../../utils/filesPocessor.js')

const officegen = require('officegen')

router.post('/word', async function(req, res, next) {
	// Create an empty Word object:
	let docx = officegen({
		type: 'docx',
		pageMargins: {top: 700, bottom: 700, left: 700, right: 700}
	})

	let info  = JSON.parse(req.body.resume)
	// Officegen calling this function to report errors:
	docx.on('error', function(err) {
	  console.log(err)
	})

	let h1 = {color: '#333333', bold: true, font_size: 24},
			h2 = {color: '#333333', bold: true, font_size: 14},
			h3 = {color: '#333333', bold: true, font_size: 12},
			p1 = {color: '#282828', font_size: 10},
			c1 = {color: '#652791', bold: true, font_size: 10},
			l1 = {color: '#652791', font_size: 10}
	let addText = (text, parmas) => {
		if (!text) return
		pObj.addText(text, parmas)
	}
	// Create a new paragraph:
	let pObj = docx.createP()
	
	
	let addImage = async (files) => {
		var avatorBase64 = await filesPocessor.loadImageFile(files)
		var dataBuffer = Buffer.from(avatorBase64, 'base64');
		let path = `${public}/files/${info.name}.jpg`
		fs.writeFileSync(path, dataBuffer)
		pObj.addImage(path, {cx: 70, cy: 70})
	}
	pObj.addImage(public + '/images/wordHeader.jpg', {cx: 698, cy: 24})
	
	pObj = docx.createP()
	addText(`${info.name}`, h1)
	
	addText('                                                                    ', h1)

	await addImage(info.avatar.smallUrl)
	pObj = docx.createP()
	addText(info.lastCompanyName + '-' + info.lastPosition, h3)
	
	pObj = docx.createP()
	pObj.addImage(public + '/images/experience.jpg', {cx: 12, cy: 12})
	addText(`  ${info.workAgeDesc}    `, p1)
	pObj.addImage(public + '/images/age.jpg', {cx: 12, cy: 12})
	addText(`  ${info.age}岁    `, p1)
	pObj.addImage(public + '/images/education.jpg', {cx: 12, cy: 12})
	addText(`  ${info.degreeDesc}    `, p1)
	pObj = docx.createP()
	pObj.addImage(public + '/images/number.jpg', {cx: 12, cy: 12})
	addText(`  ${info.mobile}    `, p1)
	pObj.addImage(public + '/images/wechat.jpg', {cx: 12, cy: 12})
	addText(`  ${info.wechat}    `, p1)
	pObj = docx.createP()
	
	if (info.signature || (info.personalizedLabels && info.personalizedLabels.length)) {
		pObj = docx.createP()
		addText('自我描述', h2)
		if (info.signature) {
			pObj = docx.createP()
			addText(info.signature, p1)
		}
		if (info.personalizedLabels && info.personalizedLabels.length) {
			pObj = docx.createP()
			info.personalizedLabels.map((item, index) => {
				let labelName = ` #${item.labelName} `
				addText(labelName, l1)
				addText('   ')
			})
		}
	}

	
	if (info.expects && info.expects.length) {
		pObj = docx.createP()
		addText('求职意向', h2)
		pObj = docx.createP()
		info.expects.map((item, index) => {
			if (index > 0) return
			let desc = [],
					txt  = ''
			item.fields.map((n, i) => {desc.push(n.field)})
			desc = desc.join(' ')
			txt  = `${item.position }  |  ${ item.city }  |  ${ desc}`
			addText(txt, p1)
			addText(`     ${item.salaryFloor}-${item.salaryCeil}k`, c1)
			pObj = docx.createP()
		})
	}
	
	if (info.careers && info.careers.length) {
		pObj = docx.createP()
		addText('工作经历', h2)
		info.careers.map((item, index) => {
			pObj = docx.createP()
			let time = item.startTimeDesc ? `${item.startTimeDesc}-${item.endTimeDesc}` : `${item.endTimeDesc}`
			addText(`${time}  `, h3)
			addText(`${item.company}  |  ${item.position}`, h3)
			if (item.duty) {
				pObj = docx.createP()
				addText(item.duty, p1)
			}
			if (item.technicalLabels && item.technicalLabels.length) {
				pObj = docx.createP()
				item.technicalLabels.map((n, i) => {
					let labelName = ` #${n.labelName} `
					addText(labelName, l1)
					addText('   ')
				})
				pObj = docx.createP()
			}
		})
	}
	
	
	if (info.projects && info.projects.length) {
		pObj = docx.createP()
		addText('工作经历', h2)
		if (info.projects && info.projects.length) {
			info.projects.map((item, index) => {
				pObj = docx.createP()
				let time = item.startTimeDesc ? `${item.startTimeDesc}-${item.endTimeDesc}` : `${item.endTimeDesc}`
				addText(`${time}  `, h3)
				addText(`${item.name}  |  ${item.role}`, h3)
				if (item.description) {
					pObj = docx.createP()
					addText(item.description, p1)
				}
				pObj = docx.createP()
			})
		}
	}
	
	if (info.educations && info.educations.length) {
		pObj = docx.createP()
		addText('教育经历', h2)
		if (info.educations && info.educations.length) {
			info.educations.map((item, index) => {
				pObj = docx.createP()
				let time = item.startTimeDesc ? `${item.startTimeDesc}-${item.endTimeDesc}` : `${item.endTimeDesc}`
				addText(`${time}  `, h3)
				addText(`${item.school}  |  ${item.degreeDesc}  |  ${item.major}`, h3)
				if (item.experience) {
					pObj = docx.createP()
					addText(item.experience, p1)
				}
				pObj = docx.createP()
			})
		}
	}
	
	
	let filePath = `${public}/files/${req.body.fileName}`
	let out = fs.createWriteStream(filePath)

	
	docx.generate(out)
	
	out.on('close', function() {
	  ossPut({files: filePath, params: req.body}).then(result => {
	  	res.json({httpStatus: 200, data: result})
	  }).catch(err => {
	  	res.json({httpStatus: 400, data: err})
	  })
	})

})

module.exports = router;