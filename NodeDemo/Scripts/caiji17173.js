var colors = require('colors')
  , jsdom = require('jsdom').jsdom
  , async = require('async')
  , http = require('http')
  , fs = require('fs')
  , jquery = fs.readFileSync("jquery-1.10.2.min.js", "utf-8")
  , iconv = require('../node_modules/iconv-lite');

var index = 1  // 当前抓取页
  , total = 63; // 共抓取63页

/**
 * 使用jsdom将html跟jquery组装成dom
 * @param  {[type]}   html     需要处理的html
 * @param  {Function} callback 组装成功后将html页面的$对象返回
 * @return {[type]}            [description]
 */
function makeDom(html, callback) {
    jsdom.env({
        html: html,
        src: [jquery],
        done: function (errors, window) {
            var $ = window.$;
            callback(errors, $);
            window.close();   // 释放window相关资源，否则将会占用很高的内存
        }
    });
}

/**
 * 抓取17173游戏排行榜 ：POST，http://top.17173.com/index-0-0-0-0-0-0-0.html?page=1
 * @param  {Function} callback 一个列表页处理完毕时的回调
 * @return {[type]}            [description]
 */
function crawl(callback) {
    // 构造请求信息
    var options = {
        hostname: 'top.17173.com',
        port: 80,
        path: '/index-0-0-0-0-0-0-0.html?page=' + index,
        method: 'POST'
    };

    var req = http.request(options, function (res) {
        var html = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) { html += chunk; });
        res.on('end', function () {
            parseHtml(html, callback);  // 对html做解析处理
        });
    });

    req.on('error', function (e) {
        console.log(('请求列表页失败: ' + e.message).red);
    });

    // write data to request body
    req.write('data\n');
    req.write('data\n');
    req.end();

    console.log(('开始抓取第[' + index + ']页').green);
}

/**
 * 处理请求成功后的html页面，对页面的信息使用jquery进行提取,将信息拼接为逗号分隔符的形式保存到文件
 * @param  {[type]} html [description]
 * @return {[type]}      [description]
 */
function parseHtml(html, callback) {
    makeDom(html, function (errors, $) {
        // 游戏排行列表
        var gameList = $('.ph-bd-list li');
        // 获取每一个游戏信息
        gameList.each(function () {
            var li = $(this);
            // 游戏信息，各个信息间使用逗号拼接
            var gameInfo = '';
            // 游戏排名
            gameInfo += li.find('span.ttime').text() + ',';
            // 游戏名称
            gameInfo += li.find('span.game-name a').text() + ',';
            // 热度值
            gameInfo += li.find('span.type').text() + ',';
            // 测试状态信息
            gameInfo += $.trim(li.find('span.jhm').text());
            // 输出抓取的信息
            console.log(gameInfo.white);
            // 将游戏信息保存到文本文件
            fs.appendFileSync('17173_game_rank.csv', gameInfo + '\r\n');
        });
        console.log(('第' + index + '页抓取完毕').yellow);
        // 设置抓取下一页
        index++;
        // 执行回调，通知async本次抓取结束
        callback();
    });
}

// 抓取结束的回调
function crawlEnd(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('抓取结束'.red);
    }
}

// 使用async控制抓取流程, 采用一页一页的形式抓取
async.whilst(
  function () { return index <= total; },
  crawl,
  crawlEnd
);
