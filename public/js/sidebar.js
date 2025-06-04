import { playSong } from "./script.js";

// document.addEventListener("DOMContentLoaded", function () {
//     document.querySelectorAll(".fav-song-item").forEach(item => {
//         item.addEventListener("click", function () {
//             const songData = this.getAttribute("data-song"); // Geting song JSON
   
//             if (!songData) {
//                  console.error("No valid song data found! Check EJS and MongoDB.");
//                 return;
//             }

//             try {
//                 const song = JSON.parse(songData); // Convert JSON string to object
//                 //console.log("🎵 Playing favorite song:", song);

//                 if (!song.audioUrl) {
//                     console.error(" No valid song URL found!");
//                     return;
//                 }

//                 playSong(song);

//             } catch (error) {
//                 console.error("Error parsing song data:", error);
//             }
//         });
//     });
// });


import { setPlaylistAndPlay } from "./script.js";

document.addEventListener("DOMContentLoaded", function () {
    const favSongs = [];

    document.querySelectorAll(".fav-song-item").forEach((item, index) => {
        const songData = item.getAttribute("data-song");
        if (!songData) return;

        let song;
        try {
            song = JSON.parse(songData);
            favSongs.push(song);
        } catch (err) {
            console.error("Error parsing favorite song data:", err);
            return;
        }

        item.addEventListener("click", function () {
            const songIndex = favSongs.findIndex(s => s.id === song.id);
            if (songIndex !== -1) {
                setPlaylistAndPlay(favSongs, songIndex);
            }
        });
    });
});




document.querySelectorAll(".nf").forEach(link => {
    link.addEventListener("click", (event) => {
      event.preventDefault(); 
    });
  });
