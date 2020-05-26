// initialize variable to store retrieved data
var data = [];

// load data from file on server
d3.json('assets/data/samples.json')
  .then((data) => {
    data = data;
    return console.log('data loaded successfully : ', data);
  })
  .catch((error) => console.error(error));
