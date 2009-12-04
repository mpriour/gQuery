GeoQuery
======== 

A simple and dumb mapping library that allows users to render vectors
on top of Google Project WMS Layers using Jquery.

Basic assumptions 
   1. base layer is in "ESPG:900913", 
   2. feature information is in "ESPG:4326" 
      so points look like (-73,43) not (something crazy)
   3. There are popups associated the vector layer. 
   4. The function you pass to onClick is run when you select a
      feature. 

Possible Future
--------------- 

suggestions from whit
++++++++++++++++++++++ 

$("#map").kml.points.onClick(function(){showpopups}) 

$("#map").wfs.query('blah').onClick(...)

map.kml.filter(someselector).styles({}) 

maps.wfs({url:someurl}).style({})
map.wfs.filter("type:school").style({}).show()

map.wfs.filter("type:school").onClick(function(e){var tempate = $("#popup-school"); showPopup(e, template)})

basic idea 
map.wfs 
map.kml 
map.geojson 


Dependencies 
------------- 
Jquery 1.3.2 ? 
download at:: 
 
    http://jqueryjs.googlecode.com/files/jquery-1.3.2.min.js

OpenLayers trunk 
download at::
    
    svn http://svn.openlayers.org/trunk/ openlayers 

Build OpenLayers::
    
    cd build
    python build.py 


This is what we have 
---------------------  
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

Other options::

    $('#map').map({
         'center' : [-73,43], 
         'baselayer' : 'bluemarble',
         'url' : '', 
         'format' : 'kml'
         });
     
    $('#map').geojson.filter('render': 'true').style({'icon': 'point.png'}); 

    Where the GeoJSON looks like
    features = { 
        "type" : "Features" [ { 
            "coords" : blah 
            "props" : { "render" : "true" 
        }
        ]

     } 

What about this?::
    

    $('#map').map({ 
        'center' : [-73,43], 
         'vectors' : { 
            "bikes" : {"url": "example.com/bikes.kml", "type" : "kml" }, 
            "roads" : {"url": "example.com/roads.josn"}
            "points" : {"url": "http://demo.opengeo.org/geoserver/wfs", "layer": "points" }  
             } 
    }); 

    $('#map').roads.filter.("WHERE name = \'Broadway\'").style({}); 


