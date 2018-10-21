"use strict";

Vue.component("view-mails", {
  data: () => ({
    page: 1,
  }),
  props: [ 'teams', 'templates', 'match' ],
  computed: {
    index() {
      if (this.match == null || this.page < 1 || this.page > this.teams.length) {
        return null
      }
      return this.page-1;
    },
    recipients() {
      if (this.index == null) {
        return '';
      }
      const team = this.teams[this.index];
      return  `${team.mail1}, ${team.mail2}`;
    },
    email() {
      if (this.index == null) {
        return '';
      }
      return generateMail(this.index, this.teams, this.match, this.templates);
    },
    errors() {
      if (this.teams.length == 0) {
        return 'No Teams';
      }
      if (this.match == null) {
        return 'No Matching';
      }
      return '';
    },
  },
  template: `
  <v-tab-item>

    <v-card-text>
      <div v-if='errors == "" && index != null'>
        <v-pagination v-model='page' :length='teams.length'>
      </v-pagination>

      <v-text-field readonly label='Recipients' v-bind:value='recipients'>
      </v-text-field>

      <v-textarea auto-grow readonly label='E-Mail' v-bind:value='email'>
      </v-textarea>
      </div>
    </v-card-text>

    <v-footer color='warning' v-if='errors != ""'>
      <v-flex pa-3>
      {{ errors }}
      </v-flex>
    </v-footer>
  </v-tab-item>
  `,
});
