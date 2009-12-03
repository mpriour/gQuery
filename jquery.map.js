/* 
GeoQuery
Ivan Willig
*/
(function($){
   $.fn.map = function(options) {
   var defaults = { 
       'center':  [0,0],
       'zoomLevel': 5,  
       'projection': 900913,
       'displayProjection': 4326  
   }; 
   var options = $.extend(defaults,options);
   var MapOptions = { 
       resolutions: [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135, 0.29858214169740677, 0.14929107084870338, 0.07464553542435169, 0.037322767712175846, 0.018661383856087923, 0.009330691928043961, 0.004665345964021981, 0.0023326729820109904, 0.0011663364910054952, 5.831682455027476E-4, 2.915841227513738E-4, 1.457920613756869E-4],
       projection: new OpenLayers.Projection("EPSG:" + options.projection + ""),
       maxExtent: new OpenLayers.Bounds(-2.003750834E7,-2.003750834E7,2.003750834E7,2.003750834E7),
       units: "meters"
   }
  
   // kind of hacky.. but works
   var div = this[0].id ;   
   var map = new OpenLayers.Map(div,MapOptions);
   var layer = new OpenLayers.Layer.WMS(
       "openstreetmap","http://maps.opengeo.org/geowebcache/service/wms",
       {layers: 'openstreetmap', format: 'image/png' },
       { }
   );
   map.addLayer(layer);
   var Point = new OpenLayers.LonLat(options.center[0],options.center[1]); 
   Point.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
   map.setCenter(new OpenLayers.LonLat(Point.lon,Point.lat),options.zoomLevel);
   };
})(jQuery);

