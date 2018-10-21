"use strict";

const acreate = (shape, val) => {
  val = val || 0;
  let size = 1;
  for (let i = 0; i < shape.length; ++i) {
    size *= shape[i];
  }
  return Array(size).fill(val);
}

const aget = (data, shape, idx) => {
  let pos = 0;
  for (let i = shape.length-1; i >= 0; --i) {
    pos = (pos * shape[i]) + idx[i];
  }
  return data[pos];
}

const aset = (data, shape, idx, val) => {
  let pos = 0;
  for (let i = shape.length-1; i >= 0; --i) {
    pos = (pos * shape[i]) + idx[i];
  }
  data[pos] = val;
}

let Matching = (() => {

  /** A possible team configuration. Configurations are considered valid if each
   * team a) has *exactly* one role in each dish b) is a cook exactly once and a
   * guest otherwise.
   * 
   * The transformations allowed on a team configuration always transform one
   * valid configuration into another valid configuration. Eliminating invalid
   * configurations this way improves performance substantially over truly random
   * solutions.
   * Configurations that violate constraints (e.g. teams meet twice, a team cooks
   * in a dish it is not available for) are still considered valid but score badly
   * and will be outcompeted by better solutions.
   */
  const newMatching = (teams, dishes, coords, constraints) => {
      if (teams % dishes != 0) {
        throw "number of teams not divisable by numder of dishes";
      }
      if (! coords instanceof Array || coords.length != teams) {
        throw "coordinates list does not match number of teams";
      }

      const groups = teams/dishes;

      // possible solutions are a mapping of:
      // (dish, group, role) -> team, with
      // - group: a set of teams present at the same location for a given dish
      // - role: 0 -> cook, anything else -> guest
      const fShape = [dishes, groups, dishes];
      let fMatching = acreate(fShape, -1);

      // partial reverse mapping:
      // (team, dish) -> (group, role)
      const rShape = [teams, dishes];
      let rMatching = acreate(rShape);

      /** Start with a determinstic, valid distribution of teams. This solution
       * is likely going to score very badly and serves as a "quasi random"
       * starting point.
       */
      for (let d = 0; d < dishes; ++d) {
        for (let g = 0; g < groups; ++g) {
          for (let s = 0; s < dishes; ++s) {
            const team = g * dishes + s;
            const group = (s * d + g) % groups;
            const role = (s + d) % dishes;

            aset(fMatching, fShape, [d, group, role], team);
            aset(rMatching, rShape, [team, d], {group: group, role: role});
          }
        }
      }

      return {
        dishes: dishes,
        groups: groups,
        teams: teams,
        fMatching: fMatching,
        fShape: fShape,
        rMatching: rMatching,
        rShape: rShape,
        coords: coords,
        constraints: constraints,
      }
  }

  const copyMatching = (other) => {
    return {
        dishes: other.dishes,
        groups: other.groups,
        teams: other.teams,
        fMatching: [...other.fMatching],
        fShape: other.fShape,
        rMatching: [...other.rMatching],
        rShape: other.rShape,
        coords: other.coords,
        constraints: other.constraints,
    }
  }

  /** Fully swap two team's assignments. This allows a team to change
   * the dish they're cooking, without introducing the possibility of one
   * of the two teams cooking zero or more than one time.
   * Using the reverse mapping complexity turns into O(#dishes), instead
   * of O(n*#dishes), scanning the assignment is not necessary anymore.
   */
  const swapTeams = (matching, t1, t2) => {
    let {dishes, fMatching, fShape, rMatching, rShape} = matching;
    // For each dish, first use the reverse map to switch the teams in the
    // forward mapping in that dish, then update the reverse map
    for (let d = 0; d < dishes; ++d) {
      // look up and save reverse mapping
      const rev1 = aget(rMatching, rShape, [t1, d]);
      const rev2 = aget(rMatching, rShape, [t2, d]);

      // switch teams in forward mapping
      aset(fMatching, fShape, [d, rev1.group, rev1.role], t2);
      aset(fMatching, fShape, [d, rev2.group, rev2.role], t1);
      // update reverse mapping
      aset(rMatching, rShape, [t1, d], rev2);
      aset(rMatching, rShape, [t2, d], rev1);
    }
  }

  /** Take Switch two teams in the same role in two different groups. Preserves
   * "each role once", preserves whether a team cooks.
   */
  const swapSeats = (matching, dish, seat, g1, g2) => {
    let {dishes, groups, teams, fMatching, fShape, rMatching, rShape} = matching;
    if (dish < 0 || dish >= dishes) throw `invalid dish: ${dish}`;
    if (seat < 0 || seat >= dishes) throw `invalid seat: ${seat}`;
    if (g1 < 0 || g1 >= groups) throw "invalid group 1";
    if (g2 < 0 || g2 >= groups) throw "invalid group 2";
    const t1 = aget(fMatching, fShape, [dish, g1, seat]);
    const t2 = aget(fMatching, fShape, [dish, g2, seat]);

    aset(fMatching, fShape, [dish, g1, seat], t2);
    aset(fMatching, fShape, [dish, g2, seat], t1);
    // update reverse mapping
    aset(rMatching, rShape, [t1, dish], { group: g2, role: seat });
    aset(rMatching, rShape, [t2, dish], { group: g1, role: seat });
  }

  /** Distance measure by the way the crow flies. In kilometers
   */
  const crowDistance = (p1, p2) => {
    "use strict";
    const toRad = (v) => v * Math.PI / 180;

    const [_lat1, lon1] = p1;
    const [_lat2, lon2] = p2;
    const R = 6371; // km
    const dLat = toRad(_lat2-_lat1);
    const dLon = toRad(lon2-lon1);
    const lat1 = toRad(_lat1);
    const lat2 = toRad(_lat2);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d;
  }

  const calculateRoutes = (matching) => {
    let routes = [];
    let total = 0;
    let {dishes, teams, fMatching, fShape, rMatching, rShape, coords} = matching;
    for (let team = 0; team < teams; ++team) {
      // we need distances between dishes, so we start at 1 here
      for (let dish = 1; dish < dishes; ++dish) {
        const groupBefore = aget(rMatching, rShape, [team, dish-1]).group;
        const hostBefore = aget(fMatching, fShape, [dish-1, groupBefore, 0]);
        const hostCoordsBefore = coords[hostBefore];

        const groupNow = aget(rMatching, rShape, [team, dish]).group;
        const hostNow = aget(fMatching, fShape, [dish, groupNow, 0]);
        const hostCoordsNow = coords[hostNow];

        const distance = crowDistance(hostCoordsBefore, hostCoordsNow);
        routes.push(distance);
        total += distance;
      }
    }
    return [routes, total];
  }

  /** Compute the badness of the current matching using a set of constraints.
   * Supported constraints (with default values:
   *
   * { 'type': 'meet-once', 'weight': 10000 }
   *   - penalty that is applied if teams meet more than once
   *   - a pair of teams meeting twice results in the penalty being applied two
   *     times (one time per team)
   *
   * { 'type': 'ways-short', 'weight': 1 }
   *   - linear penalty for total kms walked
   *
   * { 'type': 'ways-equal', 'weight': 1 }
   *   - linear penalty for the standard deviation of all path segments
   * 
   * { 'type': 'not-dish', team: number, 'dish': number, 'weight': 100 }
   *   - penalty that is applied if a team gets a dish it does not want to cook
   */
  const score = (matching) => {

    let {dishes, teams, coords, constraints,
      fMatching, fShape, rMatching, rShape} = matching;

    let badness = 0;

    // routes cache
    let routes = null;
    let totalKm = null;

    for (let i = 0; i < constraints.length; ++i) {
      const cn = constraints[i];
      switch (cn.type) {

      case 'meet-once':
        let metAlready = [];
        for (let dish = 0; dish < dishes; ++dish) {
          for (let team = 0; team < teams; ++team) {
            if (dish == 0) metAlready[team] = {};

            const group = aget(rMatching, rShape, [team, dish]).group;
            for (let role = 0; role < dishes; ++role) {
              const otherTeam = aget(fMatching, fShape, [dish, group, role]);
              if (otherTeam == team) continue;
              if (metAlready[team][otherTeam] != undefined) {
                badness += cn.weight || 10000;
              }
              metAlready[team][otherTeam] = true;
            }
          }
        }
        break;

      case 'ways-short':
        // calculate routes if not in cache
        if (routes == null) {
          [routes, totalKm] = calculateRoutes(matching);
        }
        badness += (cn.weight || 1) * totalKm;
        break;

      case 'ways-equal':
        // calculate routes if not in cache
        if (routes == null) {
          [routes, totalKm] = calculateRoutes(matching);
        }
        const avr = totalKm / routes.length;
        let stdDev = 0;
        for (let i = 0; i < routes.length; ++i) {
          let D = routes[i] - avr;
          stdDev += D * D;
        }
        stdDev = stdDev / (routes.length - 1);
        badness += (cn.weight || 1) * stdDev;
        break;

      case 'not-dish':
        const team = cn.team;
        const dish = cn.dish;
        if (aget(rMatching, rShape, [team, dish]).role == 0) {
          badness += cn.weight || 100;
        }
        break;

      default:
        throw `invalid constraint type: ${cn.type}`;
      }
    }

    return badness;
  }

  const assignmentFor = (matching, team) => {
    let {dishes, groups, fMatching, fShape, rMatching, rShape} = matching;
    let result = [];
    let cooks = -1;
    for (let d = 0; d < dishes; ++d) {
      let dishAssignment = [];
      let {group, role} = aget(rMatching, rShape, [team, d]);
      if (role == 0) cooks = d;
      for (let s = 0; s < dishes; ++s) {
        dishAssignment.push(aget(fMatching, fShape, [d, group, s]));
      }
      result.push(dishAssignment);
    }
    return {cooks: cooks, tour: result};
  }

  return {
    init: newMatching,
    copy: copyMatching,
    swapTeams: swapTeams,
    swapSeats: swapSeats,
    score: score,
    getTour: assignmentFor,
  }
})();
