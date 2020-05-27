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



function plotBarH() {

  let x_values = Object.values(studies.samples).map(study => study.smaple_values)
  let y_labels = Object.values(studies.samples).map(study => study.otu_ids)
  let x_labels = Object.values(studies.samples).map(study => study.otu_lables)

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
  d3.select('#bar').classed('d-block', true);
  d3.select('#gauge').classed('d-block', true);

  console.log(`updating charts with study data for id ${id}`)
}
