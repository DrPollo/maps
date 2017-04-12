/**
 * Created by drpollo on 09/04/2017.
 */
var https = require('https');
// var fse = require('fs-extra');

generate();

function generate(){
    console.log('start generating data');

    // var config = fse.readJsonSync('./www/config.json','utf-8');

    var url = 'api.fldev.di.unito.it';
    // var url = 'api.fldev.di.unito.it';

    var token = 'Bearer f60206550bf0c66051c1620ae643e8867de7b426';
    // var token = 'Bearer 2687d809a260b7b50ecbaaaa0ee43de69ec07a22';

    console.log('connecting to ',url, 'with token ',token);

    var ratio = 125;
    //westlimit=7.577835; southlimit=45.00679; eastlimit=7.773339; northlimit=45.140221
    var bbox = [[7.577835,45.00679],[7.773339,45.140221]];
    var deltas = [
        (bbox[1][0]-bbox[0][0])/ratio,
        (bbox[1][1]-bbox[0][1])/ratio
    ];
    // console.log('deltas',deltas);
    var entry = JSON.parse('{"type":"Feature","properties":{"name":"News","valid_from":"2017-04-12T12:00:54.052Z","valid_to":"2017-04-12T21:59:59.999Z","link_url":null,"tags":["test"],"categories":[{"category_space":{"id":14},"categories":[{"id":-100}]},{"category_space":{"id":16},"categories":[{"id":-120}]},{"category_space":{"id":36},"categories":[{"id":-595}]}],"group_id":null,"user":"58e6433f4f1805d53fcd365d","id_wp":1,"id":null,"zoom_level":15,"level":null,"description":null,"location":null,"duration":0,"door_time":null,"parent_id":null,"attendees":[],"performer":-1,"organizer":-1,"entity_type":"FL_EVENTS","domain_id":1,"coordinates":[7.682232856750489,45.06586763568982]},"geometry":{"type":"Point","coordinates":[7.682232856750489,45.06586763568982]}}');
// return
    var ancor = bbox[0];
    pushdata(0,ratio,ancor,entry,deltas,url,token);

}

function pushdata(i,ratio,ancor,entry,deltas,url,token){
    var size = ratio * ratio;

    var row = i % ratio;
    var col = Math.floor(i) / ratio;

    if(i >= size)
        return console.log('done');

    console.log('pushing ',entry.properties.entity_type,i,'/',size);
    var tmp = Object.assign(entry);
    tmp.geometry.coordinates = [ancor[0] + ( col * deltas[0] ) + (Math.random() * 0.01), ancor[1] + ( row * deltas[1]) + (Math.random() * 0.01) ];
    tmp.properties.name = 'test '+i;


    // console.log(JSON.stringify(tmp));

    var options = {
        hostname: url,
        path: '/v5/fl/Things',
        method: 'POST',
        headers:{
            'Content-Type':'application/json',
            'Authorization':token
        },
        agent:false
    };
    // console.log(options);
    var req = https.request(options, function (response) {
        console.log('res ',response.statusCode);
        if( response.statusCode !== 200){
            return console.error('ENDED cause error',response.statusCode);
        }
        console.log('done ', i, '/', size);
        pushdata(1+i,ratio,ancor,entry,deltas,url,token);
    });
    req.on('error', function(e) {
            console.error(e);
    });
    req.write(JSON.stringify(tmp))
    req.end();
}