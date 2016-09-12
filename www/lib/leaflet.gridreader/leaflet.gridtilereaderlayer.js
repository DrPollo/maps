L.TileLayer.Functional = L.TileLayer.extend({

    _tileFunction: null,
    
    _tilesSubscriptions : {},
    
    initialize: function (subscribe, unsubscribe, options) {
        this._subscribe = subscribe;
        this._unsubscribe = unsubscribe;
        L.TileLayer.prototype.initialize.call(this, null, options);
    },

    getTileData: function (tilePoint) {
        var map = this._map,
            crs = map.options.crs,
            tileSize = this.options.tileSize,
            zoom = this._getZoomForUrl(),
            nwPoint = tilePoint.multiplyBy(tileSize),
            sePoint = nwPoint.add(new L.Point(tileSize, tileSize)),
            nw = crs.project(map.unproject(nwPoint, zoom)),
            se = crs.project(map.unproject(sePoint, zoom)),
            bbox = [nw.x, se.y, se.x, nw.y].join(',');

        // Setup object to send to tile function.
        var view = {
            crs: crs,
            nw: nw,
            se: se,
            z: zoom,
            y: this.options.tms ? this._tileNumBounds.max.y - tilePoint.y : tilePoint.y,
            x: tilePoint.x
        };
        console.error('map ',map,tilePoint);
        return this._subscribe(view);
    },
    
    
    _update: function () {

		if (!this._map) { return; }

		var map = this._map,
		    bounds = map.getPixelBounds(),
		    zoom = map.getZoom(),
		    tileSize = this._getTileSize();

		if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
			return;
		}

		var tileBounds = L.bounds(
		        bounds.min.divideBy(tileSize)._floor(),
		        bounds.max.divideBy(tileSize)._floor());

        // calcolo le tile da aggiungere, chiala la _addTile
		this._addTilesFromCenterOut(tileBounds);
        
        // calcolo le tile da rimuovere, chiama la _removeTile
		this._removeOtherTiles(tileBounds);
        
        //console.debug('tiles',Object.keys(this._tilesSubscriptions).length)
	},
    
    
    _removeOtherTiles: function (bounds) {
		var kArr, x, y, key;
        //console.debug('bounds',bounds)
		for (key in this._tilesSubscriptions) {
			kArr = key.split(':');
			x = parseInt(kArr[0], 10);
			y = parseInt(kArr[1], 10);
            //console.debug('kArr',kArr,'x',x,'y',y)
			// remove tile if it's out of bounds
			if (x < bounds.min.x || x > bounds.max.x || y < bounds.min.y || y > bounds.max.y) {
				this._removeTile(key);
			}
		}
	},
    
    _removeTile: function (key) {
		var tile = this._tilesSubscriptions[key];
        //console.debug('unsubscribe ',tile)
        delete this._tilesSubscriptions[key];
        // lancio la unsubscribe per la tile
		return this._unsubscribe(tile);
	},
    
    _tileShouldBeLoaded: function (tilePoint) {
		if ((tilePoint.x + ':' + tilePoint.y) in this._tilesSubscriptions) {
			return false; // already loaded
		}

		var options = this.options;

		if (!options.continuousWorld) {
			var limit = this._getWrapTileNum();

			// don't load if exceeds world bounds
			if ((options.noWrap && (tilePoint.x < 0 || tilePoint.x >= limit.x)) ||
				tilePoint.y < 0 || tilePoint.y >= limit.y) { return false; }
		}

		if (options.bounds) {
			var tileSize = this._getTileSize(),
			    nwPoint = tilePoint.multiplyBy(tileSize),
			    sePoint = nwPoint.add([tileSize, tileSize]),
			    nw = this._map.unproject(nwPoint),
			    se = this._map.unproject(sePoint);

			// TODO temporary hack, will be removed after refactoring projections
			// https://github.com/Leaflet/Leaflet/issues/1618
			if (!options.continuousWorld && !options.noWrap) {
				nw = nw.wrap();
				se = se.wrap();
			}

			if (!options.bounds.intersects([nw, se])) { return false; }
		}

		return true;
	},
    
    _addTile: function(tilePoint){
        
        var map = this._map,
            crs = map.options.crs,
            tileSize = this.options.tileSize,
            zoom = this._map._zoom,
            nwPoint = tilePoint.multiplyBy(tileSize),
            sePoint = nwPoint.add(new L.Point(tileSize, tileSize)),
            nw = crs.project(map.unproject(nwPoint, zoom)),
            se = crs.project(map.unproject(sePoint, zoom)),
            bbox = [nw.x, se.y, se.x, nw.y].join(',');

        // Setup object to send to tile function.
        var tile = {
            crs: crs,
            nw: nw,
            se: se,
            z: zoom,
            y: this.options.tms ? this._tileNumBounds.max.y - tilePoint.y : tilePoint.y,
            x: tilePoint.x};
        
        this._tilesSubscriptions[tilePoint.x + ':' + tilePoint.y] = tile;
        //console.debug('subscribe ',tile)
        // chiamo la subscribe
        return this._subscribe(tile)
    }
});

L.tileLayer.functional = function (tileFunction, options) {
    return new L.TileLayer.Functional(tileFunction, options);
};