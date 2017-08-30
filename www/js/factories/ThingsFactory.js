angular.module('firstlife.factories')
    .factory('ThingsFact', ['$q', '$http', '$log', 'AuthService', 'myConfig', function ($q, $http, $log, AuthService, myConfig) {

        var config = myConfig;
        var format = myConfig.format;
        var urlThings = myConfig.backend_things;
        var urlBbox = myConfig.backend_bbox;
        var urlTile = myConfig.backend_tilesearch;
        var fields = 'fields=valid_from,valid_to,categories,geometry,name,id,tags';
        var domains = self.config.read_domains ? [self.config.domain_id].concat(self.config.read_domains).join(',') : self.config.domain_id;
        var limit = 99999;

        return {
            get: function (id) {
                var deferred = $q.defer();

                var urlId = urlThings.concat('/').concat(id).concat(format);

                var req = {
                    url: urlId,
                    method: 'GET',
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("get Thing ", response);
                        deferred.resolve(response.data);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            create: function (thing) {
                var deferred = $q.defer();

                var urlId = urlThings.concat(format);

                var req = {
                    url: urlId,
                    method: 'POST',
                    data: thing
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("post Thing ", response);
                        deferred.resolve(response.data);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            update: function (id, thing) {
                var deferred = $q.defer();

                var urlId = urlThings.concat('/').concat(id).concat(format);

                var req = {
                    url: urlId,
                    method: 'PUT',
                    data: thing
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("update Thing ", response);
                        deferred.resolve(response.data);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            remove: function (id) {
                var deferred = $q.defer();

                var urlId = urlThings.concat('/').concat(id).concat(format);

                var req = {
                    url: urlId,
                    method: 'DELETE',
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("delete Thing ", response);
                        deferred.resolve(response.data);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            report: function (report) {
                var urlId = myConfig.report_thing;
                var req = {
                    url: urlId,
                    method: 'POST',
                    data: report
                };
                return $http(req);
            },
            claim: function (thingId, claim) {
                var urlId = myConfig.backend_things.concat('/', thingId, '/claims');
                var req = {
                    url: urlId,
                    method: 'POST',
                    data: claim
                };
                return $http(req);
            },
            bbox: function (params) {
                var deferred = $q.defer();
                // costruisco i parametri
                var p = Object.keys(params).reduce(function (list, key) {
                    list.push(key + '=' + params[key]);
                    return list;
                }, []);
                var urlId = urlBbox.concat(format, '?domainId=', domains, '&limit=', limit, '&', fields, '&', p.join('&'));

                var req = {
                    url: urlId,
                    method: 'GET',
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("bbox response", response);
                        deferred.resolve(response.data.things.features);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            tile: function (params) {
                var deferred = $q.defer();
                // controllo i parametri
                if (!params.z || !params.y, !params.x) {
                    deferred.reject('no tile param');
                    return deferred.promise;
                }

                var urlId = urlTile.concat(format, '?domainId=', domains, '&limit=', limit, '&tiles=', params.tile);
                if (params.from)
                    urlId = urlId.concat('&from=', params.from);
                if (params.to)
                    urlId = urlId.concat('&to=', params.to);
                var req = {
                    url: urlId,
                    method: 'GET',
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        // $log.log("tile response",params.z,'/',params.x,'/',params.y, response.data.things.features.length);
                        deferred.resolve(response.data.things.features);
                    },
                    function (err) {
                        // $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            tiles: function (params) {
                var deferred = $q.defer();
                // controllo i parametri
                if (!params || !params.tiles || params.tiles.length < 1) {
                    deferred.reject('no tiles to check');
                    return deferred.promise;
                }
                // $log.debug('tiles',params);
                // var urlId = urlTile.concat('?format=pbf', '&domainId=', domains, '&limit=', limit, '&tiles=', params.tiles.join(','));
                var urlId = urlTile.concat(format,'?domainId=',domains,'&limit=',limit,'&tiles=',params.tiles.join(','));
                if (params.time.from)
                    urlId = urlId.concat('&from=', params.time.from);
                if (params.time.to)
                    urlId = urlId.concat('&to=', params.time.to);

                // $log.debug('tiles url',urlId);
                var req = {
                    url: urlId,
                    method: 'GET',
                    // responseType: 'arraybuffer',
                    // transformResponse: function (data, headersGetter, status) {
                    //     // $log.debug(data,new PBF(data));
                    //     try {
                    //         var type = headersGetter("Content-Type");
                    //         if (type && type.startsWith("application/json")) {
                    //             return data;
                    //         }
                    //         return geobuf.decode(new PBF(data));
                    //     } catch (e) {
                    //         $log.error(e);
                    //         // throw Error(e);
                    //     }
                    // },
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        // $log.debug("tiles response",response);
                        // deferred.resolve(response.data.features);
                        deferred.resolve(response.data.things.features);
                    },
                    function (err) {
                        // $log.error(err);
                        deferred.reject(err);
                    }
                );

                return deferred.promise;
            },
            children: function (id, relation) {
                var deferred = $q.defer();

                var urlId = urlThings.concat('/', id, '/', relation).concat(format);

                var req = {
                    url: urlId,
                    method: 'GET',
                    data: {}
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("get Thing children ", response);
                        // todo togli il bugfix
                        deferred.resolve(response.data.data ? response.data.data.features : response.data.features);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );
                return deferred.promise;
            },
            addTags: function (id, tags) {
                var deferred = $q.defer();

                var urlId = urlThings.concat('/', id, '/addTags').concat(format);

                var req = {
                    url: urlId,
                    method: 'PUT',
                    data: {tags: tags}
                };
                $http(req).then(
                    function (response) {
                        //$log.debug("add tags to Thing ",tags, response);
                        deferred.resolve(response.data.data);
                    },
                    function (err) {
                        $log.error(err);
                        deferred.reject(err);
                    }
                );
                return deferred.promise;
            }
        }


        var keys, values, lengths, dim, e;

        var geometryTypes = [
            'Point', 'MultiPoint', 'LineString', 'MultiLineString',
            'Polygon', 'MultiPolygon', 'GeometryCollection'];

        function decode(pbf) {
            dim = 2;
            e = Math.pow(10, 6);
            lengths = null;

            keys = [];
            values = [];
            var obj = pbf.readFields(readDataField, {});
            keys = null;

            return obj;
        }

        function readDataField(tag, obj, pbf) {
            if (tag === 1) keys.push(pbf.readString());
            else if (tag === 2) dim = pbf.readVarint();
            else if (tag === 3) e = Math.pow(10, pbf.readVarint());

            else if (tag === 4) readFeatureCollection(pbf, obj);
            else if (tag === 5) readFeature(pbf, obj);
            else if (tag === 6) readGeometry(pbf, obj);
        }

        function readFeatureCollection(pbf, obj) {
            obj.type = 'FeatureCollection';
            obj.features = [];
            return pbf.readMessage(readFeatureCollectionField, obj);
        }

        function readFeature(pbf, feature) {
            feature.type = 'Feature';
            return pbf.readMessage(readFeatureField, feature);
        }

        function readGeometry(pbf, geom) {
            return pbf.readMessage(readGeometryField, geom);
        }

        function readFeatureCollectionField(tag, obj, pbf) {
            if (tag === 1) obj.features.push(readFeature(pbf, {}));

            else if (tag === 13) values.push(readValue(pbf));
            else if (tag === 15) readProps(pbf, obj);
        }

        function readFeatureField(tag, feature, pbf) {
            if (tag === 1) feature.geometry = readGeometry(pbf, {});

            else if (tag === 11) feature.id = pbf.readString();
            else if (tag === 12) feature.id = pbf.readSVarint();

            else if (tag === 13) values.push(readValue(pbf));
            else if (tag === 14) feature.properties = readProps(pbf, {});
            else if (tag === 15) readProps(pbf, feature);
        }

        function readGeometryField(tag, geom, pbf) {
            if (tag === 1) geom.type = geometryTypes[pbf.readVarint()];

            else if (tag === 2) lengths = pbf.readPackedVarint();
            else if (tag === 3) readCoords(geom, pbf, geom.type);
            else if (tag === 4) {
                geom.geometries = geom.geometries || [];
                geom.geometries.push(readGeometry(pbf, {}));
            }
            else if (tag === 13) values.push(readValue(pbf));
            else if (tag === 15) readProps(pbf, geom);
        }

        function readCoords(geom, pbf, type) {
            if (type === 'Point') geom.coordinates = readPoint(pbf);
            else if (type === 'MultiPoint') geom.coordinates = readLine(pbf, true);
            else if (type === 'LineString') geom.coordinates = readLine(pbf);
            else if (type === 'MultiLineString') geom.coordinates = readMultiLine(pbf);
            else if (type === 'Polygon') geom.coordinates = readMultiLine(pbf, true);
            else if (type === 'MultiPolygon') geom.coordinates = readMultiPolygon(pbf);
        }

        function readValue(pbf) {
            var end = pbf.readVarint() + pbf.pos,
                value = null;

            while (pbf.pos < end) {
                var val = pbf.readVarint(),
                    tag = val >> 3;

                if (tag === 1) value = pbf.readString();
                else if (tag === 2) value = pbf.readDouble();
                else if (tag === 3) value = pbf.readVarint();
                else if (tag === 4) value = -pbf.readVarint();
                else if (tag === 5) value = pbf.readBoolean();
                else if (tag === 6) value = JSON.parse(pbf.readString());
            }
            return value;
        }

        function readProps(pbf, props) {
            var end = pbf.readVarint() + pbf.pos;
            while (pbf.pos < end) props[keys[pbf.readVarint()]] = values[pbf.readVarint()];
            values = [];
            return props;
        }

        function readPoint(pbf) {
            var end = pbf.readVarint() + pbf.pos,
                coords = [];
            while (pbf.pos < end) coords.push(pbf.readSVarint() / e);
            return coords;
        }

        function readLinePart(pbf, end, len, closed) {
            var i = 0,
                coords = [],
                p, d;

            var prevP = [];
            for (d = 0; d < dim; d++) prevP[d] = 0;

            while (len ? i < len : pbf.pos < end) {
                p = [];
                for (d = 0; d < dim; d++) {
                    prevP[d] += pbf.readSVarint();
                    p[d] = prevP[d] / e;
                }
                coords.push(p);
                i++;
            }
            if (closed) coords.push(coords[0]);

            return coords;
        }

        function readLine(pbf) {
            return readLinePart(pbf, pbf.readVarint() + pbf.pos);
        }

        function readMultiLine(pbf, closed) {
            var end = pbf.readVarint() + pbf.pos;
            if (!lengths) return [readLinePart(pbf, end, null, closed)];

            var coords = [];
            for (var i = 0; i < lengths.length; i++) coords.push(readLinePart(pbf, end, lengths[i], closed));
            lengths = null;
            return coords;
        }

        function readMultiPolygon(pbf) {
            var end = pbf.readVarint() + pbf.pos;
            if (!lengths) return [[readLinePart(pbf, end, null, true)]];

            var coords = [];
            var j = 1;
            for (var i = 0; i < lengths[0]; i++) {
                var rings = [];
                for (var k = 0; k < lengths[j]; k++) rings.push(readLinePart(pbf, end, lengths[j + 1 + k], true));
                j += lengths[j] + 1;
                coords.push(rings);
            }
            lengths = null;
            return coords;
        }
    }]);