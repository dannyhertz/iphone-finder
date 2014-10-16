/*
 * iphone-finder
 * https://github.com/dannyhertz/iphone-finder
 *
 * Copyright (c) 2013 Danny Hertz
 * Licensed under the MIT license.
 */

'use strict';

var RestClient = require('node-rest-client').Client;

var MODEL_MAP = {
  'MG642LL/A' : 'Silver 64gb',
  'MG612LL/A' : 'Silver 128gb',
  'MG632LL/A' : 'Grey 64gb',
  'MG602LL/A' : 'Grey 128gb'
};

var client = new RestClient(),
    zipCode,
    pollingTime,
    pollingTimer;

function makeSomeNoise(message) {
  console.log(message);

  for (var i = 0; i < 10; i++) {
    process.stdout.write('\x07');
  }
}

function generateURLForModel(modelNumber, zipCode) {
  return 'http://store.apple.com/us/retail/availabilitySearch?parts.0=' + modelNumber + '&zip=' + zipCode;
}

if (process.argv && process.argv.length < 4) {
  console.log('Error: must specify a zipcode and polling time in seconds.');
  process.exit(1);
} else {
  zipCode = parseInt(process.argv[2], 10);
  pollingTime = parseInt(process.argv[3], 10);
}

pollingTimer = setInterval(function () {
  for (var modelNumber in MODEL_MAP) {
    (function (currModelNumber) {
      var modelURL = generateURLForModel(currModelNumber, zipCode);

      client.get(modelURL, function (data) {
        var responseJSON = JSON.parse(data),
            stores = responseJSON.body.stores,
            availableStores;

        availableStores = stores.filter(function (store) {
          return store.partsAvailability[currModelNumber].pickupDisplay !== 'unavailable';
        });
        availableStores = availableStores.map(function (store) {
          return store.storeDisplayName;
        });

        if (availableStores.length) {
          makeSomeNoise('Some ' + MODEL_MAP[currModelNumber] + ' models left :)');
        } else {
          process.stdout.write('.');
        }
      });
    })(modelNumber);
  }
}, pollingTime * 1000);
