/* 
GeoQuery
Ivan Willig
*/
(function($){
   $.fn.map = function(options) {
   var defaults = { 
       'center':  [0,0,1],  
   }; 
   var options = $.extend(defaults,options);
   var MapOptions = { 

   }
  
   // kind of hacky.. but works
   var div = this[0].id ;   
   var map = new OpenLayers.Map(div);
   var layer = new OpenLayers.Layer.WMS( "OpenLayers WMS",
                    "http://labs.metacarta.com/wms/vmap0", {layers: 'basic'} );
   map.addLayer(layer);
   map.setCenter(new OpenLayers.LonLat(options.center[0],options.center[1]),options.center[2]);
   };
})(jQuery);

