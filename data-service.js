import { getUserIDs } from "./data.js";

export const countUsers = () => getUserIDs().length;

// Helper: Get song display name
function getSongDisplayName(songId) {
    const song = getSong(songId);
    return song ? `${song.artist} - ${song.title}` : songId;
}

// Helper: Get song duration
function getSongDuration(songId) {
    const song = getSong(songId);
    return song ? song.duration_seconds : 0;
}

// Generic function to find most listened item by count or time
function findMostListened(events, keyFn, valueFn, useTime = false) {
    const counts = new Map();
    
    for (const event of events) {
        const key = keyFn(event);
        const value = useTime ? valueFn(event) : 1;
        
        if (!counts.has(key)) {
            counts.set(key, 0);
        }
        counts.set(key, counts.get(key) + value);
    }
    
    if (counts.size === 0) return null;
    
    let maxCount = -1;
    const maxItems = [];
    
    for (const [key, count] of counts) {
        if (count > maxCount) {
            maxCount = count;
            maxItems.length = 0;
            maxItems.push({ key, count });
        } else if (count === maxCount) {
            maxItems.push({ key, count });
        }
    }
    
    return { items: maxItems, count: maxCount };
}

// Q1: Most often listened to song (by count)
export function getMostListenedSongByCount(events) {
    const result = findMostListened(
        events,
        e => e.song_id,
        e => getSongDuration(e.song_id),
        false
    );
    
    if (!result) return null;
    
    return {
        songs: result.items.map(item => getSongDisplayName(item.key)),
        count: result.count
    };
}

// Q2: Most often listened to artist (by count)
export function getMostListenedArtistByCount(events) {
    const result = findMostListened(
        events,
        e => {
            const song = getSong(e.song_id);
            return song ? song.artist : null;
        },
        e => getSongDuration(e.song_id),
        false
    );
    
    if (!result) return null;
    
    return {
        artists: result.items.map(item => item.key),
        count: result.count
    };
}

// Q3: Most often listened to song on Friday nights (5pm - 4am)
export function getFridayNightSongByCount(events) {
    // Filter for Friday nights (Friday 5pm to Saturday 4am)
    const fridayNightEvents = events.filter(e => {
        const date = new Date(e.timestamp);
        const day = date.getDay(); // 5 = Friday, 6 = Saturday
        const hour = date.getHours();
        
        // Friday 17:00 (5pm) to Saturday 04:00 (4am)
        if (day === 5 && hour >= 17) return true;
        if (day === 6 && hour < 4) return true;
        return false;
    });
    
    if (fridayNightEvents.length === 0) return null;
    
    const result = findMostListened(
        fridayNightEvents,
        e => e.song_id,
        e => getSongDuration(e.song_id),
        false
    );
    
    if (!result) return null;
    
    return {
        songs: result.items.map(item => getSongDisplayName(item.key)),
        count: result.count
    };
}

// Q4 versions: By listening time
export function getMostListenedSongByTime(events) {
    const result = findMostListened(
        events,
        e => e.song_id,
        e => getSongDuration(e.song_id),
        true
    );
    
    if (!result) return null;
    
    return {
        songs: result.items.map(item => getSongDisplayName(item.key)),
        timeSeconds: result.count
    };
}

export function getMostListenedArtistByTime(events) {
    const result = findMostListened(
        events,
        e => {
            const song = getSong(e.song_id);
            return song ? song.artist : null;
        },
        e => getSongDuration(e.song_id),
        true
    );
    
    if (!result) return null;
    
    return {
        artists: result.items.map(item => item.key),
        timeSeconds: result.count
    };
}

export function getFridayNightSongByTime(events) {
    const fridayNightEvents = events.filter(e => {
        const date = new Date(e.timestamp);
        const day = date.getDay();
        const hour = date.getHours();
        
        if (day === 5 && hour >= 17) return true;
        if (day === 6 && hour < 4) return true;
        return false;
    });
    
    if (fridayNightEvents.length === 0) return null;
    
    const result = findMostListened(
        fridayNightEvents,
        e => e.song_id,
        e => getSongDuration(e.song_id),
        true
    );
    
    if (!result) return null;
    
    return {
        songs: result.items.map(item => getSongDisplayName(item.key)),
        timeSeconds: result.count
    };
}

