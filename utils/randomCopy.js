class randomCopy {
	agreedTxtB (res) {
		let txtList = [
			'工作易得，知音难觅，壮士约乎？',
			'我不想懂天文地理，我只想懂你~',
			'公司的进口零食得找个人清一清了',
			'我看你骨骼精奇，是块耐磨的料子',
			'好看的和能干的，都欢迎来开撩哦',
			'把握住缘分，搞不好能成为同事~',
			'我这么Nice的面试官已经不多见了！'
		]
		let random = Math.floor((Math.random()*txtList.length))
		return txtList[random]
	}
}

module.exports = new randomCopy()