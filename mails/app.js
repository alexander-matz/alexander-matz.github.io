
Vue.component('v-file', {
  methods: {
  },
  props: ['accept', 'text'],
  methods: {
    onPickFile (e) {
      this.$refs.elem.click()
    },
    onFilePicked (e) {
      const files = e.target.files || e.dataTransfer.files;
      if (files && files[0]) {
        let filename = files[0].name;
        const fileReader = new FileReader();
        fileReader.addEventListener('load', () => {
          this.$emit('input', fileReader.result);
        });
        fileReader.readAsText(files[0]);
      }
      e.target.value = null;
    },
  },
  template: `
    <div>
      <v-btn @click='onPickFile'> {{ text }} </v-btn>
      <input
        type='file'
        :accept='accept'
        ref='elem'
        @change='onFilePicked'
        style='position: absolute; left: -99999px'>
      </input>
    </div>
  `
});

Vue.component('step-mails', {
  data: () => ({
    page: 0,
    error: false,
    msg: '',
  }),
  props: ['mails', 'subject', 'accept'],
  methods: {
    onImport (e) {
      let data;
      try {
        data = JSON.parse(e);
      } catch (e) {
        console.log(e);
        this.msg = 'Unable to parse JSON';
        this.error = true;
        return;
      }
      if (!data.mails) {
        this.msg = 'Invalid format, expected field "mails"';
        this.error = true;
        return;
      }
      for (let i = 0; i < data.mails.length; ++i) {
        data.mails[i].recipients = data.mails[i].recipients.join(', ');
      }
      this.$emit('input', { target: { value: data.mails } } );
      this.page = 1;
    }
  },
  template: `
    <v-card>
      <v-card-text>
        <v-layout row wrap>
          <v-flex md2 xs12>
            <v-file accept='*.json' text='Import E-mails' v-on:input='onImport'></v-file>
            <v-snackbar v-model='error' color='error'>
                Error: {{ msg }}
            </v-snackbar>
          </v-flex>
          <v-flex md10 xs12 v-if='mails.length > 0'>
            <v-pagination v-model='page' :length='mails.length' total-visible=10>
            </v-pagination>
          </v-flex>
        </v-layout>
        <div v-if='(page-1) >= 0 && (page-1) < mails.length'>
          <v-text-field label='Recipients' v-model='mails[page-1].recipients'>
          </v-text-field>
          <v-text-field label='Subject' v-model='mails[page-1].subject'>
          </v-text-field>
          <v-textarea label='Message' v-model='mails[page-1].message' auto-grow>
          </v-textarea>
        </div>
        <div v-else>
          no emails imported
        </div>
      </v-card-text>
    </v-card>
  `
});

Vue.component('step-send', {
  data: () => ({
    busy: false,
    testAddress: '',
    sender: '',
    token: '',
    error: false,
    msg: '',
    good: false,
    log: [],
    notSent: 0,
    rules: {
      required: value => !!value || 'Required',
      email: value => /^.+@.+[.].+$/.exec(value) != null || 'Not an E-Mail address',
    }
  }),
  props: [ 'mails' ],
  computed: {
    nmails() {
      return this.mails.length;
    },
    ready() {
      return this.token != '' && this.sender != ''
    },
  },
  methods: {
    onSentTest (result) {
      console.log(result);
      if (result == 'OK') {
        this.good = true;
      } else {
        this.msg = `Error: ${result}`;
        this.error = true;
      }
    },
    testSend (event) {
      const sender = this.sender;
      const receiver = this.testAddress;

      Email.send(
        sender,
        receiver,
        'it works!',
        'server configuration is good',
        { token: this.token,
          callback: this.onSentTest,
        }
      );
    },
    sendAll (event) {
      const nmails = this.mails.length;
      const mails = this.mails;
      const sender = this.sender;

      let remaining = nmails;
      let ok = 0;

      const tick = (result) => {
        remaining -= 1;
        if (result == 'OK') {
          ok += 1;
        } else {
          console.log(result);
        }
        if (remaining == 0) {
          this.busy = false;
          if (ok == nmails) {
            this.good = true;
            return;
          } else {
            this.msg = `failed to send ${nmails-ok} mails`;
            this.error = true;
            return;
          }
        }
      };

      this.busy = true;
      for (let i = 0; i < nmails; ++i) {
        const recipients = mails[i].recipients;
        const subject = mails[i].subject;
        const msgbody = mails[i].message;
        /*
        setTimeout(() => {
          tick('OK');
        }, 300);
        */
        Email.send(
          sender,
          recipients,
          subject,
          msgbody,
          {
            token: this.token,
            callback: tick,
          }
        );
      }
    },
  },
  template: `
    <v-card>
      <v-card-text>
        <v-snackbar v-model='error' color='error'>
            Error: {{ msg }}
        </v-snackbar>
        <v-snackbar v-model='good' color='success'>
            Success
        </v-snackbar>
        <v-layout row wrap>
          <v-flex md4 xs12>
            <v-text-field v-model='token' label='SmtpJS token' :rules='[rules.required]'>
            </v-text-field>
          </v-flex>
          <v-flex md8 xs12 pt-4>
            check out <a href="https://www.smtpjs.com">SmtpJs.com</a> for infos and to create
                a token.
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex md4 xs12>
            <v-text-field v-model='sender' label='Sender address' :rules='[rules.required, rules.email]'>
            </v-text-field>
          </v-flex>
          <v-flex md4 xs12>
            <v-text-field v-model='testAddress' label='Test E-Mail Address' :rules='[rules.email]'>
            </v-text-field>
          </v-flex>
          <v-flex md4 xs12>
            <v-btn @click='testSend'>
              Send Test E-Mail
            </v-btn>
          </v-flex>
        </v-layout>
        <v-divider></v-divider>
        <v-layout row wrap v-if='nmails > 0'>
          <v-flex xs12 mt-4>
            <v-btn block @click='sendAll' :disabled='!ready' v-if='!busy'>
              Send {{ nmails }} E-Mails
            </v-btn>
            <v-btn block @click='sendAll' disabled v-else>
              <v-progress-circular indeterminate color='primary' :size="20">
              </v-progress-circular>
            </v-btn>
          </v-flex>
        </v-layout>
        <v-layout row wrap v-else>
          <v-flex xs12 mt-4>
            no emails imported
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
  `
});

new Vue({                                                                   
  el: '#app',                                                               
  data: {                                                                   
    step: 0,
    mails: [],
  },                                                                        
})                                                                          
