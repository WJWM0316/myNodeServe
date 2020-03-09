var express = require('express');
var router = express.Router();
var pdf = require('./pdf')
var officegen = require('./officegen')
var parsingWord = require('./parsingWord')

router.use('/', pdf)
router.use('/', officegen)
router.use('/', parsingWord)


module.exports = router;