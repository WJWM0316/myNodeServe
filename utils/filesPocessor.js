var https = require('https')
class filesPocessor {
	loadImageFile (path) {
		return new Promise((resolve, rejeft) => {
			https.get(path, function(res){
		　　var chunks = []; // 用于保存网络请求不断加载传输的缓冲数据
												// 在进行网络请求时，会不断接收到数据(数据不是一次性获取到的)，
　　　　　　　　　　　　　 // node会把接收到的数据片段逐段的保存在缓冲区（Buffer），
　　　　　　　　　　　　　 // 这些数据片段会形成一个个缓冲对象（即Buffer对象），
　　　　　　　　　　　　　 // 而Buffer数据的拼接并不能像字符串那样拼接（因为一个中文字符占三个字节），
　　　　　　　　　　　　　 // 如果一个数据片段携带着一个中文的两个字节，下一个数据片段携带着最后一个字节，
　　　　　　　　　　　　　 // 直接字符串拼接会导致乱码，为避免乱码，所以将得到缓冲数据推入到chunks数组中，
　　　　　　　　　　　　　 // 利用下面的node.js内置的Buffer.concat()方法进行拼接
		　　var size = 0;　　 //保存缓冲数据的总长度
		　　res.on('data',function(chunk){
		　　　　chunks.push(chunk);　　
		　　　　size += chunk.length;
		　　});
		    res.on('end',function(err){
		　　　　var data = Buffer.concat(chunks, size); //Buffer.concat将chunks数组中的缓冲数据拼接起来，返回一个新的Buffer对象赋值给data
		　　　　var base64Img = data.toString('base64'); //将Buffer对象转换为字符串并以base64编码格式显示
					 resolve(base64Img)
		　　});
		  });
	  })
	}
}
module.exports = new filesPocessor()