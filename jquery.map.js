/* 
GeoQuery
Ivan Willig
*/
(function($){
   $.fn.map = function(options) {
   var defaults = { 
     
   }; 
   var options = $.extend(defaults,options);
   var div = this[0].id ; 

   var map = new OpenLayers.Map(div);
   var layer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
                    "http://labs.metacarta.com/wms/vmap0", {layers: 'basic'} );
   map.addLayer(layer);
   map.setCenter(new OpenLayers.LonLat(5, 40),5);
   };
})(jQuery);

