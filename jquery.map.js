/* 
GeoQuery
Ivan Willig, Chris Patterson

basic map usage 
$('#map').map({}); 
See documentation for more details 

License: GPL 3 http://www.gnu.org/licenses/gpl-3.0.html
*/
(function ($) {
  $.fn.map = function (options) {
    var defaults = {
      center: null,
      url: null,
      format: null,
      externalGraphic: null,
      zoomLevel: 5,
      projection: 900913,
      displayProjection: 4326,
      baseLayer: 'openstreetmap',
      resolutions: [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135, 0.29858214169740677, 0.14929107084870338, 0.07464553542435169, 0.037322767712175846, 0.018661383856087923, 0.009330691928043961, 0.004665345964021981, 0.0023326729820109904, 0.0011663364910054952, 5.831682455027476E-4, 2.915841227513738E-4, 1.457920613756869E-4],
      onClick: function (event) {
        showPopup(event);
      },
      /* does the ability to pass in a value like "function(event) {showPopup(event); somethingelsetodo(event)}" here suffice for adding custom callbacks? */
      onUnclick: function (event) {
        closePopup(event);
      },
      popupWrapClass: 'gquery-wrap',
      popupClass: 'gquery-popup',
      closerClass: 'gquery-close',
      featureID: 'feature',
      clustered: false,
      exposeMapGlobally: true
    };

    options = $.extend(defaults, options);

    var currentFeature = null;
    var layer = null;

    var MapOptions = {
      resolutions: options.resolutions,
      projection: new OpenLayers.Projection("EPSG:" + options.projection),
      displayProjection: new OpenLayers.Projection("EPSG:" + options.displayProjection),
      maxExtent: new OpenLayers.Bounds(-2.003750834E7, -2.003750834E7, 2.003750834E7, 2.003750834E7),
      units: "meters"
    };

    function log(error) {
      if (window.console) {
        console.log(error);
      }

    }

    function showPopup(event) {
      var mapObject = event.object.map;
      var pixel = mapObject.getPixelFromLonLat(event.feature.geometry.getBounds().getCenterLonLat());
      var closer = $($.fn.map.closePopupFormat(options)).click(function () {
        mapObject.controls[(mapObject.controls.length-1)].unselect(event.feature); //Can we always assume the last control added will be the one we need to unselect features? I suspect not.
      });
      currentFeature = event.feature;
      placePopup(pixel);
      $('#' + options.featureID).html($.fn.map.popupFormat(event.feature, options)).show();
      $('#' + options.featureID + ' .' + options.popupClass).prepend(closer);
      log(pixel);
    }

    function placePopup(pixel) {
      $('#' + options.featureID).css({
        'top': pixel.y,
        'left': pixel.x
      });
    }

    function closePopup(event) {
      $('#' + options.featureID).html("").hide();
      log(event);
    }

    // Public formatting methods, to allow overrides from outside the function
    $.fn.map.popupFormat = function (feature, options) {
      if (options.clustered) {
        if (feature.cluster.length > 1) {
          return '<div class="' + options.popupWrapClass + '"><div class="' + options.popupClass + '">' + "<p>cluster of " + feature.cluster.length + " features</p>" + '</div></div>';
        } else {
          return '<div class="' + options.popupWrapClass + '"><div class="' + options.popupClass + '">' + "<p>" + feature.cluster[0].attributes.description + "</p>" + '</div></div>';
        }
      } else {
        return '<div class="' + options.popupWrapClass + '"><div class="' + options.popupClass + '">' + "<p>" + feature.attributes.description + "</p>" + '</div></div>';
      }
    };

    $.fn.map.closePopupFormat = function (options) {
      return '<div class="' + options.closerClass + '">x</div>';
    };

    return this.each(function () {
      // kind of hacky.. but works
      var div = $(this).attr('id');
      var map = new OpenLayers.Map(div, MapOptions);
      if (options.exposeMapGlobally) {
        if (window) {
          window.map = map;
        }
      }
      map.events.on({
        movestart: function () {
          $('#' + options.featureID).hide();
        },
        moveend: function () {
          if (currentFeature !== null) {
            placePopup(this.getPixelFromLonLat(currentFeature.geometry.getBounds().getCenterLonLat()));
          }
          $('#' + options.featureID).show();
        }
      });

      //add base layer... what if they do not pick which layer 
      if (typeof options.baselayer == 'object') {
        layer = options.baselayer;
      } else {

        if (options.baselayer == 'bluemarble') {
          layer = new OpenLayers.Layer.WMS("bluemarble", "http://maps.opengeo.org/geowebcache/service/wms", {
            layers: 'bluemarble',
            format: 'image/png'
          },
          {});
        } else {
          layer = new OpenLayers.Layer.WMS("openstreetmap", "http://maps.opengeo.org/geowebcache/service/wms", {
            layers: 'openstreetmap',
            format: 'image/png'
          },
          {});
        }
      }

      function getFormat(abbreviation) {
        if (abbreviation === null) {
          return new OpenLayers.Format.KML();
        } else {
          if (abbreviation == 'kml') {
            return new OpenLayers.Format.KML();
          }
          if (abbreviation == 'geojson') {
            return new OpenLayers.Format.GeoJSON();
          }
        }

      }

      // we must add a background layer in openlayers... 
      // so we have to end up with a layer.. ugh
      map.addLayer(layer);

      if (options.url !== null) {
        var fileURL = options.url;
        name = "Vector Feature";

        // bbox might be a better default, no?
        // -robianski
        var vectorStrategies = [new OpenLayers.Strategy.Fixed()];
        var vectorLayerOptions = {
          projection: new OpenLayers.Projection("EPSG:4326"),
          strategies: vectorStrategies,
          protocol: new OpenLayers.Protocol.HTTP({
            url: fileURL,
            format: getFormat(options.format)
          })
        };

        var style = new OpenLayers.Style({
                pointRadius: 5,
                externalGraphic: options.externalGraphic
            });

        if (options.clustered) {
            vectorLayerOptions.strategies.push(new OpenLayers.Strategy.Cluster());
            style = new OpenLayers.Style({
                    pointRadius: "${radius}",
                    externalGraphic: options.externalGraphic
                },
                {context: {
                        radius: function(feature) {
                            return Math.min(feature.attributes.count, 8) + 5;
                        }
                    }
                });
        }

        vectorLayerOptions.styleMap = new OpenLayers.StyleMap({
                "default": style
        });
        var vectorFeature = new OpenLayers.Layer.Vector(name,
                                                        vectorLayerOptions);

        map.addLayer(vectorFeature);
        var selectCtrl = new OpenLayers.Control.SelectFeature(vectorFeature);

        vectorFeature.events.on({
          "featureselected": options.onClick,
          "featureunselected": options.onUnclick
        });

        map.addControl(selectCtrl);
        selectCtrl.activate();
      }

      if (options.center == null && options.extent == null) {
        var Center = new OpenLayers.LonLat(0, 0);
        Center.transform(map.displayProjection, map.projection);
        map.setCenter(Center, options.zoomLevel);
        log(Center);
      } else if (options.center !== null && options.extent == null) {
        var Center = new OpenLayers.LonLat(options.center[0], options.center[1]);
        Center.transform(map.displayProjection, map.projection);
        map.setCenter(Center, options.zoomLevel);
        log(Center);
      } else if (options.center == null && options.extent !== null) {
        var Extent = new OpenLayers.Bounds(options.extent[0], options.extent[1], options.extent[2], options.extent[3]);
        Extent.transform(map.displayProjection, map.projection);
        map.zoomToExtent(Extent);
      }
    });
  };
})(jQuery);