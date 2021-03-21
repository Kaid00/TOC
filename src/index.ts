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

/////////////
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
    // view panel Object
    const panels = await joplin.views.panels.create('1');
    // const view = await (panels as any).create();

    // Sets initial content while the TOC is being created
    await joplin.views.panels.setHtml(panels, 'Loading......');
    await joplin.views.panels.addScript(panels, './webview.css');
    await joplin.views.panels.addScript(panels, './webview.js');

    // Updating TOC view
    async function updateTocView() {
      // getting current note
      const note = await joplin.workspace.selectedNote();
      slugs = {};

      // if no note  is currently selected
      if (!note) {
        await joplin.views.panels.setHtml(
          panels,
          'Please select a note to view the table of content'
        );
      }

      // when a note is selected
      else {
        const headers = getNoteheaders(note.body);

        // creating the html for each Header
        const headerHtml = [];
        for (const header of headers) {
          const slug = headerSlug(header.text);

          headerHtml.push(`
				<p class = "toc-item" style = "padding-left:${(header.level - 1) * 15}px">
					<a id = "toc-item-linked" class = "toc-item-link" href = "#" data-slug = "${escapeHtml(
            slug
          )}">
						${escapeHtml(header.text)}
					</a>
				</p>
			`);
        }

        // Insert all the headers in a div container and set the WebView HTML
        await joplin.views.panels.setHtml(
          panels,
          `
			<div class = "container>
				${headerHtml.join('\n')}
			</div>
		`
        );
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
