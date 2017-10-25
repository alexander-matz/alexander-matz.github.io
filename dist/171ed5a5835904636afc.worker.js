/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__matchalg__ = __webpack_require__(1);


/** Messaging interface
 *
 * Worker receives messages
 * { type: 'reset', teams: teams, consts: consts }
 * { type: 'improve', matching: matching, iterations: num }
 *
 * Worker sends messages
 * { type: 'done', matching: matching, score: score }
 */

function bestOf(matching, teams, consts, n) {
  if (matching === null) throw "matching === null";
  if (teams === null) throw "teams === null";
  if (consts === null) throw "teams === null";

  let bestMatching = matching;
  let bestScore = Object(__WEBPACK_IMPORTED_MODULE_0__matchalg__["a" /* score */])(matching, teams, consts);

  let m = 10;
  // do m attempts on improving the matching, then select best of those
  for (let i = 0; i < n / m << 0; ++i) {
    let baseMatching = bestMatching;
    let baseScore = bestScore;
    for (let j = 0; j < m; ++j) {
      let attemptMatching = Object(__WEBPACK_IMPORTED_MODULE_0__matchalg__["b" /* shuffleMatch */])(baseMatching, [2, 0.125], [10, 0.2]);
      let attemptScore = Object(__WEBPACK_IMPORTED_MODULE_0__matchalg__["a" /* score */])(attemptMatching, teams, consts);
      if (attemptScore < baseScore) {
        bestMatching = attemptMatching;
        bestScore = attemptScore;
      }
    }
  }

  return [bestMatching, bestScore];
}

let teams = null;
let consts = null;

onmessage = function (event) {
  let data = event.data;
  switch (data.type) {
    case 'reset':
      teams = data.teams;
      consts = data.consts;
      console.log('worker initialized');
      break;
    case 'improve':
      let matching = data.matching;
      let n = data.iterations;
      let [bestM, bestS] = bestOf(matching, teams, consts, n);
      postMessage({
        type: 'done',
        matching: bestM,
        score: bestS
      });
      break;
    default:
      throw `unsupported message '${data.type}'`;
  }
};

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export initialMatch */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return shuffleMatch; });
/* unused harmony export summarizeConstraints */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return score; });
/* unused harmony export cursor3d */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__randomset__ = __webpack_require__(2);


/* Distance by the way the crow flies. In kilometers.
 */
