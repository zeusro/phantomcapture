var colors = require('colors')
  , jsdom = require('jsdom').jsdom
  , async = require('async')
  , http = require('http')
  , fs = require('fs')
  , jquery = fs.readFileSync("jquery-1.10.2.min.js", "utf-8")
  , iconv = require('../node_modules/iconv-lite')
  , phantom = require('phantomjs');

// After this call all Node basic primitives will understand iconv-lite encodings.
iconv.extendNodeEncodings();

var count = 0;
console.log('主进程开启');
var startTime = new Date().getTime();
var urls = new Array(
    "http://shop100338207.m.taobao.com/#list",
    "http://shop68291879.m.taobao.com/#list",
    "http://shop115235781.m.taobao.com/#list",
    "http://shop10199638.m.taobao.com/#list",
   "http://shop67272667.m.taobao.com/#list",
     "http://shop109683760.m.taobao.com/#list",
   "http://shop33495993.m.taobao.com/#list",
    "http://shop58501945.m.taobao.com/#list",
   "http://shop62907168.m.taobao.com/#list",
  "http://shop59495864.m.taobao.com/#list",
   "http://shop60374631.m.taobao.com/#list"
    );
for (var i = 0; i < urls.length; i++) {
    console.log(("采集地址：" + urls[i]).red);
    capture(urls[i]);
}
function capture(url) {
    count++;
    var spawn = require('child_process').spawn,
    ls = spawn('phantomjs', ['phantomcapture.js', url, count]);


    ls.stdout.on('data', function (data) {
        var buf = new Buffer(data, 'win1251');
        buf.write(data, 'gbk');  
        console.log(buf.toString('gbk'));
    });   

    ls.stderr.on('data', function (data) {
        //console.log('stderr: ' + data);

    });

    ls.on('close', function (code) {
        if (code == 1) {
            console.log('child process异常结束。目标：' + url);
        }

    });

}


