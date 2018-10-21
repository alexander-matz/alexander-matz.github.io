"use strict";

Vue.component('view-templates', {
  data: () => ({
    choice: 'starter',
    variable: '$(recipient-name1)',
    variables: [
      '$(recipient-name1)',   '$(recipient-mail1)', '$(recipient-phone1)',
      '$(recipient-name2)',   '$(recipient-mail2)', '$(recipient-phone2)',
      '$(recipient-address)', '$(recipient-comments)',

      '$(starter-cook-name1)',     '$(starter-cook-mail1)',   '$(starter-cook-phone1)',
      '$(starter-cook-name2)',     '$(starter-cook-mail2)',   '$(starter-cook-phone2)',
      '$(starter-cook-address)',   '$(starter-cook-coments)',
      '$(starter-guest1-name1)',   '$(starter-guest1-mail1)', '$(starter-guest1-phone1)',
      '$(starter-guest1-name2)',   '$(starter-guest1-mail2)', '$(starter-guest1-phone2)',
      '$(starter-guest1-address)', '$(starter-guest1-coments)',
      '$(starter-guest2-name1)',   '$(starter-guest2-mail1)', '$(starter-guest2-phone1)',
      '$(starter-guest2-name2)',   '$(starter-guest2-mail2)', '$(starter-guest2-phone2)',
      '$(starter-guest2-address)', '$(starter-guest2-coments)',

      '$(main-cook-name1)',     '$(main-cook-mail1)',   '$(main-cook-phone1)',
      '$(main-cook-name2)',     '$(main-cook-mail2)',   '$(main-cook-phone2)',
      '$(main-cook-address)',   '$(main-cook-coments)',
      '$(main-guest1-name1)',   '$(main-guest1-mail1)', '$(main-guest1-phone1)',
      '$(main-guest1-name2)',   '$(main-guest1-mail2)', '$(main-guest1-phone2)',
      '$(main-guest1-address)', '$(main-guest1-coments)',
      '$(main-guest2-name1)',   '$(main-guest2-mail1)', '$(main-guest2-phone1)',
      '$(main-guest2-name2)',   '$(main-guest2-mail2)', '$(main-guest2-phone2)',
      '$(main-guest2-address)', '$(main-guest2-coments)',

      '$(dessert-cook-name1)',     '$(dessert-cook-mail1)',   '$(dessert-cook-phone1)',
      '$(dessert-cook-name2)',     '$(dessert-cook-mail2)',   '$(dessert-cook-phone2)',
      '$(dessert-cook-address)',   '$(dessert-cook-coments)',
      '$(dessert-guest1-name1)',   '$(dessert-guest1-mail1)', '$(dessert-guest1-phone1)',
      '$(dessert-guest1-name2)',   '$(dessert-guest1-mail2)', '$(dessert-guest1-phone2)',
      '$(dessert-guest1-address)', '$(dessert-guest1-coments)',
      '$(dessert-guest2-name1)',   '$(dessert-guest2-mail1)', '$(dessert-guest2-phone1)',
      '$(dessert-guest2-name2)',   '$(dessert-guest2-mail2)', '$(dessert-guest2-phone2)',
      '$(dessert-guest2-address)', '$(dessert-guest2-coments)',
    ],
    cursor: 0,
  }),
  props: [ 'value', 'snack' ],
  computed: {
    items() {
      return Object.keys(this.value);
    }
  },
  methods: {
    onImport(text) {
      try {
        const data = JSON.parse(text);
        this.$emit('input', {
          starter: data.starter,
          main: data.main,
          dessert: data.dessert
        });
      } catch (e) {
        this.$emit('update:snack', {
          visible: true,
          color: 'error',
          items: [ 'Error reading file', e ],
        });
      }
    },
    onExport() {
      downloadFile('mails.json', JSON.stringify(this.value));
    },
    onAddVariable(event) {
      copyTextToClipboard(event);
    },
    onInput(event) {
      let newVal = { ... this.value };
      newVal[this.choice] = event;
      this.$emit('input', newVal);
    },
  },
  template: `
    <v-tab-item>
      <v-card-text>
        <v-layout row wrap>
          <v-flex xs12>
            <v-file accept='.json' @input='onImport'>
              Import
              <v-icon right>backup</v-icon>
            </v-file>
            <v-btn @click='onExport'>
              Export
              <v-icon right>archive</v-icon>
            </v-btn>
          </v-flex>
          <v-flex md4 xs12 pa-1>
            <v-select v-model='choice' :items='items' label='Select Mail Type'>
            </v-select>
          </v-flex>
          <v-flex md4 xs12 pa-1>
            <v-select v-model='variable' :items='variables' @input='onAddVariable'>
              <template slot='selection' slot-scope='{ index }'>
                <span v-if='index === 0'>
                  Variables (Copy to Clipboard)
                </span>
              </template>
            </v-select>
          </v-flex>
          <v-flex xs12 pa-1>
            <v-textarea
              label="Mail Template"
              auto-grow
              v-bind:value='value[choice]'
              @input='onInput'>
            </v-textarea>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-tab-item>
  `,
});
