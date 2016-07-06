L.TileLayer.Functional = L.TileLayer.extend({

    _tileFunction: null,

    initialize: function (tileFunction, options) {
        this._tileFunction = tileFunction;
        L.TileLayer.prototype.initialize.call(this, null, options);
    },

    getTileUrl: function (tilePoint) {
        var c = L.CRS.EPSG4326;
        var map = this._map,
            crs = map.options.crs,
            tileSize = this.options.tileSize,
            zoom = tilePoint.z,
            nwPoint = tilePoint.multiplyBy(tileSize),
            sePoint = nwPoint.add(new L.Point(tileSize, tileSize)),
            nw = crs.project(map.unproject(nwPoint, zoom)),
            se = crs.project(map.unproject(sePoint, zoom)),
            bbox = [nw.x, se.y, se.x, nw.y].join(',');

        // Setup object to send to tile function.
        var view = {
            //size: tileSize,
            //bbox: bbox,
            crs: crs,
            nw: nw,
            se: se,
            z: zoom,
            y: this.options.tms ? this._tileNumBounds.max.y - tilePoint.y : tilePoint.y,
            x: tilePoint.x
        };

        return this._tileFunction({view:view,map:map});
    },
    _update: function(e){
        try{ 
            console.error(e.target);
        var map = e.target.map,
            crs = map.options.crs,
            tileSize = this.options.tileSize;
        console.error('update!!!',map,crs,tileSize);
        }catch(e){}
    },
    _loadTile: function (tile, tilePoint) {
        tile._layer = this;
        tile.onload = this._tileOnLoad;
        tile.onerror = this._tileOnError;

        this._adjustTilePoint(tilePoint);
        this.getTileUrl(tilePoint);
    }
});

L.tileLayer.functional = function (tileFunction, options) {
    return new L.TileLayer.Functional(tileFunction, options);
};