// data-service.test.js
import assert from "node:assert";
import test from "node:test";
import { 
    getMostListenedSongByCount,
    getMostListenedArtistByCount,
    getFridayNightSongByCount,
    getMostListenedSongByTime,
    getMostListenedArtistByTime,
    getFridayNightSongByTime,
    getLongestStreak,
    getEveryDaySongs,
    getTopGenres,
    analyzeUser,
    countUsers
} from "./data-service.js";

import { getListenEvents } from "./data.js";

// Test countUsers
test("countUsers returns 4", () => {
    assert.equal(countUsers(), 4);
});

// Test with real data from data.js
test("Most listened song by count works with real data", () => {
    const events = getListenEvents("1");
    const result = getMostListenedSongByCount(events);
    
    assert.ok(result, "Should return a result");
    assert.ok(Array.isArray(result.songs), "Songs should be an array");
    assert.ok(result.count > 0, "Count should be greater than 0");
    assert.ok(result.songs[0].includes("-"), "Song name should include artist - title format");
});

test("Most listened artist by count works with real data", () => {
    const events = getListenEvents("1");
    const result = getMostListenedArtistByCount(events);
    
    assert.ok(result, "Should return a result");
    assert.ok(Array.isArray(result.artists), "Artists should be an array");
    assert.ok(result.count > 0, "Count should be greater than 0");
});

test("Friday night song returns null when no Friday night listens", () => {
    // Create events with no Friday night (5pm Friday - 4am Saturday)
    const events = [
        { timestamp: "2024-08-05T10:00:00", song_id: "song-1" }, // Monday 10am
        { timestamp: "2024-08-06T14:00:00", song_id: "song-2" }, // Tuesday 2pm
    ];
    
    const result = getFridayNightSongByCount(events);
    assert.equal(result, null);
});

test("Friday night song finds Friday night listens", () => {
    // Friday, August 2, 2024 at 10 PM (Friday night)
    const events = [
        { timestamp: "2024-08-02T22:00:00", song_id: "song-1" }, // Friday 10pm
        { timestamp: "2024-08-02T23:00:00", song_id: "song-1" }, // Friday 11pm
        { timestamp: "2024-08-03T02:00:00", song_id: "song-2" }, // Saturday 2am
    ];
    
    const result = getFridayNightSongByCount(events);
    assert.ok(result, "Should find Friday night songs");
    assert.equal(result.count, 2);
    assert.ok(result.songs[0].includes("I Got Love"));
});

test("Longest streak calculates consecutive plays correctly", () => {
    const events = [
        { timestamp: "2024-08-01T10:00:00", song_id: "song-1" },
        { timestamp: "2024-08-01T10:05:00", song_id: "song-1" },
        { timestamp: "2024-08-01T10:10:00", song_id: "song-1" },
        { timestamp: "2024-08-01T10:15:00", song_id: "song-2" },
        { timestamp: "2024-08-01T10:20:00", song_id: "song-2" },
    ];
    
    const result = getLongestStreak(events);
    assert.ok(result);
    assert.equal(result.length, 3);
    assert.ok(result.songs[0].includes("I Got Love"));
});

test("Longest streak handles ties", () => {
    const events = [
        { timestamp: "2024-08-01T10:00:00", song_id: "song-1" },
        { timestamp: "2024-08-01T10:05:00", song_id: "song-1" },
        { timestamp: "2024-08-01T10:10:00", song_id: "song-2" },
        { timestamp: "2024-08-01T10:15:00", song_id: "song-2" },
    ];
    
    const result = getLongestStreak(events);
    assert.ok(result);
    assert.equal(result.length, 2);
    assert.equal(result.songs.length, 2);
});

test("Every day songs returns null when no songs on all days", () => {
    const events = [
        { timestamp: "2024-08-01T10:00:00", song_id: "song-1" },
        { timestamp: "2024-08-02T10:00:00", song_id: "song-2" },
    ];
    
    const result = getEveryDaySongs(events);
    assert.equal(result, null);
});

test("Every day songs returns songs heard every day", () => {
    const events = [
        { timestamp: "2024-08-01T10:00:00", song_id: "song-1" },
        { timestamp: "2024-08-02T10:00:00", song_id: "song-1" },
        { timestamp: "2024-08-01T11:00:00", song_id: "song-2" },
    ];
    
    const result = getEveryDaySongs(events);
    assert.ok(result);
    assert.equal(result.length, 1);
    assert.ok(result[0].includes("I Got Love"));
});

test("Top genres returns sorted list", () => {
    const events = getListenEvents("1");
    const result = getTopGenres(events);
    
    assert.ok(result);
    assert.ok(Array.isArray(result));
    assert.ok(result.length > 0);
});

test("Analyze user returns complete analysis for user with data", () => {
    const result = analyzeUser("1");
    
    assert.equal(result.hasData, true);
    assert.ok(result.mostListenedSongCount);
    assert.ok(result.mostListenedArtistCount);
    assert.ok(result.longestStreak);
    assert.ok(result.topGenres);
});

test("Analyze user handles user with no data", () => {
    const result = analyzeUser("4");
    assert.equal(result.hasData, false);
});

test("User 1 has expected most listened song by count", () => {
    const events = getListenEvents("1");
    const result = getMostListenedSongByCount(events);
    
    assert.ok(result.songs.some(s => s.includes("When Your Mind's Made Up")), 
        `Expected "When Your Mind's Made Up" but got ${result.songs.join(", ")}`);
});

test("User 1 has expected most listened artist by count", () => {
    const events = getListenEvents("1");
    const result = getMostListenedArtistByCount(events);
    
    assert.ok(result.artists.includes("Frank Turner"),
        `Expected "Frank Turner" but got ${result.artists.join(", ")}`);
});