let currentPage = 1;
const songsPerPage = 40;
let songData = [];
let currentIndex = 0;
const CACHE_TIME = 24 * 60 * 60 * 1000;

import { playSong } from "./script.js";

// Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Load cached songs 
function loadCachedSongs() {
    const cachedData = localStorage.getItem("cachedSongs");
    const lastFetchTime = localStorage.getItem("lastFetchTime");

    if (cachedData && lastFetchTime && (Date.now() - lastFetchTime < CACHE_TIME)) {
        songData = JSON.parse(cachedData);
        loadMoreSongs();
        return true;
    }
    return false;
}

async function fetchSongs() {
    try {
        const artists = ["Anuv Jain", "Arijit", "Indresh","KK"];

        // Fetch songs in parallel
        const responses = await Promise.all(
            artists.map(artist =>
                fetch(`/song-details?artist=${encodeURIComponent(artist)}&page=${currentPage}&limit=${songsPerPage}`)
                    .then(res => res.json())
                    .catch(() => [])
            )
        );

        let songs = responses.flat();
        if (!songs.length) return;

        // Shuffle and merge new songs
        songData = shuffleArray([...songData, ...songs]);
       // console.log(songData);

        // Store in localStorage with a timestamp
        localStorage.setItem("cachedSongs", JSON.stringify(songData));
        localStorage.setItem("lastFetchTime", Date.now());

        loadMoreSongs();
        currentPage++;
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}


function loadMoreSongs() {
    if (currentIndex >= songData.length) return;

    const nextSongs = songData.slice(currentIndex, currentIndex + songsPerPage);
    currentIndex += nextSongs.length;

    if (!nextSongs.length) return;

    const artistSection = document.querySelector('.artist');
    const fragment = document.createDocumentFragment(); // Batch rendering

    nextSongs.forEach(song => {
        if (!song || !song.songLink || !song.coverImage || !song.title) return;

        const songCard = document.createElement('a');
        songCard.classList.add('card-link');
        songCard.href = "#";
        songCard.style.pointerEvents = "auto"; 

        const songElement = document.createElement('div');
        songElement.classList.add('card', 'circle');

        const img = document.createElement('img');
        img.src = song.coverImage;
        img.alt = song.title;
        img.loading = "lazy"; // Defer image loading

        const songName = document.createElement('p');
        songName.classList.add('song-name');
        songName.textContent = song.title || "Untitled Song";

        songElement.appendChild(img);
        songCard.appendChild(songElement);
        songCard.appendChild(songName);
        fragment.appendChild(songCard);

        // Play song on click 
        songCard.addEventListener("click", (event) => {
            event.preventDefault(); 
            event.stopPropagation();
           
            playSong({
                id: song.id,
                name: song.title,
                album: song.album,
                thumbnail: song.coverImage,
                audioUrls: [{ url: song.audioLinks?.[0]?.url || song.audioLinks.url }]
            });
        });
    });

    artistSection.appendChild(fragment); 
}

if (!loadCachedSongs()) {
    fetchSongs();
}




