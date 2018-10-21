Vue.component('view-matching', {
  data: () => ({
    busy: false,
    page: 1,
    workers: null,
    start: null,
  }),
  destroyed() {
    this.stopMatching();
  },
  props: [ 'match', 'teams' ],
  methods: {
    calcRounds() {
      let akk = 0;
      for (let i = 0; i < 8; ++i) {
        akk += Math.floor(Math.random() * 8)
      }
      return akk;
    },
    resetMatching() {

      this.stopMatching();

      let constraints = [];
      constraints.push({type: 'meet-once'});
      constraints.push({type: 'ways-short'});
      constraints.push({type: 'ways-equal'});
      const teams = this.teams;
      for (let i = 0; i < teams.length; ++i) {
        if (!teams[i].starter) constraints.push({
          type: 'not-dish', team: i, dish: 0
        });
        if (!teams[i].main) constraints.push({
          type: 'not-dish', team: i, dish: 1
        });
        if (!teams[i].dessert) constraints.push({
          type: 'not-dish', team: i, dish: 2
        });
      }
      const coords = teams.map(x => parseCoords(x.coords));
      this.$emit('update:match', Matching.init(teams.length, 3, coords, constraints));
    },
    startMatching() {
      this.workers = [];
      for (let i = 0; i < 1; ++i) {
        let worker = new Worker('js/worker.js');
        worker.onmessage = this.handleMessage;
        worker.postMessage({
          score: this.score,
          match: this.match,
          rounds: this.calcRounds(),
        });
        this.workers.push(worker);
      }
      this.start = Date.now() / 1000;
      this.busy = true;
    },
    stopMatching() {
      if (this.workers != null) {
        this.workers.forEach(worker => worker.terminate());
        this.workers = null;
      }
      if (this.start != null) {
        const now = Date.now() / 1000;
        console.log(`optimized for ${(now - this.start).toFixed(3)} s`);
        this.start = null;
      }
      this.busy = false;
    },
    handleMessage(event) {
      const {score, match} = event.data;
      if (score < this.score) {
        this.$emit('update:match', match);
      }
      if (this.busy) {
        event.target.postMessage({
          score: this.score,
          match: this.match,
          rounds: this.calcRounds(),
        });
      }
    },
    onSearch(index) {
      if (index != null) {
        this.page = index + 1;
      }
    }
  },
  computed: {
    score() {
      if (this.match == null) {
        return Infinity;
      } else {
        return Matching.score(this.match);
      }
    },
    selected () {
      if (this.match == null)
        return null;
      if (this.page < 1) 
        return 1;
      if (this.page > this.teams.length)
        return this.teams.length;
      return this.page-1;
    },
    filterItems() {
      items = [];
      const teams = this.teams;
      for (let i = 0; i < teams.length; ++i) {
        items.push({
          text: `${teams[i].name1}, ${teams[i].name2}`,
          value: i,
        })
      }
      return items;
    },
    problems() {
      const teams = this.teams;
      if (teams.length < 9) {
        return 'Not enough teams (9 minimum)';
      }
      if (teams.length % 3 != 0) {
        return 'Number of teams not divisable by 3';
      }
      for (let i = 0; i < teams.length; ++i) {
        if (parseCoords(teams[i].coords) == null) {
          return 'Not all teams have coordinates';
        }
      }
      return '';
    },
  },
  template: `
  <v-tab-item>
    <v-card-text>
      <v-layout wrap>
        <v-flex md6 xs12>
          <v-btn v-if='match == null' @click='resetMatching'>
            Initialize
          </v-btn>
          <v-btn v-else @click='resetMatching'>
            Reset
          </v-btn>
          <v-btn :disabled='match == null' v-if='!busy' @click='startMatching'>
            Improve!
          </v-btn>
          <v-btn :disabled='match == null' v-else @click='stopMatching'>
            Stop!
          </v-btn>
          <div class='score' v-if='match != null'>
            {{ score.toFixed(2) }}
          </div>
        </v-flex>

        <v-flex md6 xs12 v-if='match != null'>
          <v-autocomplete :items='filterItems' :filter='fuzzyFilter' @input='onSearch'
            clearable append-icon='search' placeholder='Search'>
          </v-autocomplete>
        </v-flex>

        <v-flex xs12 v-if='selected != null'>
          <v-pagination v-model='page' :length='teams.length'></v-pagination>
        </v-flex>

        <v-flex xs12 v-if='selected != null'>
          <view-match v-bind:match='match' v-bind:index='selected' v-bind:teams='teams'>
          </view-match>
        </v-flex>

        <v-flex xs12 v-if='selected != null'>
          <v-pagination v-model='page' :length='teams.length'></v-pagination>
        </v-flex>

      </v-layout>
    </v-card-text>

    <v-footer color='warning' v-if='problems != ""'>
      <v-flex pa-3>
      {{ problems }}
      </v-flex>
    </v-footer>
  </v-tab-item>
  `,
});

Vue.component('view-match', {
  data: () => ({
    dishes: ['Starter', 'Main', 'Dessert'],
  }),
  props: [ 'match', 'teams', 'index' ],
  computed: {
    team() {
      return this.teams[this.index];
    },
    cooks() {
      return Matching.getTour(this.match, this.index).cooks;
    },
    tour() {
      return Matching.getTour(this.match, this.index).tour;
    },
  },
  methods: {
    classDish(num) {
      const pre = 'mt-3 subheading';
      if (this.tour[num][0] == this.team) {
        return pre + ' font-weight-medium'
      } else {
        return pre;
      }
    },
    teamAddr(teamIdx) {
      const team = this.teams[teamIdx];
      return `${team.address}`;
    },
    teamStr(teamIdx) {
      const team = this.teams[teamIdx];
      return `${team.name1}, ${team.name2}`;
    },
  },
  template: `
    <v-layout wrap>
      <v-flex xs12 class='headline' pt-3>
        {{ teamStr(index) }}
      </v-flex>

      <v-flex xs12 class='subheading'>
        Cooks: {{ dishes[cooks] }}
      </v-flex>
      <v-flex xs12 v-for='dish in [0, 1, 2]' :key='dish'>
        <div :class='classDish(dish)'>{{ dishes[dish] }} @ {{ teamAddr(tour[dish][0]) }}</div>
        <v-list>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title class='font-weight-medium'>
                {{ teamStr(tour[dish][0]) }} (Host)
              </v-list-tile-title>
              <v-list-tile-sub-title class='pl-2'>
                {{ teams[tour[dish][0]].comments }}
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ teamStr(tour[dish][1]) }} (Guest)
              </v-list-tile-title>
              <v-list-tile-sub-title class='pl-2'>
                {{ teams[tour[dish][1]].comments }}
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ teamStr(tour[dish][2]) }} (Guest)
              </v-list-tile-title>
              <v-list-tile-sub-title class='pl-2'>
                {{ teams[tour[dish][2]].comments }}
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-flex>
    </v-layout>
  `
});
