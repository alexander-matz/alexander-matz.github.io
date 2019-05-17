"use strict";

importScripts('libmatching.js');

function poisson(k, l) {
  let x = 0;
  for (let i = 0; i < k; ++i) {
    if (Math.random() < l) x += 1;
  }
  return x;
}

function neighbour(match, ratio) {
  if (Math.random() <= ratio) {
    const dish = Math.floor(Math.random() * 3);
    const seat = Math.floor(Math.random() * 3);
    const g1 = Math.floor(Math.random() * (match.teams / 3));
    const g2 = Math.floor(Math.random() * (match.teams / 3));
    Matching.swapSeats(match, dish, seat, g1, g2);
  } else {
    const t1 = Math.floor(Math.random() * match.teams);
    const t2 = Math.floor(Math.random() * match.teams);
    Matching.swapTeams(match, t1, t2);
  }
}

function temperature(i, imax, tmin, tmax) {
  const scale = -Math.log(tmin, tmax);
  return tmax * Math.exp(scale * i / imax);
}

function Pa(E, newE, T) {
  if (newE < E) {
    return 1;
  } else {
    Math.exp(-(newE - E) / T);
  }
}

function anneal(match, score, nsteps, T) {
  let E = score;

  for (let i = 0; i < nsteps; ++i) {
    let newMatch = Matching.copy(match);
    neighbour(newMatch, 0.80);
    const newE = Matching.score(newMatch);
    //const T = temperature(i, nsteps, tmin, tmax);
    if (Math.random() < Pa(E, newE)) {
      match = newMatch;
      E = newE;
    }
  }

  return {score: E, match: match};
}

function evolve(match, score, rounds) {
  let origScore = score
    , origMatch = match
    , bestScore = score
    , bestMatch = match;

  for (let j = 0; j < rounds; ++j) {
    let attempt = Matching.copy(origMatch);


    const nSwapSeats = poisson(20, 0.1);
    for (let i = 0; i < nSwapSeats; ++i) {
      const dish = Math.floor(Math.random() * 3);
      const seat = Math.floor(Math.random() * 3);
      const g1 = Math.floor(Math.random() * (match.teams / 3));
      const g2 = Math.floor(Math.random() * (match.teams / 3));
      Matching.swapSeats(attempt, dish, seat, g1, g2);
    }

    const nSwapTeams = poisson(4, 0.064);
    for (let i = 0; i < nSwapTeams; ++i) {
      const t1 = Math.floor(Math.random() * match.teams);
      const t2 = Math.floor(Math.random() * match.teams);
      Matching.swapTeams(attempt, t1, t2);
    }

    const score = Matching.score(attempt);

    if (score < bestScore) {
      bestScore = score;
      bestMatch = attempt;
    }
  }

  return {score: bestScore, match: bestMatch};
}

self.onmessage = (event) => {
  const data = event.data;
  let {kind, config} = data;
  let result = {};
  if (kind == 'anneal') {
    const {match, score, nsteps, T} = config;
    result = anneal(match, score, nsteps, T);
  } else if (kind == 'evolve') {
    const {match, score, rounds} = config;
    result = evolve(match, score, rounds);
  } else {
    throw new Error(`invalid optimizer: ${kind}`);
  }

  postMessage(result)
}
