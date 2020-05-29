// initialize variable to store retrieved data
var studies = [];

// load data from file on server
d3.json('assets/data/samples.json')
  .then((data) => {
    studies = data;
    addFilters(data)
    initPlots()
  })
  .catch((error) => console.error(error));


function addFilters(data) {
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

function initPlots() {
  addBarPlot()
  addGaugePlot()
}

function addBarPlot() {
  let data = [{
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    y: ['lable1', 'label2', 'label3', 'label4', 'label5', 'label6', 'label7', 'label8', 'label9', 'label10'],
    type: 'bar',
    text: ['lable1', 'label2', 'label3', 'label4', 'label5', 'label6', 'label7', 'label8', 'label9', 'label10'],
    orientation: 'h',
  }];

  let layout = {
    width: 400,
    height: 500,
    title: '<b>Top # Microbial Species Found</b>',
  };

  Plotly.newPlot('bar', data, layout, { responsive: true })
}

function gaugePointer(num) {
  // Enter the washing frequency (must multiply by 20 (180/9))
  var level = num * 20;

  // Trig to calc meter point
  var degrees = 180 - level,
    radius = .65;
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

  return path;
}

function addGaugePlot() {

  data = [{
    type: 'scatter',
    x: [0], y: [0],
    marker: { size: 20, color: '850000' },
    showlegend: false,
    name: 'scrubs',
    text: 0,
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
    showlegend: false,
  }
  ];

  layout = {
    shapes: [{
      type: 'path',
      path: gaugePointer(0),
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
    title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
    width: 500,
    height: 500,
    xaxis: {
      zeroline: false,
      showticklabels: false,
      showgrid: false,
      range: [-1, 1]
    },
    yaxis: {
      zeroline: false,
      showticklabels: false,
      showgrid: false,
      range: [-1, 1]
    }
  };

  Plotly.newPlot('gauge', data, layout, { responsive: true });
}

function updateSite() {
  let id = this.value;

  if (id === 'None') {
    //hideElements();
  } else {

    let found = studies.samples.filter(sample => sample.id === id);

    updateMetadata(id);
    updateCharts(id)

    console.log('filter selected : ', found)
  }
}

function showElements() {
  d3.select('#filter-results').classed('d-block', true);
  d3.select('#bar').classed('d-block', true);
  d3.select('#gauge').classed('d-block', true);
  d3.select('#bubbles').classed('d-block', true);
}

function hideElements() {
  d3.select('#filter-results').classed('d-block', false);
  d3.select('#bar').classed('d-block', false);
  d3.select('#gauge').classed('d-block', false);
  d3.select('#bubbles').classed('d-block', false);
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

  updateBarH(id)
  updateGauge(id)
  //updateBubbles(id)
  showElements()

  console.log(`updating charts with study data for id ${id}`)

}

function updateBarH(id) {

  // select the study to chart
  let study = studies.samples.filter(d => d.id === id)[0]
  console.log('plotBarH for study : ', study)

  // select the top 10 values, reverse their order, and store in variables
  let x_values = study.sample_values.splice(0, 10).reverse()
  let y_labels = study.otu_ids.map(d => 'OTU '.concat(d)).splice(0, 10).reverse()
  let hover_labels = study.otu_labels.splice(0, 10).reverse()

  // plot data
  let data = [{
    x: x_values,
    y: y_labels,
    type: 'bar',
    text: hover_labels,
    orientation: 'h',
  }];

  // get the maximum value on the x-axis
  // in order to update the layout's xaxis range
  xaxis_max = d3.max(x_values)

  // udpate plot title
  let layout = {
    title: `<b>Top ${y_labels.length} Microbial Species Found</b>`,
    xaxis: { range: [0, xaxis_max] },
  };

  // animate plot update
  Plotly.animate('bar', {
    data: data,
    traces: [0],
    layout: layout
  }, {
    transition: {
      duration: 500,
      easing: 'cubic-in-out'
    },
    frame: {
      duration: 500
    }
  })

}

function updateGauge(id) {

  // retrieve id's metadata
  let metadata = studies.metadata.filter(sample => sample.id === +id)[0];
  console.log('metadata retireved for gauge : ', metadata)

  // plot data
  var data = [{
    type: 'scatter',
    x: [0], y: [0],
    marker: { size: 20, color: '850000' },
    showlegend: false,
    name: 'scrubs',
    text: metadata.wfreq,
    hoverinfo: 'text+name'
  }];

  var layout = {
    shapes: [{
      type: 'path',
      path: gaugePointer(metadata.wfreq),
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }]
  };

  // animate plot update
  Plotly.animate('gauge', {
    data: data,
    traces: [0],
    layout: layout
  }, {
    transition: {
      duration: 500,
      easing: 'cubic-in-out'
    },
    frame: {
      duration: 500
    }
  })
}
