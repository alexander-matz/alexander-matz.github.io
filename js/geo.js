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
          return new Promise( (resolve, reject) => {
            if (data.length > 0) {
              resolve({
                lat: data[0].lat,
                lon: data[0].lon,
              })
            } else {
              reject(new Error('not found'));
            }
          });
        })
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
        return new Promise( (resolve, reject) => {
          if (response.status == 200) {
            return nominatim.parseResponse(response)
              .then((position) => {
                cache[address] = Object.assign({cached: true}, position);
                resolve(position);
              });
          } else {
            reject(new Error(response.statusText));
          }
        });
      }).catch( (err) => {
        return new Promise( (resolve, reject) => {
          reject(err);
        })
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
