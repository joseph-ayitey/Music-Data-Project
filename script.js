// This is a placeholder file which shows how you can access functions defined in other files.
// It can be loaded into index.html.
// You can delete the contents of the file once you have understood how it works.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

import { getUserIDs } from "./data.js"
import { countUsers,  analyzeUser } from "./data-service.js";

window.onload = function () {
  document.querySelector("body").innerText = `There are ${countUsers()} users`;
};

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

function createSection(title, content) {
    const section = document.createElement('section');
    section.className = 'result-section';
    
    const heading = document.createElement('h2');
    heading.textContent = title;
    section.appendChild(heading);
    
    if (typeof content === 'string') {
        const p = document.createElement('p');
        p.textContent = content;
        section.appendChild(p);
    } else if (Array.isArray(content)) {
        const ul = document.createElement('ul');
        content.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            ul.appendChild(li);
        });
        section.appendChild(ul);
    } else {
        const p = document.createElement('p');
        p.textContent = content;
        section.appendChild(p);
    }
    
    return section;
}