

GeoQuery
======== 

This is what we want. 


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
