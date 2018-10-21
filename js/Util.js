const lowerLeftMA = [49.446, 8.4517];
const upperRightMA = [49.514, 8.4955];

const debounce = (func, wait, to) => {
  if (to.timeout) {
    clearTimeout(to.timeout);
  }
  to.timeout = setTimeout(func, wait);
}

const randomBoxedCoords = (lowerLeft, upperRight) => {
  const lat = chance.latitude({min: lowerLeft[0], max: upperRight[0]});
  const lng = chance.latitude({min: lowerLeft[1], max: upperRight[1]});
  return `${lat}, ${lng}`;
};

const downloadFile = (filename, contents) => {
  let href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(contents);
  let link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
}

const randomTeam = () => {
  return {
    name1: `${chance.name()} ${chance.last()}`,
    mail1: chance.email(),
    phone1: chance.phone(),
    name2: `${chance.name()} ${chance.last()}`,
    mail2: chance.email(),
    phone2: chance.phone(),
    address: chance.address(),
    comments: 'nada',
    coords: randomBoxedCoords(lowerLeftMA, upperRightMA),
    starter: true,
    main: true,
    dessert: true,
  }
}

const emptyTeam = () => {
  return {
    name1: '',
    mail1: '',
    phone1: '',
    name2: '',
    mail2: '',
    phone2: '',
    address: '',
    comments: '',
    coords: '',
    starter: true,
    main: true,
    dessert: true,
  }
}

const cleanTeam = (team) => {
  return {
    name1: team.name1 || '',
    mail1: team.mail1 || '',
    phone1: team.phone1 || '',
    name2: team.name2 || '',
    mail2: team.mail2 || '',
    phone2: team.phone2 || '',
    address: team.address || '',
    comments: team.comments || '',
    coords: team.coords || '',
    starter: true,
    main: true,
    dessert: true,
  }
}

const parseCoords = (str) => {
  if (str == null) {
    return null;
  }
  const xs = str.split(',').map(item => item.trim());
  if (xs.length == 2 && xs[0] != '' && xs[1] != '' && !isNaN(xs[0]) && !isNaN(xs[1])) {
    return [Number(xs[0]), Number(xs[1])];
  } else {
    return null;
  }
}
