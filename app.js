var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var frontEndRoute = require('./routes/frontEnd/index.js');
// var canvasRoute = require('./routes/canvas/index.js');

var files = require('./routes/files/index.js');
var app = express();
var NODE_ENV = process.env.NODE_ENV;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 自定义跨域中间件
var allowCors = function(req, res, next) {
	if (NODE_ENV === 'pro') {
		if(req.headers.origin === "https://www.lieduoduo.com"
			|| req.headers.origin === "http://www.lieduoduo.ziwork.com"
			|| req.headers.origin === "https://h5.lieduoduo.com"
			|| req.headers.origin === "https://h5.lieduoduo.ziwork.com"
			|| req.headers.origin === "https://m.lieduoduo.com"
			|| req.headers.origin === "https://m.lieduoduo.ziwork.com"
			) {
			//设置允许跨域的域名，*代表允许任意域名跨域
			res.header("Access-Control-Allow-Origin", req.headers.origin);
		}
	} else {
		res.header("Access-Control-Allow-Origin", "*");
	}
	res.header("Access-Control-Allow-Credentials", true);
  // res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, X-Requested-With, Authorization,Authorization-Wechat,Wechat-Version,Authorization-Admin,Admin-Version,Authorization-Official,Channel-Code,Channel-Url,Act-Code,Act-Pid,Location,Notify-Appid,Authorization-App,Authorization-App-Wechat,App,App-Model,App-Version,Device-Id,App-Channel,Msg-Id,Source,Idfa-IOS");
	res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, X-Requested-With, Authorization, Wechat-Version, Admin-Version, Authorization-Admin, Authorization-Wechat, Authorization-Official, Channel-Code, Channel-Url, Act-Code, Act-Pid, Location, Notify-Appid, Authorization-App, Authorization-App-Wechat, App, App-Model, App-Version, Device-Id, App-Channel, Msg-Id, Source, Idfa-IOS, Exquisite-Code");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", 'Express');
  next()
};
app.use(allowCors)

// app.use('/frontEnd', canvasRoute);
app.use('/frontEnd', frontEndRoute);
app.use('/frontEnd', files);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
	next()
});

module.exports = app;
