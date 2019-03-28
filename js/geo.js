"use strict";
let geo = (function() {
  let cache = {};

  function clear() {
    cache = {};
  }

  function timeoutFetch(url, options, timeout = 7000) {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), timeout)
      })
    ]);
  }

  const nominatim = {
    buildUrl: (address) => {
      return `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${address}`;
    },
    parseResponse: (response) => {
      return response.json()
        .then((data) => {
          if (data.length > 0) {
            return {
              lat: data[0].lat,
              lon: data[0].lon,
            }
          } else {
            throw new Error('not found');
          }
        });
    }
  };

  function code(address, timeout) {

    if (address in cache) {
      // avoid async issues
      const res = cache[address];
      return new Promise((resolve, _) => {
        resolve(res);
      });
    }

    if (timeout === undefined) timeout = 5000;

    const url = nominatim.buildUrl(address);

    return timeoutFetch(url, {
        mode: "cors",
        redirect: "follow",
        referrer: "no-referrer",
      }, timeout).then( (response) => {
        if (response.status == 200) {
          return nominatim.parseResponse(response)
            .then((position) => {
              cache[address] = Object.assign({cached: true}, position);
              return position;
            })
        } else {
          throw Error(response.statusText);
        }
      });
  }

  function logger(p) {
    p.then( (res) => {
      console.log(res);
    }).catch( (err) => {
      console.error(err);
    });
  }

  return {
    code: code,
    clear: clear,
    logger: logger,
  }
})();