// Q5: Longest streak of same song
export function getLongestStreak(events) {
    if (events.length === 0) return null;
    
    let maxStreak = 1;
    let currentStreak = 1;
    let maxSongId = events[0].song_id;
    
    for (let i = 1; i < events.length; i++) {
        if (events[i].song_id === events[i - 1].song_id) {
            currentStreak++;
            if (currentStreak > maxStreak) {
                maxStreak = currentStreak;
                maxSongId = events[i].song_id;
            }
        } else {
            currentStreak = 1;
        }
    }
    
    // Check if there are ties
    const tiedSongs = new Set();
    currentStreak = 1;
    
    for (let i = 1; i < events.length; i++) {
        if (events[i].song_id === events[i - 1].song_id) {
            currentStreak++;
            if (currentStreak === maxStreak) {
                tiedSongs.add(events[i].song_id);
            }
        } else {
            currentStreak = 1;
        }
    }
    
    // Add the first occurrence if it matches max
    if (maxStreak === 1) {
        // All songs have streak of 1, return first song
        return {
            songs: [getSongDisplayName(events[0].song_id)],
            length: 1
        };
    }
    
    // Check all songs that achieved max streak
    const songsWithMaxStreak = new Set();
    songsWithMaxStreak.add(maxSongId);
    
    currentStreak = 1;
    for (let i = 1; i < events.length; i++) {
        if (events[i].song_id === events[i - 1].song_id) {
            currentStreak++;
            if (currentStreak === maxStreak) {
                songsWithMaxStreak.add(events[i].song_id);
            }
        } else {
            currentStreak = 1;
        }
    }
    
    return {
        songs: Array.from(songsWithMaxStreak).map(id => getSongDisplayName(id)),
        length: maxStreak
    };
}

// Q6: Songs listened to every day
export function getEveryDaySongs(events) {
    if (events.length === 0) return null;
    
    // Group events by date
    const songsByDate = new Map();
    
    for (const event of events) {
        const date = new Date(event.timestamp);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!songsByDate.has(dateKey)) {
            songsByDate.set(dateKey, new Set());
        }
        songsByDate.get(dateKey).add(event.song_id);
    }
    
    const dates = Array.from(songsByDate.keys()).sort();
    if (dates.length === 0) return null;
    
    // Find songs that appear in every date
    const everyDaySongs = new Set(songsByDate.get(dates[0]));
    
    for (let i = 1; i < dates.length; i++) {
        const dateSongs = songsByDate.get(dates[i]);
        for (const song of everyDaySongs) {
            if (!dateSongs.has(song)) {
                everyDaySongs.delete(song);
            }
        }
    }
    
    if (everyDaySongs.size === 0) return null;
    
    return Array.from(everyDaySongs).map(id => getSongDisplayName(id));
}

// Q7: Top three genres by listens
export function getTopGenres(events) {
    const genreCounts = new Map();
    
    for (const event of events) {
        const song = getSong(event.song_id);
        if (!song) continue;
        
        const genre = song.genre;
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
    }
    
    if (genreCounts.size === 0) return null;
    
    const sorted = Array.from(genreCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([genre]) => genre);
    
    return sorted;
}

// Main function to get all analysis for a user
export function analyzeUser(userId) {
    const events = getListenEvents(userId);
    
    return {
        hasData: events.length > 0,
        mostListenedSongCount: getMostListenedSongByCount(events),
        mostListenedSongTime: getMostListenedSongByTime(events),
        mostListenedArtistCount: getMostListenedArtistByCount(events),
        mostListenedArtistTime: getMostListenedArtistByTime(events),
        fridayNightSongCount: getFridayNightSongByCount(events),
        fridayNightSongTime: getFridayNightSongByTime(events),
        longestStreak: getLongestStreak(events),
        everyDaySongs: getEveryDaySongs(events),
        topGenres: getTopGenres(events)
    };
}