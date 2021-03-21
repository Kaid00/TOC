import joplin from 'api';
const uslug = require('uslug');

// Escaping HTML
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Adding slugs to the header
let slugs = {};
function headerSlug(headerText) {
  const s = uslug(headerText);
  let num = slugs[s] ? slugs[s] : 1;
  const output = [s];
  if (num > 1) {
    output.push(num);
  }
  slugs[s] = num + 1;
  return output.join('-');
}

// Getting all Headers within the note
/***
 * @param {string} noteBody From the selected note
 */

function getNoteheaders(noteBody: string) {
  const headers = [];
  const lines = noteBody.split('\n');

  // loop through lines searching for headers
  for (const line of lines) {
    // the REG matches for each line one or more: # chars, any white space char and any char excluding line breaks
    const match = line.match(/^(#+)\s(.*)*/);

    // header not found
    if (!match) {
      continue;
    }

    // header found
    headers.push({
      level: match[1].length,
      text: match[2],
    });
  }
  return headers;
}

// Registering the plugin
joplin.plugins.register({
  // onStart function runs the initialisation code
  onStart: async function () {
    console.info('Toc plugin');

    // Updating TOC view
    async function updateTocView() {
      // getting current note
      const note = await joplin.workspace.selectedNote();

      // if no note  is currently selected
      if (!note) {
        console.log('No note is selected');
      }

      // when a note is selected
      else {
        const headers = getNoteheaders(note.body);
        console.log('Note content has changed! New note headers are', headers);
      }
    }

    //  update the TOC when the user selects a different note
    await joplin.workspace.onNoteSelectionChange(() => {
      updateTocView();
    });

    //  update the TOC when the note content is changed
    await joplin.workspace.onNoteChange(() => {
      updateTocView();
    });

    //  update TOC view when the plugin starts
    updateTocView();
  },
});
