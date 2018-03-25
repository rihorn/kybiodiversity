(function () {
    L.mapbox.accessToken =
    'pk.eyJ1IjoiaWFuaG9ybiIsImEiOiJjamRocmdseWUxMjJ0MnlwNDdiMDd5ZXZzIn0.jBWD0r86k4pBSymNrCKfzw';
  var map = L.mapbox.map('map', 'mapbox.pirates', {
    zoomSnap: .1,
    center: [37.6438332, -85.6487252],
    zoom: 7,
    minZoom: 1,
    maxZoom: 20,
    fillOpacity: 1
    //maxBounds: L.latLngBounds([], [])
  });


  var attributeValue = "allRecords";
  // $.getJSON("data/eoKyQuads.json", function (data) {
  //   drawMap(data);
  // }); // end of $.getJSON()

  getCsv = omnivore.csv('data/eoUnion.csv')
  .on('ready', function (e) {
    drawMap(e.target.toGeoJSON());
    drawLegend(e.target.toGeoJSON());  // add this statement

  })
  .on('error', function (e) {
    console.log(e.error[0].message);
  });



  function drawMap(data) {
    // create Leaflet object with geometry data and add to map
    var dataLayer = L.geoJson(data, {
      style: function (feature) {
        return {
          color: 'blue',
          weight: 1,
          fillOpacity: 1,
          fillColor: '#1f78b4'
        };
      }
    }).addTo(map);
    //first set the zoom/center to the dataLayer's extent
    map.fitBounds(dataLayer.getBounds());

    // call the update function
    updateMap(dataLayer);
    addUi(dataLayer);
    addLegend();
  } // end function drawMap
  function updateMap(dataLayer) {

    // reference to get sample jquery radio button: 
    // http: //www.jquerybyexample.net/2012/02/get-radio-button-value-using-jquery.html
    //jquery to select input values
    var presenceValue = $('input[name=toggle]:checked').val()
    var taxonomyValue = $('input[name=toggle2]:checked').val()

    //console.log(taxonomyValue, presenceValue)
    if (presenceValue === "allRecords" && taxonomyValue === "allRecords") {
      attributeValue = "allRecords"
    }
    if (presenceValue === "allRecords" && taxonomyValue === "Animals") {
      attributeValue = "Animals"
    }
    if (presenceValue === "allRecords" && taxonomyValue === "Plants") {
      attributeValue = "Plants"
    }
    if (presenceValue === "allRecords" && taxonomyValue === "Communities") {
      attributeValue = "Communities"
    }
    if (presenceValue === "Extant" && taxonomyValue === "allRecords") {
      attributeValue = "allExtant"
    }
    if (presenceValue === "Extant" && taxonomyValue === "Animals") {
      attributeValue = "eAnimals"
    }
    if (presenceValue === "Extant" && taxonomyValue === "Plants") {
      attributeValue = "ePlants"
    }
    if (presenceValue === "Extant" && taxonomyValue === "Communities") {
      attributeValue = "eCommunities"
    }
    if (presenceValue === "Historic/Extirpated" && taxonomyValue === "allRecords") {
      attributeValue = "allHistoric"
    }
    if (presenceValue === "Historic/Extirpated" && taxonomyValue === "Animals") {
      attributeValue = "hAnimals"
    }
    if (presenceValue === "Historic/Extirpated" && taxonomyValue === "Plants") {
      attributeValue = "hPlants"
    }
    if (presenceValue === "Historic/Extirpated" && taxonomyValue === "Communities") {
      attributeValue = "hCommunities"
    }

    console.log(attributeValue)
    // get the class breaks for the current data attribute
    var breaks = getClassBreaks(dataLayer);
    updateLegend(breaks);
    // loop through each county layer to update the color and tooltip info
    dataLayer.eachLayer(function (layer) {
      var props = layer.feature.properties;
      // set the fill color of layer based on its normalized data value
      if (+props[attributeValue] != 0) {
        // set the fill color of layer based on its normalized data value
        layer.setStyle({
          fillColor: getColor(+props[attributeValue], breaks),
          opacity: 1,
          fillOpacity: 1
        });
      } else {
        layer.setStyle({
          opacity: 0,
          fillOpacity: 0
        })
      }

      // assemble string sequence of info for tooltip (end line break with + operator)
      var tooltipInfo = "QUAD: " + props["quad24name"] + "<br>" + "# of Records" + ": " +
        props[attributeValue] + " EOs";
      // bind a tooltip to layer with county-specific information
      layer.bindTooltip(tooltipInfo, {
        // sticky property so tooltip follows the mouse
        sticky: true,
        tooltipAnchor: [300, 200]
      });
    });
  }

  function getClassBreaks(dataLayer) {
    // create empty Array for storing values
    var values = [];
    // loop through all the quads
    dataLayer.eachLayer(function (layer) {
      var value = layer.feature.properties[attributeValue];
      // don't push zero values into the array
      if (value > 0) {
        values.push(+value); // push the value for each layer into the Array
      }
    });
    // determine similar clusters
    var clusters = ss.ckmeans(values, 5);
    // create an array of the lowest value within each cluster
    var breaks = clusters.map(function (cluster) {
      return [cluster[0], cluster.pop()];
    });

    //return array of arrays, e.g., [[0,5], [6, 10], etc]
    return breaks;
  }

  function getColor(d, breaks) {
    // function accepts a single  data attribute value
    // and uses a series of conditional statements to determine which
    // which color value to return to return to the function caller
    // https://carto.com/carto-colors/
    // #c4e6c3,#96d2a4,#6dbc90,#4da284,#36877a,#266b6e,#1d4f60
    if (d <= breaks[0][1]) {
      return '#c4e6c3';
    } else if (d <= breaks[1][1]) {
      return '#96d2a4';
    } else if (d <= breaks[2][1]) {
      return '#6dbc90';
    } else if (d <= breaks[3][1]) {
      return '#36877a'
    } else if (d <= breaks[4][1]) {
      return '#1d4f60'
    }
  }

  function addLegend(breaks) {
    // create a new Leaflet control object, and position it top left
    var legendControl = L.control({
      position: 'topleft'
    });
    // when the legend is added to the map
    legendControl.onAdd = function (map) {
      // select a div element with an id attribute of legend
      var legend = L.DomUtil.get('legend');
      // disable scroll and click/touch on map when on legend
      L.DomEvent.disableScrollPropagation(legend);
      L.DomEvent.disableClickPropagation(legend);
      // return the selection to the method
      return legend;
    };
    // add the empty legend div to the map
    legendControl.addTo(map);
  }

  function updateLegend(breaks) {
    // get the currently selected values 
    // var taxonomyValue = $("#taxonomy-selector option:selected").val()
    var taxonomyValue = $('input[name=toggle2]:checked').val()

    var presenceValue = $('input[name=toggle]:checked').val()

    //  if/else statement to change title

    if (taxonomyValue == "allRecords") {
      taxonomyValue = "EOs"
    }

    if (presenceValue == "allRecords") {
      presenceValue = "All"
    }

    //  console.log(taxonomyValue, presenceValue);

    // select the legend, add a title, begin an unordered list and assign to a variable
    var legend = $('#legend').html("<h5>" + presenceValue + " " + taxonomyValue + " </h5>");
    // loop through the Array of classification break values
    for (var i = 0; i <= breaks.length - 1; i++) {
      var color = getColor(breaks[i][0], breaks);
      legend.append('<span style="background:' + color + '"></span> ' +
        '<label>' + (breaks[i][0]) + ' &mdash; ' + (breaks[i][1]) +
        '</label>');
    }
  }

  function addUi(dataLayer) {
       // create the slider control
    var selectControl = L.control({
      position: 'topright'
    });
    // when control is added
    selectControl.onAdd = function (map) {
      // get the element with id attribute of ui-controls
      return L.DomUtil.get("ui-presence");
    }
    // add the control to the map
    selectControl.addTo(map);
    $('input[name="toggle"]').change(function () {
      // call updateMap function
      updateMap(dataLayer);
    });
 
 // create the slider control
    var selectControl = L.control({
      position: 'topright'
    });
    // when control is added
    selectControl.onAdd = function (map) {
      // get the element with id attribute of ui-controls
      return L.DomUtil.get("ui-controls");
    }
    // add the control to the map
    selectControl.addTo(map);
    $('input[name=toggle2]').change(function () {
      // call updateMap function
      updateMap(dataLayer);
    });

  }

})()