// This is a placeholder file which shows how you can access functions defined in other files.
// It can be loaded into index.html.
// You can delete the contents of the file once you have understood how it works.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

import { getUserIDs } from "./data.js"
import { countUsers,  analyzeUser } from "./data-service.js";



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

function displayResults(userId) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    
    const analysis = analyzeUser(userId);
    
    if (!analysis.hasData) {
        const msg = document.createElement('p');
        msg.textContent = "This user didn't listen to any songs.";
        resultsContainer.appendChild(msg);
        return;
    }
// Q1: Most listened song (count)
    if (analysis.mostListenedSongCount) {
        const songs = analysis.mostListenedSongCount.songs;
        const count = analysis.mostListenedSongCount.count;
        const content = songs.length === 1 
            ? `${songs[0]} (${count} listens)`
            : songs.map(s => `${s} (${count} listens)`).join(', ');
        resultsContainer.appendChild(createSection('Most listened song (by count)', content));
    }
    
    // Most listened song (time)
    if (analysis.mostListenedSongTime) {
        const songs = analysis.mostListenedSongTime.songs;
        const time = analysis.mostListenedSongTime.timeSeconds;
        const content = songs.length === 1
            ? `${songs[0]} (${formatTime(time)})`
            : songs.map(s => `${s} (${formatTime(time)})`).join(', ');
        resultsContainer.appendChild(createSection('Most listened song (by time)', content));
    }
    
    // Q2: Most listened artist (count)
    if (analysis.mostListenedArtistCount) {
        const artists = analysis.mostListenedArtistCount.artists;
        const count = analysis.mostListenedArtistCount.count;
        const content = artists.length === 1
            ? `${artists[0]} (${count} listens)`
            : artists.map(a => `${a} (${count} listens)`).join(', ');
        resultsContainer.appendChild(createSection('Most listened artist (by count)', content));
    }
    
    // Most listened artist (time)
    if (analysis.mostListenedArtistTime) {
        const artists = analysis.mostListenedArtistTime.artists;
        const time = analysis.mostListenedArtistTime.timeSeconds;
        const content = artists.length === 1
            ? `${artists[0]} (${formatTime(time)})`
            : artists.map(a => `${a} (${formatTime(time)})`).join(', ');
        resultsContainer.appendChild(createSection('Most listened artist (by time)', content));
    }
    
    // Q3: Friday night song (count) - only show if exists
    if (analysis.fridayNightSongCount) {
        const songs = analysis.fridayNightSongCount.songs;
        const count = analysis.fridayNightSongCount.count;
        const content = songs.length === 1
            ? `${songs[0]} (${count} listens)`
            : songs.map(s => `${s} (${count} listens)`).join(', ');
        resultsContainer.appendChild(createSection('Most listened song on Friday night (by count)', content));
    }
    
    // Friday night song (time) - only show if exists
    if (analysis.fridayNightSongTime) {
        const songs = analysis.fridayNightSongTime.songs;
        const time = analysis.fridayNightSongTime.timeSeconds;
        const content = songs.length === 1
            ? `${songs[0]} (${formatTime(time)})`
            : songs.map(s => `${s} (${formatTime(time)})`).join(', ');
        resultsContainer.appendChild(createSection('Most listened song on Friday night (by time)', content));
    }
    
    // Longest streak
    if (analysis.longestStreak) {
        const songs = analysis.longestStreak.songs;
        const length = analysis.longestStreak.length;
        const content = songs.length === 1
            ? `${songs[0]} (length: ${length})`
            : songs.map(s => `${s} (length: ${length})`).join(', ');
        resultsContainer.appendChild(createSection('Longest streak of same song', content));
    }
    
    // Every day songs - only show if exists
    if (analysis.everyDaySongs && analysis.everyDaySongs.length > 0) {
        resultsContainer.appendChild(createSection('Songs listened to every day', analysis.everyDaySongs));
    }
    
    //  Top genres
    if (analysis.topGenres && analysis.topGenres.length > 0) {
        const genreCount = analysis.topGenres.length;
        const title = genreCount === 1 ? 'Top genre' : 
                      genreCount === 2 ? 'Top 2 genres' : 
                      genreCount === 3 ? 'Top 3 genres' : 
                      `Top ${genreCount} genres`;
        resultsContainer.appendChild(createSection(title, analysis.topGenres));
    }
}
 

function init() {
    const userSelect = document.getElementById('user-select');
    const resultsContainer = document.getElementById('results');
    
    // Populate dropdown
    const users = getUserIDs();
    users.forEach(userId => {
        const option = document.createElement('option');
        option.value = userId;
        option.textContent = userId;
        userSelect.appendChild(option);
    });
    
    // Handle selection
    userSelect.addEventListener('change', (e) => {
        const userId = e.target.value;
        if (userId) {
            displayResults(userId);
        } else {
            resultsContainer.innerHTML = '';
        }
    });
}

window.addEventListener('DOMContentLoaded', init);