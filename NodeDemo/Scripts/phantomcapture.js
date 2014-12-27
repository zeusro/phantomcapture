var webpage = require('webpage'),
    page = webpage.create(),
    system = require('system'),
    fs = require('fs'),
    iconv = require('../node_modules/iconv-lite'),
    colors = require('colors');
//console.log("system.args.length:" + system.args.length);
//for (var i = 0; i < system.args.length; i++) {
//    console.log("system.args[" + i + "]:" + system.args[i]);
//}
if (system.args.length < 3) {
    console.log('arg not enough');
    exit();
}
var url = system.args[1];
var filename = system.args[2];
page.viewportSize = { width: 1024, height: 800 };
page.clipRect = { top: 0, left: 0, width: 1024, height: 800 };
page.settings = {
    javascriptEnabled: true,
    loadImages: true,
    webSecurityEnabled: false,
    userAgent: 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36 LBBROWSER'
    //要指定谷歌ua,我用火狐无法浏览
};

page.onLoadStarted = function () {
    page.startTime = new Date();
};//获取页面开始加载的时间



page.open(url, function () {
    if (status === 'fail') {
        console.log('open page fail!');
    } else {
        waitFor(function () {
            return page.evaluate(function () {
                //判断页面加载完成的信号,
                return $("a:first-child", ".goods-list-items").length > 0;
            });
        }, function () {
            //页面加载完成后我们的DOM操作,
            //引入外部js库
            page.includeJs("http://libs.baidu.com/jquery/1.9.0/jquery.js", function () {
                page.evaluate(function () { //操作页面事件
                    console.log("jQuery version:" + jQuery.fn.jquery);
                    $("a", ".goods-list-items").each(function () {
                        console.log($(this).attr("href"));
                    });
                });
                //console.log()
                var t = Date.now() - page.startTime; //页面加载完成后的当前时间减去页面开始加载的时间，为整个页面加载时间
                console.log('firstLoadPage time :' + t + 'ms');
                console.log(url + "采集结束");
                screan("result" + filename);
                exit();
            });
        });
    }
});

function exit() {
    page.close();
    setTimeout(function () {
        phantom.exit();
    }, 0);
}

function screan(a) {
    page.render('../snapshot/' + a + '.png');
}

function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function () {
            if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof (testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if (!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("waitFor(" + url.red + ") timeout");
                    screan("failresult" + filename);
                    exit();
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    //console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof (onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

page.onCallback = function (data) {
    console.log('CALLBACK: ' + JSON.stringify(data));
    // Prints 'CALLBACK: { "hello": "world" }'
};


page.onAlert = function (msg) {
    //console.log('ALERT: ' + msg);
};

var count = 0;
page.onConsoleMessage = function (msg, lineNum, sourceId) {
    //console.log('CONSOLE:' + msg);
    var re = new RegExp("[/?id=]+[0-9]{11}");
    var arr = (msg.match(re));
    if (arr != null) {
        count++;
        //console.log("第" + count + "个ID:" + msg.match(re)[0].replace("?id=", ""));
        console.log(count + ":" + msg.match(re)[0].replace("?id=", ""));
    }
};


page.onError = function (msg, trace) {
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function (t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    exit();
};
