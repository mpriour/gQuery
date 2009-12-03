

GeoQuery
======== 

A simple and dumb Mapping library that allows users to render vector on top of Google Project WMS Layers 

#. Basic assumptions 
   1. base layer is in "ESPG:900913", 
   2. feature information is in "ESPG:4326" 
        so points look like (-73,43) not (something crazy)
   

Jquery 1.3.2 ? 

download at 
------------ 
http://jqueryjs.googlecode.com/files/jquery-1.3.2.min.js

OpenLayers trunk 

download at 
----------- 

This is what we have 
-------------------- 
What has been done so far::

  $('#map').map({ 
    'center' : [-73,43], 
    'zoomLevel: 5, 
    'baselayer: 'openstreetmap' ||  'bluemarble', 
    'url' : 'somekmlfile.kml' 
  ) 


This is what we want. 
--------------------- 

This is a example of the features we want::

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
