"use strict";

importScripts('libmatching.js');

const poisson = (k, l) => {
  let x = 0;
  for (let i = 0; i < k; ++i)
    if (Math.random() < l) x += 1;
  return x;
}

self.onmessage = (event) => {
  const data = event.data;
  const {match, score, rounds} = data;

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

  postMessage({score: bestScore, match: bestMatch})
}
