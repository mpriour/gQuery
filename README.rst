

GeoQuery
======== 


Jquery 1.3.2 ? 

download at 
------------ 
http://jqueryjs.googlecode.com/files/jquery-1.3.2.min.js




This is what we want. 
--------------------- 

Below would be an example of a nice::

    $('#map').map({ 
        'point' : [ [point], [point], [point] ], 
        'onPopup' : function(feature)  { 
        
         },

       'url' : 'url/to/kml.kml', 
       'format' : 'kml' || 'geojson' || 'gml' || 'wfs'  
       'icon' :  'url/to/icon.png', 
       'style' :  {fill: white, stroke: black;  } 
       'extent' : [ 32, 32, 32. 32], 
       'contorls': [ new OpenLayers.Control.PanZoom ], 

    })
