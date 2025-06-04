const elements = {
    playPauseBtn: document.getElementById("playPauseBtn"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    progressBar: document.getElementById("progressBar"),
    volumeBar: document.getElementById("volumeBar"),
    muteBtn: document.getElementById("muteBtn"),
    songNameElement: document.getElementById("song-name"),
    audioPlayer: document.getElementById("audioPlayer"),
    resultsContainer: document.getElementById("search-results"),
    currentTimeElement: document.getElementById("currentTime"),
    shuffleBtn: document.getElementById("shuffleBtn"),
    repeatBtn: document.getElementById("repeatBtn"),
    favIcon: document.getElementById('fav'),
    searchInput: document.getElementById("searchInput")
};

// Helper Function
function getCurrentSong() {
    let song = state.songList[state.currentSongIndex];
    if (!song || !song.id) {
        console.warn("Fallback to localStorage for current song");
        const lastPlayed = localStorage.getItem("lastPlayedSong");
        if (lastPlayed) {
            song = JSON.parse(lastPlayed);
        }
    }
    return song;
}

// State Variables
const state = {
    isFavorited: false,
    currentSongIndex: 0,
    songList: [],
    isShuffle: false,
    isRepeat: false
};

// Debounce Function
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

// Fetch Songs from API
const searchSongs = async (query) => {
    try {
        const response = await fetch(`/song-details?song=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Failed to fetch songs");
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("Expected an array but got:", data);
            return;
        }

        state.songList = data.map(song => ({
            id: song.id,
            name: song.title,
            album: song.album || "Unknown Album",
            thumbnail: song.coverImage || "/assets/radha_krishna.png",
            audioUrl: song.audioLinks?.url || ""
        }));

        renderSearchResults();
    } catch (error) {
        console.error("Error fetching search results:", error);
        if (elements.resultsContainer) {
            elements.resultsContainer.innerHTML = "<div>⚠️ No songs found for your search query</div>";
        }
    }
};

// Search Results
const renderSearchResults = () => {
    const { songList } = state;
    const { resultsContainer } = elements;

    if (!resultsContainer) {
        console.error("resultsContainer is undefined. Cannot render search results.");
        return;
    }

    resultsContainer.innerHTML = songList.length === 0 ? "<div>No results found</div>" : "";

    songList.slice(0, 20).forEach((song, index) => {
        const resultItem = document.createElement("div");
        resultItem.classList.add("search-result");
        resultItem.innerHTML = `
        <div>
            <p class="song-title">${song.name}</p>
            <p class="song-album">${song.album}</p>
        </div>
        <img src="${song.thumbnail}" alt="${song.name}" class="song-img">
    `;

        resultItem.addEventListener("click", () => playSong(song, index)); // Pass index here
        resultsContainer.appendChild(resultItem);
    });


    resultsContainer.style.display = songList.length > 0 ? "block" : "none";
};


// Play Song 
export function playSong(song, index = null) {
    if (!song) {
        console.error("Invalid song data", song);
        alert("Invalid song data. Please try again.");
        return;
    }

    const audioUrl = song.audioUrls?.[0]?.url || song.audioUrl;

    if (!audioUrl) {
        console.error("No valid audio URL found. Here is the song data:", song);
        alert("No valid audio URL found for this song.");
        return;
    }

    // Save current song to localStorage
    localStorage.setItem("lastPlayedSong", JSON.stringify(song));

    // Update UI and play the song
    document.title = `${song.name} | WaveTune 🌊`;
    elements.songNameElement.textContent = song.name;

    const imgElement = document.querySelector(".music-player img");
    imgElement.src = song.thumbnail || "/assets/radha_krishna.png";
    imgElement.setAttribute("draggable", "false");
    imgElement.oncontextmenu = (e) => e.preventDefault();

    elements.songNameElement.style.animation = 'none';
    setTimeout(() => elements.songNameElement.style.animation = 'marquee 10s linear infinite', 12);

    elements.audioPlayer.src = audioUrl;
    elements.audioPlayer.load();
    elements.audioPlayer.play();

    elements.playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

    // Fix: use provided index if available
    if (index !== null && index >= 0) {
        state.currentSongIndex = index;
    } else {
        state.currentSongIndex = state.songList.findIndex(s => s.id === song.id);
    }

    updateProgressBar();
    checkIfFavorite(song.id);

}

// Control through earbuds and media keys
if ('mediaSession' in navigator) {
    const song = getCurrentSong();

    if (song && song.name) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: song.album || "Unknown Album",
            artwork: [
                { src: song.thumbnail, sizes: '512x512', type: 'image/png' }
            ]
        });
    } else {
        console.warn("No valid song to set mediaSession metadata");
    }

    navigator.mediaSession.setActionHandler('play', () => {
        elements.audioPlayer.play();
        elements.playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    });

    navigator.mediaSession.setActionHandler('pause', () => {
        elements.audioPlayer.pause();
        elements.playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
        elements.prevBtn.click();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
        elements.nextBtn.click();
    });
}



// Update Progress Bar
const updateProgressBar = () => {
    const { audioPlayer, progressBar } = elements;
    if (!isNaN(audioPlayer.duration) && audioPlayer.duration > 0) {
        const progressPercentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.value = progressPercentage;
        progressBar.style.setProperty('--progress', `${progressPercentage}%`);
    }
};

// Time Formatting
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

// Update Time Display
const updateTimeDisplay = () => {
    elements.currentTimeElement.textContent = formatTime(elements.audioPlayer.currentTime);
};

// Event Listeners
elements.playPauseBtn.addEventListener("click", () => {
    const { audioPlayer, playPauseBtn } = elements;
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
});

elements.nextBtn.addEventListener("click", () => {
    if (state.songList.length > 0) {
        state.currentSongIndex = state.isShuffle ? Math.floor(Math.random() * state.songList.length) : (state.currentSongIndex + 1) % state.songList.length;
        playSong(state.songList[state.currentSongIndex]);
    }
});

elements.prevBtn.addEventListener("click", () => {
    if (state.songList.length > 0) {
        state.currentSongIndex = (state.currentSongIndex - 1 + state.songList.length) % state.songList.length;
        playSong(state.songList[state.currentSongIndex]);
    }
});

elements.repeatBtn.addEventListener("click", () => {
    state.isRepeat = !state.isRepeat;
    elements.repeatBtn.classList.toggle("active", state.isRepeat);
});

elements.audioPlayer.addEventListener("ended", () => {
    if (state.isRepeat) {
        playSong(state.songList[state.currentSongIndex]);
    } else {
        elements.nextBtn.click();
    }
});

elements.muteBtn.addEventListener("click", () => {
    elements.audioPlayer.muted = !elements.audioPlayer.muted;

    // If manually muted, set volume bar to 0 visually but retain actual volume
    if (elements.audioPlayer.muted) {
        elements.muteBtn.innerHTML = '<i class="fa-solid fa-volume-mute"></i>';
    } else {
        elements.muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    }
});

elements.volumeBar.addEventListener("input", () => {
    const volume = elements.volumeBar.value / elements.volumeBar.max;
    elements.audioPlayer.volume = volume;
    elements.volumeBar.style.setProperty('--volume', `${volume * 100}%`);

    // Sync mute state with volume
    if (volume === 0) {
        elements.audioPlayer.muted = true;
        elements.muteBtn.innerHTML = '<i class="fa-solid fa-volume-mute"></i>';
    } else {
        elements.audioPlayer.muted = false;
        elements.muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    }
});

elements.progressBar.addEventListener("input", () => {
    if (!isNaN(elements.audioPlayer.duration)) {
        elements.audioPlayer.currentTime = (elements.progressBar.value / 100) * elements.audioPlayer.duration;
    }
});

elements.shuffleBtn.addEventListener("click", () => {
    state.isShuffle = !state.isShuffle;
    elements.shuffleBtn.classList.toggle("active", state.isShuffle);
});

elements.searchInput.addEventListener("input", debounce((e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
        searchSongs(query);
    } else {
        elements.resultsContainer.innerHTML = "<div>Start typing to search...</div>";
        elements.resultsContainer.style.display = "none";
    }
}, 300));

elements.audioPlayer.addEventListener("timeupdate", () => {
    updateProgressBar();
    updateTimeDisplay();
});


window.addEventListener("DOMContentLoaded", () => {
    const lastPlayed = localStorage.getItem("lastPlayedSong");
    if (lastPlayed) {
        const song = JSON.parse(lastPlayed);

        // Don't autoplay; just set up the song UI and audio source
        const audioUrl = song.audioUrls?.[0]?.url || song.audioUrl;
        if (audioUrl) {
            elements.audioPlayer.src = audioUrl;
            document.title = `${song.name} | WaveTune 🌊`;
            elements.songNameElement.textContent = song.name;

            const imgElement = document.querySelector(".music-player img");
            imgElement.src = song.thumbnail || "/assets/radha_krishna.png";
            imgElement.setAttribute("draggable", "false");
            imgElement.oncontextmenu = (e) => e.preventDefault();

            elements.songNameElement.style.animation = 'none';
            setTimeout(() => elements.songNameElement.style.animation = 'marquee 10s linear infinite', 12);

            elements.playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>'; // Set to play icon
            state.currentSongIndex = state.songList.findIndex(s => s.id === song.id);
            if (state.currentSongIndex === -1) {
                state.songList.unshift(song); // Ensure songList contains this song
                state.currentSongIndex = 0;
            }

            checkIfFavorite(song.id);
        }
    }
});


// Check if Song is Favorited
const checkIfFavorite = async (songId) => {
    try {
        const response = await fetch(`/is-favorite?songId=${encodeURIComponent(songId)}`);
        if (!response.ok) throw new Error("Failed to fetch favorite status");
        const data = await response.json();

        state.isFavorited = data.isFavorite;
        elements.favIcon.classList.toggle("fa-solid", state.isFavorited);
        elements.favIcon.classList.toggle("fa-regular", !state.isFavorited);
        elements.favIcon.classList.toggle("clicked", state.isFavorited);
    } catch (error) {
        console.error("Error checking favorite status:", error);
    }
};


elements.favIcon.addEventListener("click", async () => {
    const currentSong = getCurrentSong();

    if (!currentSong || !currentSong.id) {
        console.error("No valid song selected");
        return;
    }

    // Flip the value (toggle)
    state.isFavorited = !state.isFavorited;

    // Update heart icon UI
    elements.favIcon.classList.toggle("clicked", state.isFavorited);
    elements.favIcon.classList.toggle("fa-regular", !state.isFavorited);
    elements.favIcon.classList.toggle("fa-solid", state.isFavorited);

    try {
        // Send request to backend
        const endpoint = state.isFavorited ? "/add-to-favorites" : "/remove-from-favorites";
        const body = state.isFavorited ? { song: currentSong } : { songId: currentSong.id };

        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const result = await response.json();
        console.log(result.message);
    } catch (error) {
        console.error("Error updating favorites:", error);
    }
});



