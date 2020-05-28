// initialize variable to store retrieved data
var studies = [];

// load data from file on server
d3.json('assets/data/samples.json')
  .then((data) => {
    studies = data;
    createFilter(data)
  })
  .catch((error) => console.error(error));


function createFilter(data) {
  if (data.names) {
    // generate an object containing the filter objects
    filterOptions = [...new Set(data.names)];

    filterOptions.forEach(option => {

      // create a dropdown using a select element for each filter
      let select = d3.select('select#filter')
        .on('change', updateSite)

      // Add all values as options to dropdown
      select.selectAll(null)
        .data(filterOptions)
        .enter()
        .append('option')
        .text(function (d) { return d; })
    })
  } else {
    console.error('unable to create the filter dropdown')
  }
}

function updateSite() {
  let id = this.value;

  if (id === 'None') {
    hideElements();
  } else {

    let found = studies.samples.filter(sample => sample.id === id);

    updateMetadata(id);
    updateCharts(id)

    console.log('filter selected : ', found)
  }
}

function hideElements() {
  d3.select('#filter-results').classed('d-block', false);
  d3.select('#bar').classed('d-block', false);
  d3.select('#gauge').classed('d-block', false);
}

function updateMetadata(id) {

  // retrieve id's metadata
  let metadata = studies.metadata.filter(sample => sample.id === +id)[0];

  let results = d3.select('#filter-results')
  let tbody = results.select('table').select('tbody');

  // update table by using keys to generate rows
  let rows = tbody.selectAll('tr').data(Object.keys(metadata).map(key => ({ column: key.toUpperCase().concat(':'), value: metadata[key] })));

  // update columns by turning each row into an array of values
  let columns = rows.enter()
    .append('tr')
    .merge(rows)
    .selectAll('td')
    .data(row => Object.values(row))

  columns
    .enter()
    .append('td')
    .merge(columns)
    .html(column => column);

  // display demographics table
  results.classed('d-block', true)

  // remove unnecessary table rows
  rows.exit().remove()

  console.log('demographics : ', metadata)
}

function updateCharts(id) {


  plotBarH(id)
  plotGauge(id)
  plotBubbles(id)

  d3.select('#bar').classed('d-block', true);
  d3.select('#gauge').classed('d-block', true);
  d3.select('#bubbles').classed('d-block', true);
  resizePlots();
  console.log(`updating charts with study data for id ${id}`)

}

function resizePlots() {
  var WIDTH_IN_PERCENT_OF_PARENT = 100,
    HEIGHT_IN_PERCENT_OF_PARENT = 90;

  var g3 = d3.selectAll('.responsive-plot')
    .style({
      width: WIDTH_IN_PERCENT_OF_PARENT + '%',
      'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',

      height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
      'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
    });

  var nodes_to_resize = gd3[0];

  window.onresize = function () {
    for (var i = 0; i < nodes_to_resize.length; i++) {
      Plotly.Plots.resize(nodes_to_resize[i]);
    }
  }
}


function plotBarH(id) {

  // select the study to chart
  let study = studies.samples.filter(d => d.id === id)[0]
  console.log('plotBarH for study : ', study)

  let x_values = study.sample_values
  let y_labels = study.otu_ids.map(d => 'OTU '.concat(d))
  let hover_labels = study.otu_labels

  let data = [{
    x: x_values.splice(0, 10).reverse(),
    y: y_labels.splice(0, 10).reverse(),
    type: 'bar',
    text: hover_labels.splice(0, 10).reverse(),
    orientation: 'h',
  }];

  let layout = {
    /* width: 400,
    height: 500, */
    title: '<b>Top 10 Microbial Species Found</b>'
  };

  Plotly.newPlot('bar', data, layout, { responsive: true })

}

function plotGauge(id) {

  // retrieve id's metadata
  let metadata = studies.metadata.filter(sample => sample.id === +id)[0];
  console.log('metadata retireved for gauge2 : ', metadata)

  // Enter the washing frequency (must multiply 180/9)
  var level = metadata.wfreq * 20;

  // Trig to calc meter point
  var degrees = 180 - level,
    radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: create a triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
    pathX = String(x),
    space = ' ',
    pathY = String(y),
    pathEnd = ' Z';
  var path = mainPath.concat(pathX, space, pathY, pathEnd);

  var data = [{
    type: 'scatter',
    x: [0], y: [0],
    marker: { size: 28, color: '850000' },
    showlegend: false,
    name: 'scrubs',
    text: metadata.wfreq,
    hoverinfo: 'text+name'
  },
  {
    values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 9],
    rotation: 90,
    text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
    textinfo: 'text',
    textposition: 'inside',
    marker: {
      colors: [
        "rgba(133, 180, 138, 1)",
        "rgba(138, 187, 143, 1)",
        "rgba(140, 191, 136, 1)",
        "rgba(183, 204, 146, 1)",
        "rgba(213, 228, 157, 1)",
        "rgba(229, 231, 179, 1)",
        "rgba(233, 230, 202, 1)",
        "rgba(244, 241, 229, 1)",
        "rgba(248, 243, 236, 1)",
        "rgba(255, 255, 255, 1)"
      ]
    },
    labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
    hoverinfo: 'label',
    hole: .5,
    type: 'pie',
    showlegend: false
  }
  ];

  var layout = {
    shapes: [{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
    title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
    /* width: 600,
    height: 500, */
    xaxis: {
      zeroline: false,
      showticklabels: false,
      showgrid: false,
      fixedrange: true,
      range: [-1, 1]
    },
    yaxis: {
      zeroline: false,
      showticklabels: false,
      showgrid: false,
      fixedrange: true,
      range: [-1, 1]
    }
  };

  Plotly.newPlot('gauge', data, layout, { responsive: true });
}




// Make Plots Responsive
(function () {
  var WIDTH_IN_PERCENT_OF_PARENT = 100,
    HEIGHT_IN_PERCENT_OF_PARENT = 90;

  var g3 = d3.selectAll('.responsive-plot')
    .style({
      width: WIDTH_IN_PERCENT_OF_PARENT + '%',
      'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',

      height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
      'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + 'vh'
    });

  resizePlots();

  var nodes_to_resize = gd3[0];
  window.onresize = resizePlots();

  function resizePlots() {
    for (var i = 0; i < nodes_to_resize.length; i++) {
      Plotly.Plots.resize(nodes_to_resize[i]);
    }
  }

})();
