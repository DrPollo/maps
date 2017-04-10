/**
 * Created by drpollo on 10/04/2017.
 */
angular.module('firstlife.services')
    .service('ThingsService',['$q','$log','AuthService','myConfig', 'ThingsFact', function ($q, $log, AuthService, myConfig, ThingsFact){

        var config = myConfig;
        var colors = config.design.colors;
        var types = config.types.keys;
        var defIcons = config.types.icons;

        var mapName = 'mymap';

        var filters = {
            from: config.map.time_from ,
            to: config.map.time_to
        };


        return {
            get: function(id){
                var deferred = $q.defer();
                ThingsFact.get(id).then(
                    function (feature) {
                        var marker = makeMarker(feature);
                        $log.debug('get marker ',marker);
                        deferred.resolve(marker);
                    },
                    function (err) {
                        deferred.reject(err);
                    }
                );
                return deferred.promise;
            },
            bbox: function(bounds){
                var deferred = $q.defer();
                if(!bounds.northEast.lat){
                    deferred.reject('no bounds');
                    return deferred.promise;
                }

                var params = {};
                var bbox = {
                    ne_lat: bounds.northEast.lat,
                    ne_lng: bounds.northEast.lng,
                    sw_lng: bounds.southWest.lng,
                    sw_lat: bounds.southWest.lat
                };
                angular.extend(params,bbox);
                $log.debug('bbox params',params);
                ThingsFact.bbox(params).then(
                    function (features) {
                        $log.debug('got ',features.length,' features');
                        var markers = makeMarkers(features);
                        $log.debug('bbox result',Object.keys(markers).length);
                        deferred.resolve(markers);
                    },
                    function (err) {
                        deferred.reject(err);
                    }
                );


                return deferred.promise;
            },
            setFilter: function(filter){

            }
        };






        /*
         * Private functions
         * 1) makeMarkers: conversion of geojson features in markers
         * 2) makeMarker: conversion of a single feature in a marker
         * 3) checkFilters: filters check
         */


        function makeMarkers(features) {
            var markers = features.reduce(function(markers,feature){
                // if needs to be filtered
                if(!checkFilters(feature))
                    return markers;

                var marker = makeMarker(feature);
                markers[marker.id] = marker;
                return markers;
            },{});
            return markers;
        }

        function makeMarker(feature) {
            var marker = {
                focus: false,
                draggable: false,
                interactive: true,
                popupOptions : {closeOnClick:true},
                layer:'pie'
            };
            angular.extend(marker, feature.properties);
            angular.extend(marker,{id: feature.properties.id, lat: parseFloat(feature.geometry.coordinates[1]), lng : parseFloat(feature.geometry.coordinates[0])});

            // gestione icona di tipo
            var type = types[marker.entity_type];
            // icona di tipo
            var icon = angular.copy(defIcons[type.key]);
            angular.extend(marker, {icon:icon});
            $log.log('icon?', defIcons, type, defIcons[type.key]);
            // gestione icone di categoria
            var icons = {
                type : icon
            };
            var catIcons = marker.categories.reduce(function(icons, cat){
                var icon = defIcons[cat.category_space.id][cat.categories[0].id];
                icons[cat.category_space.id] = icon;
                return icons;
            },{});
            angular.extend(icons, catIcons);

            $log.log(marker);
            return marker;
        }



        function checkFilters(feature) {
            return true;
        }

    }]);