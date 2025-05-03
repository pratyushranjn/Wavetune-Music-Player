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
            elements.resultsContainer.innerHTML = "<div>⚠️ No songs found for your search query.</div>";
        }
    }
};

// Render Search Results
const renderSearchResults = () => {
    const { songList } = state;
    const { resultsContainer } = elements;

    if (!resultsContainer) {
        console.error("resultsContainer is undefined. Cannot render search results.");
        return;
    }

    resultsContainer.innerHTML = songList.length === 0 ? "<div>No results found</div>" : "";

    songList.slice(0, 20).forEach(song => {
        const resultItem = document.createElement("div");
        resultItem.classList.add("search-result");
        resultItem.innerHTML = `
            <div>
                <p class="song-title">${song.name}</p>
                <p class="song-album">${song.album}</p>
            </div>
            <img src="${song.thumbnail}" alt="${song.name}" class="song-img">
        `;

        resultItem.addEventListener("click", () => playSong(song));
        resultsContainer.appendChild(resultItem);
    });

    resultsContainer.style.display = songList.length > 0 ? "block" : "none";
};

// Play Song 
export function playSong(song) {
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

    // Update UI and play the song
    document.title = `${song.name} | WaveTune 🌊`;
    
    elements.songNameElement.textContent = song.name;
    const imgElement = document.querySelector(".music-player img");
    imgElement.src = song.thumbnail || thumbnail;
    imgElement.setAttribute("draggable", "false"); 
    imgElement.oncontextmenu = (e) => e.preventDefault(); 

    elements.songNameElement.style.animation = 'none';
    setTimeout(() => elements.songNameElement.style.animation = 'marquee 10s linear infinite', 12);

    // Set the audio URL and load the audio player
    elements.audioPlayer.src = audioUrl;
    elements.audioPlayer.load();
    elements.audioPlayer.play();
    elements.playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

    // Update Progress Bar
    state.currentSongIndex = state.songList.indexOf(song);
    updateProgressBar();

    checkIfFavorite(song.id);
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
    elements.muteBtn.innerHTML = elements.audioPlayer.muted ? '<i class="fa-solid fa-volume-mute"></i>' : '<i class="fa-solid fa-volume-high"></i>';
});

elements.volumeBar.addEventListener("input", () => {
    const volume = elements.volumeBar.value / elements.volumeBar.max;
    elements.audioPlayer.volume = volume;
    elements.volumeBar.style.setProperty('--volume', `${volume * 100}%`);
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
    const song = state.songList[state.currentSongIndex] ;
    if (!song) return;

    state.isFavorited = !state.isFavorited;
    elements.favIcon.classList.toggle("clicked", state.isFavorited);
    elements.favIcon.classList.toggle("fa-regular", !state.isFavorited);
    elements.favIcon.classList.toggle("fa-solid", state.isFavorited);

    try {
        const endpoint = state.isFavorited ? "/add-to-favorites" : "/remove-from-favorites"; // using ternary operator
        const body = state.isFavorited ? { song } : { songId: song.id };

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


