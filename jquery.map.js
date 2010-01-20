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
      pointRadius: null,
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
      popupClusterClass: 'gquery-popupClusterContainer',
      popupClusterNavClass: 'gquery-popupClusterNav',
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
      $.fn.map.addPopupBehavior(event.feature, options, 0);
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
            return $.fn.map.popupClusterFormat(feature, options);
        } else {
            feature = feature.cluster[0];
        }
      }
      return ($.fn.map.popupHeaderFormat(feature, options) +
              $.fn.map.popupFeatureFormat(feature, options) +
              $.fn.map.popupFooterFormat(feature, options));
    };

    $.fn.map.popupClusterFormat = function(feature, options) {
        // display the format for a cluster
        // feature represents a cluster of more than one feature
        var firstFeature = feature.cluster[0];
        return ($.fn.map.popupHeaderFormat(firstFeature, options) +
                '<div class="' + options.popupClusterClass + '">' +
                $.fn.map.popupFeatureFormat(firstFeature, options) +
                '</div>' +
                $.fn.map.popupClusterNavFormat(feature, options) +
                $.fn.map.popupFooterFormat(firstFeature, options));
    };

    $.fn.map.popupClusterNavFormat = function(feature, options) {
        return ('<div class="' + options.popupClusterNavClass + '">' +
                '<a href="#" class="gquery-prev">Prev</a>' +
                '<a href="#" class="gquery-next">Next</a>');
    };

    $.fn.map.popupHeaderFormat = function(feature, options) {
        // display the beginning html of the popup
        return '<div class="' + options.popupWrapClass + '"><div class="' + options.popupClass + '">';
    };

    $.fn.map.popupFooterFormat = function(feature, options) {
        // the end of the popup
        return '</div></div>';
    };

    $.fn.map.popupFeatureFormat = function(feature, options) {
        // display the html for a particular feature
        // this feature is normalized, so it will have a consistent
        // api if the feature is from a cluster or not
        return '<p>' + feature.attributes.description + '</p>';
    };

    $.fn.map.closePopupFormat = function (options) {
      return '<div class="' + options.closerClass + '">x</div>';
    };

    $.fn.map.addPopupBehavior = function(feature, options, idx) {
        // attach any popup behavior to the feature
        // in this implementation we add prev/next circular navigation
        // to clusters
        // idx represents the current feature in a cluster
        if (options.clustered && feature.cluster.length > 1) {
            var popupFeatureDiv = $('.' + options.popupClusterClass);
            if (popupFeatureDiv.length == 0) return;
            var nextLink = $('.gquery-next');
            var prevLink = $('.gquery-prev');
            if (nextLink.length == 0 || prevLink.length == 0) return;
            var prevIdxFn = function(idx) { return (idx == 0) ? feature.cluster.length-1 : idx-1; };
            var nextIdxFn = function(idx) { return (idx == feature.cluster.length-1) ? 0 : idx+1; };
            var _makeHandler = function(idx, idxFn) {
                return function(e) {
                    e.preventDefault();
                    var nextIdx = idxFn(idx);
                    popupFeatureDiv.empty();
                    var popupHtml = $.fn.map.popupFeatureFormat(feature.cluster[nextIdx]);
                    popupFeatureDiv.append(popupHtml);
                    prevLink.unbind('click');
                    nextLink.unbind('click');
                    prevLink.click(_makeHandler(nextIdx, prevIdxFn));
                    nextLink.click(_makeHandler(nextIdx, nextIdxFn));
                };
            };
            prevLink.click(_makeHandler(idx, prevIdxFn));
            nextLink.click(_makeHandler(idx, nextIdxFn));
        }
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

        // these will be used for the creation of the style object
        var style = {};
        var context = {};

        if (options.externalGraphic) {
          if (typeof options.externalGraphic == "function") {
              style.externalGraphic = "${externalGraphic}";
              context.externalGraphic = options.externalGraphic;
          } else {
              style.externalGraphic = options.externalGraphic;
          }
        }

        if (options.clustered) {
            vectorLayerOptions.strategies.push(new OpenLayers.Strategy.Cluster());
            if (!options.pointRadius) {
                var pointRadius = function(feature) {
                    return Math.min(feature.attributes.count, 8) + 5;
                };
                context.pointRadius = pointRadius;
                style.pointRadius = "${pointRadius}";
            } else if (typeof options.pointRadius != "function") {
                log('gquery: warning: setting the pointRadius for a cluster strategy to a constant value');
                style.pointRadius = options.pointRadius;
            } else {
                style.pointRadius = "${pointRadius}";
                context.pointRadius = options.pointRadius;
            }
        } else {
            if (options.pointRadius) {
                if (typeof options.pointRadius == "function") {
                    style.pointRadius = "${pointRadius}";
                    context.pointRadius = options.pointRadius;
                } else {
                    style.pointRadius = options.pointRadius;
                }
            } else {
                // default pointRadius
                // it's set to null in options default so that the cluster strategy can use a default clustering algorithm
                style.pointRadius = 5;
            }
        }

        vectorLayerOptions.styleMap = new OpenLayers.StyleMap({
                "default": new OpenLayers.Style(style, {context: context})
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