/**
 * Created by drpollo on 09/04/2017.
 */
/**
 * Created by drpollo on 09/04/2017.
 */
var https = require('https');
// var fse = require('fs-extra');

clean();

function clean(limit){
    console.log('start generating data');

    // var config = fse.readJsonSync('./www/config.json','utf-8');
    var bbox = [[7.577835,45.00679],[7.773339,45.140221]];


    var url = 'api.firstlife.org';
    // var url = 'api.fldev.di.unito.it';
    var domain = 1;
    var ne_lat = bbox[1][1]+0.1;
    var ne_lon = bbox[1][0]+0.1;
    var sw_lat = bbox[0][1]-0.1;
    var sw_lon = bbox[0][0]-0.1;
    var token = 'Bearer 6bbfa7990aa715ce0fb6ff66b7a808fc2c867cfe';
    // var token = 'Bearer 2687d809a260b7b50ecbaaaa0ee43de69ec07a22';



    console.log('connecting to ',url, 'with token ',token);



    //api.firstlife.org/v5/fl/Things/boundingbox?domainId=1&&ne_lat=45.01022400481446&ne_lng=7.582320570945741&sw_lat=45.00603309542355&sw_lng=7.5772565603256234&limit=6000

    var options = {
        hostname: url,
        path: '/v5/fl/Things/boundingbox?domainId='+domain+'&ne_lat='+ne_lat+'&ne_lng='+ne_lon+'&sw_lat='+sw_lat+'&sw_lng='+sw_lon+'&limit=6000',
        method: 'GET',
        headers:{
            'Content-Type':'application/json',
            'Authorization':token
        },
        agent:false
    };
    var req = https.request(options,function (res) {
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        res.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        res.on('end', function () {
            var data = JSON.parse(str).things.features;
            console.log('features to check',data.length);
            deleteData(0,data,url,token,limit)
        });
        //deleteData(0,data,url,token);
    });
    req.on('error', function(e) {
        console.error(e);
    });
    req.end();
}

function deleteData(i,data,url,token,limit){

    if(i >= data.length || limit <= 0)
        return console.log('done');

    console.log('deleting ',i,'/',data.length -1);
    var entry = data[i];
    console.log('to be delteted?', entry.properties.tags[0] === 'test');

    if(entry.properties.tags[0] !== 'test') {
        return deleteData(1 + i, data, url, token);
    }
    // console.log('entry',entry);
    var id = entry.properties.id;
    var options = {
        hostname: url,
        path: '/v5/fl/Things/'+id,
        method: 'DELETE',
        headers:{
            'Content-Type':'application/json',
            'Authorization':token
        },
        agent:false
    };
    var req = https.request(options, function (response) {
        console.log('delete id ',id,' ',response.statusCode);
        console.log('done ', i, '/', data.length - 1);
        deleteData(1+i,data,url,token,limit--);
    });
    req.on('error', function(e) {
        console.error(e);
    });
    req.end();
}