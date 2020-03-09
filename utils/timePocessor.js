class timePocessor {
	restTime (timeStamp) { // 剩余时间戳 转化具体数据
		let restTime = (new Date(timeStamp).getTime() - new Date().getTime()) / 1000,
				day 		 = parseInt(restTime / (3600 * 24)),
				hour     = parseInt((restTime - day * 3600 * 24) / 3600),
				minute	 = parseInt((restTime - day * 3600 * 24 - hour * 3600) / 60),
				second   = parseInt(restTime - day * 3600 * 24 - hour * 3600 - minute * 60)
		if (hour < 10) hour = `0${hour}`
		if (minute < 10) minute = `0${minute}`
		if (second < 10) second = `0${second}`
		return {
			day,
			hour,
			minute,
			second
		}
	}
}
let pocessor = new timePocessor()
module.exports = pocessor