function calcCrow(p1, p2) {
  "use strict";

  function toRad(Value) {
    return Value * Math.PI / 180;
  }
  let [_lat1, lon1] = p1;
  let [_lat2, lon2] = p2;
  var R = 6371; // km
  var dLat = toRad(_lat2 - _lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(_lat1);
  var lat2 = toRad(_lat2);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

/* Creates a cursor function for 3d access to a linearized array.
 * fn(x, y, z)      -> read element at [x, y, z]
 * fn(x, y, z, val) -> set element at [x, y, z] to val
 */
function cursor3d(data, nx, ny, nz) {
  return function (x, y, z, val) {
    let idx = 0;
    idx += x;
    idx += y * nx;
    idx += z * nx * ny;
    if (val !== undefined) {
      data[idx] = val;
    } else {
      return data[idx];
    }
  };
}

/* Creates an initial random match from the team list and the nubmer of dishes.
 * Returns a three-dimensional array of:
 * [ for each dish : (numDishes)
 *   [ for each group : (numTeams / numDishes)
 *     [ cook, guest, guest, ... : (numDishes)]]]
 */
function initialMatch(origTeams, numDishes) {
  let nteams = origTeams.length;
  let ndishes = numDishes;
  let ngroups = nteams / ndishes;

  let nx = ndishes;
  let ny = ngroups;
  let nz = ndishes;

  if (nteams % ndishes != 0) {
    return [`number of teams (${nteams}) not divisable by number of dishes (${ndishes})!`, null];
  }

  // (partial) local deep copy of teams for safety
  let teams = [];
  for (let i = 0; i < nteams; ++i) {
    let team = origTeams[i];
    if (typeof team.lat !== "number" || typeof team.lng !== "number") {
      return [`Team ${team.name1}, ${team.name2} is missing coordinates`, null];
    }
    teams.push({ id: i, lat: team.lat, lng: team.lng });
  }

  let availCooks = __WEBPACK_IMPORTED_MODULE_0__randomset__["a" /* default */].fromRange(0, nteams);

  let data = [];
  for (let i = 0; i < nx * ny * nz; ++i) {
    data[i] = -1;
  }
  let val = cursor3d(data, nx, ny, nz);

  // for each dish, first select cooks, then guests
  for (let i = 0; i < ndishes; ++i) {
    // list of available Guests
    let availGuests = __WEBPACK_IMPORTED_MODULE_0__randomset__["a" /* default */].fromRange(0, nteams);

    // for each group select a cook
    for (let j = 0; j < ngroups; ++j) {
      // pick and remove cook
      let cook = availCooks.pop();
      // remove cook from available guests
      availGuests.del(cook);
      // assign cook
      val(i, j, 0, cook << 0);
    }

    for (let j = 0; j < ngroups; ++j) {
      // ndishes - 1 guests
      for (let k = 1; k < ndishes; ++k) {
        // pick and remove guest
        let guest = availGuests.pop();
        // assign guest
        val(i, j, k, guest << 0);
      }
    }
  }

  let match = {
    nx: ndishes,
    ny: ngroups,
    nz: ndishes,
    data: data
  };
  return [null, match];
}

/* Takes an existing valid matches and returns a copy with a statistic number
 * of switches applied. The resulting match is still valid.
 * It might be better or worse than the original (pure random).
 * The following two switch operations exist:
 * teamSwitch: take two teams and switch every of their occurences,
 *   this allows a team to change the meal they're cooking
 * seatSwitch: withing a dish, take two random teams and switch places.
 *   A guest is switched with another guest and a cook is switched with
 *   another cook. Switching cook and guest would result in an invalid match.
 * While seatSwitching is cheap, it restricts each team to its initial role
 * for each dish (cook/guest) which locks a match into local optima.
 * teamSwitching is supposed to fix this.
 * Rule of thumb: do teamSwitches sparingly and sweatSwitches more liberally.
 * The probabilities are based on dice rolls with [2, 0.1] meaning two dice
 * rolls, each with a probability of 10%.
 */
function shuffleMatch(_match, tsProb, ssProb) {
  // make copy and keep the same name, we don't want to mix up names
  let match = {
    nx: _match.nx,
    ny: _match.ny,
    nz: _match.nz,
    data: _match.data.slice()
  };
  let val = cursor3d(match.data, match.nx, match.ny, match.nz);

  let ndishes = match.nx;
  let nteams = match.nx * match.ny;
  let ngroups = match.ny;

  // check for usage errors, use exception because it's faulty logic
  if (isNaN(tsProb[0]) || isNaN(tsProb[1]) || isNaN(ssProb[0]) || isNaN(ssProb[1])) {
    throw 'bad probabilities';
  }

  let [rolls, chance] = tsProb;

  for (let roll = 0; roll < rolls; ++roll) {
    // don't do anything if dice roll is unsuccessful
    if (Math.random() > chance) continue;
    let team1 = nteams * Math.random() << 0; // << 0 forces integer by rounding down
    let team2 = nteams * Math.random() << 0;
    while (team2 == team1) {
      team2 = nteams * Math.random() << 0;
    }

    let team1pos = [null, null, null];
    let team2pos = [null, null, null];

    // find teams in matching
    for (let dish = 0; dish < ndishes; ++dish) {
      for (let group = 0; group < ngroups; ++group) {
        for (let seat = 0; seat < ndishes; ++seat) {
          if (val(dish, group, seat) << 0 == team1) {
            team1pos[dish] = [group, seat];
          }
          if (val(dish, group, seat) << 0 === team2) {
            team2pos[dish] = [group, seat];
          }
        }
      }
    }

    // swap teams
    for (let dish = 0; dish < ndishes; ++dish) {
      let [group1, seat1] = team1pos[dish];
      let [group2, seat2] = team2pos[dish];
      val(dish, group1, seat1, team2 << 0);
      val(dish, group2, seat2, team1 << 0);
    }
  }

  [rolls, chance] = ssProb;
  for (let _ = 0; _ < rolls; ++_) {
    // don't do anything if dice roll is unsuccessful
    if (Math.random() > chance) continue;
    // select dish within which to switch
    let dish = ndishes * Math.random() << 0;
    // select seat to switch
    let seat = ndishes * Math.random() << 0;
    // select groups which to switch seats
    let group1 = ngroups * Math.random() << 0;
    let group2 = ngroups * Math.random() << 0;
    while (group2 == group1) {
      group2 = ngroups * Math.random() << 0;
    }
    // get current assignments
    let team1 = val(dish, group1, seat) << 0;
    let team2 = val(dish, group2, seat) << 0;
    // do the switch
    val(dish, group1, seat, team2 << 0);
    val(dish, group2, seat, team1 << 0);
  }

  return match;
}

/* Create an easier digestable summary of the constraints.
 * param dishes    ["starter", ...]
 *
 * Constraints:
 * - {type: "misc", value: "once", [penalty: 10000]}
 *   penalty for each time two teams meet twice
 * - {type: "misc", value: "short", [penalty: 1]}
 *   penalty for each kilometer walked
 * - {type: "misc", value: "similar", [penalty: 1]}
 *   penalty for each kilometer of standard deviation of all paths
 * - {type: "dish", team: number, dish: number, [penalty: 1000]}
 *   penalty if a team does not cook a dish they want
 * - {type: "not-dish", team: number, dish: number, [penalty: 1000]}
 *   penalty if a team does cook a dish they  do not want
 * 
 * Returns: {
 *  dishes: { <teamId>: { <dish>:<penalty> }, ...},
 *  distance: <penalty>,
 *  deviation: <penalty>,
 *  multiple: <penalty>,
 * }
 */
function summarizeConstraints(constraints, dishes) {
  let dishcs = {}; // for each team with a dish constraint:
  // {number: penalty, number: penalty, ...}
  // e.g. "want starter"      -> {1: penalty, 2: penalty}
  //      "not want starter"  -> {0: penalty}
  let factorDistance = 0;
  let factorDissimilar = 0;
  let factorOnce = 0;
  for (let i = 0; i < constraints.length; ++i) {
    let c = constraints[i];
    if (c.type == "misc" && c.value == "once") {
      factorOnce += c.penalty !== undefined ? c.penalty : 10000;
      continue;
    }
    if (c.type == "misc" && c.value == "short") {
      factorDistance += c.penalty !== undefined ? c.penalty : 2;
      continue;
    }
    if (c.type == "misc" && c.value == "similar") {
      factorDissimilar += c.penalty !== undefined ? c.penalty : 2;
      continue;
    }
    if (c.type == "dish" || c.type == "not-dish") {
      if (dishcs[c.team] == undefined) {
        dishcs[c.team] = {};
      }
      for (let i = 0; i < dishes.length; ++i) {
        let name = dishes[i];
        if (c.type == "dish" && name != c.dish || c.type == "not-dish" && name == c.dish) {
          if (dishcs[c.team][i] === undefined) {
            dishcs[c.team][i] = c.penalty !== undefined ? c.penalty : 1000;
          } else {
            dishcs[c.team][i] += c.penalty !== undefined ? c.penalty : 1000;
          }
        }
      }
      continue;
    }
    throw "unknown Constraint: " + JSON.stringify(constraints[i]);
  }
  return {
    isSummary: true,
    dishes: dishcs,
    distance: factorDistance,
    deviation: factorDissimilar,
    multiple: factorOnce
  };
}

/* Assigns a score to a match based on a set of constraints.
 * The lower the score, the better the results.
 * The constraints must be preprocessed by summarizeConstraints.
 *
 * Returns: score
 */
function score(match, teams, constraints, debug) {
  if (!constraints.isSummary) throw "scoreQuck expects constraints";

  // make copy and keep the same name, we don't want to mix up names
  match = {
    nx: match.nx,
    ny: match.ny,
    nz: match.nz,
    data: match.data.slice()
  };
  let val = cursor3d(match.data, match.nx, match.ny, match.nz);

  let ndishes = match.nx;
  let nteams = match.nx * match.ny;
  let ngroups = match.ny;

  // routes of each team
  // shape: [ [loc, loc, loc...], [loc, loc, loc...] ]
  let routes = [];
  routes.length = nteams;
  for (let i = 0; i < nteams; ++i) {
    routes[i] = [];
    routes[i].length = ndishes;
  }

  // meeting counts
  // shape: { <id>: {<id>: <num>} }
  let meets = {};

  let dishcs = constraints.dishes;
  let dishPenalties = 0;

  /////////////////////////////////////////////////////////
  // Collect data
  for (let dish = 0; dish < ndishes; ++dish) {
    for (let group = 0; group < ngroups; ++group) {
      for (let seat = 0; seat < ndishes; ++seat) {
        let host = val(dish, group, 0) << 0;
        let team = val(dish, group, seat) << 0;

        // add position to route
        routes[team][dish] = [teams[host].lat, teams[host].lng];

        // add all meetings
        for (let seat2 = 0; seat2 < ndishes; ++seat2) {
          if (seat == seat2) continue;

          let team2 = val(dish, group, seat2);
          if (meets[team] === undefined) meets[team] = {};

          if (meets[team][team2] === undefined) {
            meets[team][team2] = 1;
          } else {
            meets[team][team2] += 1;
          }
        }

        // calculate dish penalty
        if (seat == 0 && dishcs[team] !== undefined && dishcs[team][dish] !== undefined) {
          dishPenalties += dishcs[team][dish];
        }
      }
    }
  }

  let totalDist = 0;
  let dists = [];
  dists.length = nteams;

  /////////////////////////////////////////////////////////
  // calculate total distance
  for (let team = 0; team < nteams; ++team) {
    let totalTeam = 0;
    for (let dish = 1; dish < ndishes; ++dish) {
      let prev = routes[team][dish - 1];
      let curr = routes[team][dish];
      if (curr == undefined || prev == undefined) {
        console.log(`team: ${team}, dish: ${dish}`);
        console.log(`routes of ${team}: `, routes[team]);
        console.log("prev: ", prev, "curr: ", curr);
      }
      let dist = calcCrow(prev, curr);
      totalDist += dist;
      totalTeam += dist;
    }
    dists[team] = totalTeam;
  }

  let avgDist = totalDist / nteams;
  let stdDev = 0;

  // calculate standard deviation
  for (let team = 0; team < nteams; ++team) {
    let diff = dists[team] - avgDist;
    stdDev += diff * diff;
  }
  stdDev = Math.sqrt(stdDev / (nteams - 1));

  /////////////////////////////////////////////////////////
  // meetups violations
  let onceViolations = 0;
  for (let team1 in meets) {
    for (let team2 in meets[team1]) {
      if (meets[team1][team2] > 1) {
        onceViolations += 1;
      }
    }
  }

  //console.log(`${totalDist} ${stdDev} ${dishPenalties} ${onceViolations}`)
  if (debug !== undefined && debug !== null) {
    debug.dist = totalDist;
    debug.dev = stdDev;
    debug.dish = dishPenalties;
    debug.once = onceViolations;
  }

  return totalDist * constraints.distance + stdDev * constraints.deviation + dishPenalties + onceViolations * constraints.multiple;
}



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/******************************************************************************
 * Random Set
 * Pretty much a regular set, but with random pick function
 */

function del(set, val) {
  if (set[val] === undefined) {
    throw 'element not in set!';
  }
  delete set[val];
}

function has(set, val) {
  return set[val] === true;
}

function add(set, val) {
  if (set[val] === true) {
    throw 'element already in set!';
  }
  set[val] = true;
}

function get(set) {
  return Object.keys(set);
}

function pick(set) {
  if (Object.keys(set).length == 0) {
    throw 'trying to pick/pop from empty set';
  }
  let keys = Object.keys(set);
  let val = keys[keys.length * Math.random() << 0];
  return val;
}

function pop(set) {
  let val = pick(set);
  del(set, val);
  return val;
}

function augment(obj) {
  return {
    has: val => {
      return has(obj, val);
    },
    get: val => {
      return get(obj);
    },
    add: val => {
      return add(obj, val);
    },
    del: val => {
      return del(obj, val);
    },
    pick: () => {
      return pick(obj);
    },
    pop: () => {
      return pop(obj);
    }
  };
}

function fromArray(arr) {
  if (typeof arr !== "object") {
    throw 'expected array as argument';
  }
  let set = {};
  for (let i = 0; i < arr.length; ++i) {
    if (typeof arr[i] === "object") {
      throw 'cannot use objects as keys';
    }
    set[arr[i]] = true;
  }
  return augment(set);
}

// noninclusive upper bound;
function fromRange(min, max) {
  let set = {};
  for (let i = 0; i < max; ++i) {
    set[i] = true;
  }
  return augment(set);
}

function fromEmpty() {
  return augment({});
}

/* harmony default export */ __webpack_exports__["a"] = ({ fromArray, fromRange, fromEmpty });

/***/ })
/******/ ]);
//# sourceMappingURL=171ed5a5835904636afc.worker.js.map