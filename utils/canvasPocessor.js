class canvasPocessor {
	ellipsis (ctx, text, width, x, y, color, bgObject) {
		let ellipsisWidth = ctx.measureText('...').width
		let textWidth = ctx.measureText(text).width
		let curString = ''
		let nextString = ''
		let nextPositionX = x + textWidth
		
		if (textWidth > width) {
			for(let i = 0; i < text.length; i++) {
				curString = curString + text[i]
				if (i < text.length - 1) nextString = curString + text[i+1]
				if (ctx.measureText(nextString).width >= (width - ellipsisWidth)) {
					curString = curString + '...'
					nextPositionX = x + width - ellipsisWidth + 20
					if (bgObject) nextPositionX = this.addBorder({ctx, text:curString, bgObject})
					ctx.fillStyle = color
	        ctx.fillText(curString, x, y)
	        return nextPositionX
				}
			}
		} else {
			if (bgObject) {
				nextPositionX = this.addBorder({ctx, text, bgObject})
			}
			ctx.fillStyle = color
			ctx.fillText(text, x, y)
			return nextPositionX
		}
	}
	addBorder ({ctx, text, bgObject}) {
		if (bgObject) {
			let metricsW = ctx.measureText(text).width
			if (!bgObject.x) {
				bgObject.x = (bgObject.maxWidth-(metricsW+2*bgObject.r)) / 2
			}
			ctx.beginPath()
			ctx.fillStyle = bgObject.color
	    if (bgObject.r) {
		    ctx.arc(bgObject.x + bgObject.r, bgObject.y + bgObject.r, bgObject.r, 0.5*Math.PI, 1.5*Math.PI)
		    ctx.arc(bgObject.x + metricsW + bgObject.r, bgObject.y + bgObject.r, bgObject.r, 1.5*Math.PI, 0.5*Math.PI)
	  	} else {
	  		ctx.fillRect(bgObject.x, bgObject.y, metricsW+2*bgObject.padding, bgObject.height)
	  	}
	  	if (bgObject.opacity) {
	  		ctx.globalAlpha = bgObject.opacity
	  	}
	    ctx.fill()	    	
	    return bgObject.x + metricsW + 2*bgObject.padding
	  }
	}
	lineFeed (ctx, text, width, x, y, bgUrl, bgW = 750, bgH = 90) {
		bgH = 150
		text = text.replace(/[\r\n]/g, '<newLine>')
		let textArray = text.split('<newLine>')
		let curHeight = y
		for (let j = 0; j < textArray.length; j++) {
			let item = textArray[j].trim()
			if (!item.match(/^[ ]+$/)) {
				let descString = ''
				let nextDescString = ''
				let nextDescWidth = 0
				if (ctx.measureText(item).width > width + 35) {
			    let iIndex = 0 // 最后一行的第一个字的索引
			    for (let i = 0; i < item.length - 1; i++) {
			      descString = descString + item[i]
			      nextDescString = descString + item[i+1]
			      nextDescWidth = ctx.measureText(nextDescString).width
			      if (nextDescWidth > width + 35) {
			      	if (bgUrl) ctx.drawImage(bgUrl, 0, curHeight, bgW, bgH)
			        ctx.fillText(descString, 80, curHeight - 28)
			        iIndex = i
			        descString = ''
			        curHeight += 48
			      }
			    }
			    if (iIndex !== item.length - 1) {
			    	if (bgUrl) ctx.drawImage(bgUrl, 0, curHeight, bgW, bgH)
			    	ctx.fillText(item.slice(iIndex + 1, item.length), 80, curHeight - 28)
			    }
			  } else {
			    if (bgUrl) ctx.drawImage(bgUrl, 0, curHeight, bgW, bgH)
			    ctx.fillText(item, x, curHeight - 28)
			  }
			  curHeight += 48
			  if (curHeight > 2120) {
			  	ctx.textAlign = 'center'
		    	ctx.font = 'light 28px PingFangSC-light';
		    	ctx.fillStyle = '#652791'
		    	if (bgUrl) ctx.drawImage(bgUrl, 0, curHeight, bgW, bgH)
			  	ctx.fillText('长按识别查看完整职位详情', 375, curHeight)
			  	curHeight += 40
			  	ctx.textAlign = 'left'
			  	return curHeight
			  }
			}
		}
	  return curHeight
	}
	ellipsisText (ctx, text, width) {
		let ellipsisWidth = ctx.measureText('...').width
		let textWidth = ctx.measureText(text).width
		let curString = ''
		let nextString = ''
		if (textWidth > width) {
			for(let i = 0; i < text.length; i++) {
				curString = curString + text[i]
				if (i < text.length - 1) nextString = curString + text[i+1]
				if (ctx.measureText(nextString).width >= (width - ellipsisWidth)) {
					curString = curString + '...'
					return curString
				}
			}
		} else {
			return text
		}
	}
}
module.exports = new canvasPocessor()