/* 
GeoQuery
Ivan Willig

basic map usage 
$('#map').map({}); 
See documentation for more details 
*/

(function($){
   $.fn.map = function(options) {
   var defaults = { 
       'center':  null,
       'url' : null,
       'format' : null,  
       'zoomLevel': 5,  
                
       'projection': 900913,
       'displayProjection': 4326, 
       'baseLayer': 'openstreetmap', 
       'resolutions': [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135, 0.29858214169740677, 0.14929107084870338, 0.07464553542435169, 0.037322767712175846, 0.018661383856087923, 0.009330691928043961, 0.004665345964021981, 0.0023326729820109904, 0.0011663364910054952, 5.831682455027476E-4, 2.915841227513738E-4, 1.457920613756869E-4]
 
   }; 
   var options = $.extend(defaults,options);
   var MapOptions = { 
       resolutions: options.resolutions, 
       projection: new OpenLayers.Projection("EPSG:" + options.projection),
       displayProjection: new OpenLayers.Projection("EPSG:" + options.displayProjection),
       maxExtent: new OpenLayers.Bounds(-2.003750834E7,-2.003750834E7,2.003750834E7,2.003750834E7),
       units: "meters"
   }

   function log(error) { 
        if(window.console) { 
            console.log(error); 
        };
         
   } 

   // kind of hacky.. but works
   var div = this[0].id ;   
   var map = new OpenLayers.Map(div,MapOptions);

   //add base layer... what if they do not pick which layer 

   if (typeof options.baselayer == 'object') { 
        var layer = options.baselayer;    
    } else {
        
        if (options.baselayer == 'bluemarble') { 
          var layer = new OpenLayers.Layer.WMS(
            "bluemarble","http://maps.opengeo.org/geowebcache/service/wms",
            {layers: 'bluemarble', format: 'image/png' },
          { }
          );
      } else { 
           var layer = new OpenLayers.Layer.WMS(
               "openstreetmap","http://maps.opengeo.org/geowebcache/service/wms",
              {layers: 'openstreetmap', format: 'image/png' },
          { }
          );
   }}; 
  
   // we must add a background layer in openlayers... 
   // so we have to end up with a layer.. ugh
   map.addLayer(layer);

   if (options.url != null) { 
        var fileURL = options.url; 
        name = "Vector Feature" ;

        function getFormat() {
            if (format == null) { 
                var format = new OpenLayers.Format.KML(); 
            } else { 
                if (format == 'kml') { 
                    var format = new OpenLayers.Format.KML();
                } 
                if (format == 'geojson') { 
                    var format = new OpenLayers.Format.GeoJSON(); 
                }};  
            return format; 
        } ; 
        var vectorFeature = new OpenLayers.Layer.Vector(name,{ 
             projection : new OpenLayers.Projection("EPSG:4326"),
             strategies: [new OpenLayers.Strategy.Fixed()],
             protocol: new OpenLayers.Protocol.HTTP({
                 url:  fileURL, 
                 format: getFormat(), 
             }) }); 
        map.addLayer(vectorFeature);             
        var selectCtrl  = new OpenLayers.Control.SelectFeature(vectorFeature);

        if(options.onClick != null) { 
            var onFeatureSelect = options.onClick;    
        
        } 
        else {
            log("onclick is null");  
            var onFeatureSelect; 
        } 
        if (options.onUnclick != null) { 
            var onFeatureUnselect = options.onUnclick; 
        }; 

        vectorFeature.events.on({
                "featureselected": onFeatureSelect,
                "featureunselected": onFeatureUnselect
            });

        map.addControl(selectCtrl);
        selectCtrl.activate();
   }
   if (options.center == null &&  options.extent == null) { 
       var Center = new OpenLayers.LonLat(0,0); 
       Center.transform(map.displayProjection,map.projection);
       map.setCenter(Center,options.zoomLevel);
       log(Center); 
   } 
   else if (options.center != null && options.extent == null ) { 
       var Center = new OpenLayers.LonLat(options.center[0],options.center[1]); 
       Center.transform(map.displayProjection,map.projection);
       map.setCenter(Center,options.zoomLevel);
       log(Center); 
       } 
   else if (options.center == null && options.extent != null) { 
       var Extent = new OpenLayers.Bounds(options.extent[0],options.extent[1],options.extent[2],options.extent[3]); 
       Extent.transform(map.displayProjection,map.projection);
       map.zoomToExtent(Extent);  
   } 
   
 };
	$.fn.map.popup = function(options) {
	    debug(this);
	};
	
	$.fn.map.popup.format = function(txt) { // Allow overrides from outside the function
	// do we want to also allow classnames to be passed in via options?
	 return '<div class="gquery-popup">' + txt + '</div>';
	};
})(jQuery);

