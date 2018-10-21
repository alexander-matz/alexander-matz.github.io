"use strict";

String.prototype.replaceAll = function(search, replacement) {
    let s1 = this;
    let s2 = s1.replace(search, replacement);
    while (s1 != s2) {
      s1 = s2;
      s2 = s2.replace(search, replacement);
    }
    return s2;
};

const generateMail = (teamIdx, teams, matching, templates) => {
  const {cooks, tour} = Matching.getTour(matching, teamIdx);
  const team = teams[teamIdx];

  const dishes = ['starter', 'main', 'dessert'];
  const roles = ['cook', 'guest1', 'guest2'];

  let templ = templates[ dishes[cooks] ];

  templ = templ.replaceAll('$(recipient-name1)', team.name1);
  templ = templ.replaceAll('$(recipient-mail1)', team.mail1);
  templ = templ.replaceAll('$(recipient-phone1)', team.phone1);
  templ = templ.replaceAll('$(recipient-name2)', team.name2);
  templ = templ.replaceAll('$(recipient-mail2)', team.mail2);
  templ = templ.replaceAll('$(recipient-phone2)', team.phone2);
  templ = templ.replaceAll('$(recipient-address)', team.address);
  templ = templ.replaceAll('$(recipient-comments)', team.comments);

  for (let i = 0; i < dishes.length; ++i) {
    const dish = dishes[i];
    for (let j = 0; j < roles.length; ++j) {
      const role = roles[j];
      const team = teams[tour[i][j]];
      templ = templ.replaceAll(`$(${dish}-${role}-name1)`, team.name1);
      templ = templ.replaceAll(`$(${dish}-${role}-mail1)`, team.mail1);
      templ = templ.replaceAll(`$(${dish}-${role}-phone1)`, team.phone1);
      templ = templ.replaceAll(`$(${dish}-${role}-name2)`, team.name2);
      templ = templ.replaceAll(`$(${dish}-${role}-mail2)`, team.mail2);
      templ = templ.replaceAll(`$(${dish}-${role}-phone2)`, team.phone2);
      templ = templ.replaceAll(`$(${dish}-${role}-address)`, team.address);
      templ = templ.replaceAll(`$(${dish}-${role}-comments)`, team.comments);
    }
  }
  return templ;
}
