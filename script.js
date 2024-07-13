let currentSong = new Audio();
let songs;

async function getSongs() {
    try {
        let response = await fetch("http://127.0.0.1:5500/songs/");
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let as = div.getElementsByTagName("a");
        let songs = [];
        for (let i = 0; i < as.length; i++) {
            const element = as[i];
            if (element.href.endsWith(".mp4")) {
                let songName = element.href.split("/songs/")[1];
                // Remove the ".mp4" extension
                songName = decodeURIComponent(songName.slice(0, -4)); // Decode URI component
                songs.push(songName);
            }
        }
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

const playMusic = async (track) => {
    // Pause the current audio if it's playing
    if (!currentSong.paused) {
        currentSong.pause();
    }

    // Load the new audio track
    try {
        currentSong.src = "/songs/" + encodeURIComponent(track) + ".mp4"; // Encode URI component
        await currentSong.load(); // Ensure the audio is loaded before playing
        currentSong.play();
        play.src = "icons/pause.svg";
        document.querySelector(".songinfo").innerHTML = track;
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    } catch (error) {
        console.error("Error loading or playing audio:", error);
    }
};

async function main() {
    try {
        songs = await getSongs();
        console.log(songs);

        let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];

        for (const song of songs) {
            songUL.innerHTML += `<li><img class="invert" src="icons/music.svg" alt="">
            <div class="info">
                <div>${song}</div>
                <div>Aditya</div>
            </div>
            <div class="playnow" onclick="playMusic('${song}')">
                <span>Play Now</span>
                <img class="invert" src="icons/play.svg" alt="">
            </div>
            </li>`;
        }

        // Attach click event listener to play/pause button
        play.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play();
                play.src = "icons/pause.svg";
            } else {
                currentSong.pause();
                play.src = "icons/play.svg";
            }
        });

    } catch (error) {
        console.error("Error initializing application:", error);
    }

    currentSong.addEventListener("timeupdate", () => {
        const currentTime = currentSong.currentTime;
        const duration = currentSong.duration;

        // Calculate the percentage of progress
        const progressPercentage = (currentTime / duration) * 100;

        // Update the position of the circle on the seekbar
        const circle = document.querySelector(".circle");
        const seekbarWidth = document.querySelector(".seekbar").offsetWidth;
        const circlePosition = (progressPercentage / 100) * seekbarWidth;
        circle.style.left = circlePosition + "px";

        // Update the song time display
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentTime)} / ${secondsToMinutesSeconds(duration)}`;
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        // Calculate the percentage position where the user clicked
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

        // Update the position of the circle
        document.querySelector(".circle").style.left = percent + "%";

        // Calculate the new currentTime based on the percentage position
        currentSong.currentTime = (percent / 100) * currentSong.duration;
    });

    // Function to convert seconds to minutes:seconds format
    function secondsToMinutesSeconds(seconds) {
        let minutes = Math.floor(seconds / 60);
        let remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // add event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    // Attach event listener for previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(document.querySelector(".songinfo").innerHTML);
        // Find the index of the current song in the songs array
        if (index > 0) {
            // If it's not the first song, play the previous song
            playMusic(songs[index - 1]);
        } else {
            // If it's the first song, loop to the last song
            playMusic(songs[songs.length - 1]);
        }
    });

    // Attach event listener for next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(document.querySelector(".songinfo").innerHTML);
        // Find the index of the current song in the songs array
        if (index < songs.length - 1) {
            // If it's not the last song, play the next song
            playMusic(songs[index + 1]);
        } else {
            // If it's the last song, loop to the first song
            playMusic(songs[0]);
        }
    });

    // Attach event listener for volume input change
    document.querySelector(".range input[type='range']").addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
    });

    // Attach event listener for mute/unmute button
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1; // Set default volume when unmuted
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main(); // Don't forget to call the main function
