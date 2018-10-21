Vue.component('v-file', {
  methods: {
  },
  props: ['accept', 'flat', 'icon'],
  methods: {
    onPickFile (e) {
      this.$refs.elem.click()
    },
    onDragOver(e) {
      e.preventDefault();
    },
    onDrop(e) {
      e.preventDefault();
      this.onFilePicked(e);
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
    <v-btn :icon='icon' :flat='flat'
      @click='onPickFile' @dragover='onDragOver' @drop='onDrop'>
      <slot></slot>
      <input
        type='file'
        :accept='accept'
        ref='elem'
        @change='onFilePicked'
        style='position: absolute; left: -99999px'>
      </input>
    </v-btn>
  `
});

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
  } catch (err) {
  }

  document.body.removeChild(textArea);
}
function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text);
}
