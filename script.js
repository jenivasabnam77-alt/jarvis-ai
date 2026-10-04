// ================================
// JARVIS REAL AI - script.js
// ================================

const micBtn = document.getElementById("micBtn");
const statusText = document.getElementById("statusText");
const chatBox = document.getElementById("chatBox");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");

const clock = document.getElementById("clock");
const dateEl = document.getElementById("date");
const battery = document.getElementById("battery");


// ================================
// CLOCK
// ================================

function updateClock() {
    const now = new Date();

    if (clock) {
        clock.textContent = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString([], {
            weekday: "long",
            day: "numeric",
            month: "long"
        });
    }
}

setInterval(updateClock, 1000);
updateClock();


// ================================
// BATTERY
// ================================

if ("getBattery" in navigator) {
    navigator.getBattery().then(b => {

        function updateBattery() {
            if (battery) {
                battery.textContent =
                    `BATTERY ${Math.round(b.level * 100)}%`;
            }
        }

        updateBattery();

        b.addEventListener("levelchange", updateBattery);
    });
}


// ================================
// SPEAK
// ================================

function speak(text) {

    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-IN";
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}


// ================================
// CHAT UI
// ================================

function addMessage(text, type = "ai") {

    const message = document.createElement("div");

    message.className =
        type === "user"
            ? "message user-message"
            : "message ai-message";

    message.textContent = text;

    chatBox.appendChild(message);

    chatBox.scrollTop = chatBox.scrollHeight;
}


// ================================
// AI REQUEST
// ================================

async function askAI(message) {

    statusText.textContent = "THINKING...";

    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })
        });


        if (!response.ok) {
            throw new Error("Server error");
        }


        const data = await response.json();

        const answer =
            data.reply || "I couldn't generate a response.";


        addMessage(answer, "ai");

        speak(answer);

        statusText.textContent = "ONLINE";


    } catch (error) {

        console.error(error);

        const errorMessage =
            "I can't connect to my AI brain right now. Please check the server.";

        addMessage(errorMessage, "ai");

        speak(errorMessage);

        statusText.textContent = "CONNECTION ERROR";
    }
}


// ================================
// SEND MESSAGE
// ================================

function sendMessage() {

    const text = textInput.value.trim();

    if (!text) return;


    addMessage(text, "user");

    textInput.value = "";

    askAI(text);
}


if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
}


if (textInput) {

    textInput.addEventListener("keydown", function(e) {

        if (e.key === "Enter") {
            sendMessage();
        }

    });
}


// ================================
// MICROPHONE
// ================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition = null;


if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;


    recognition.onstart = function() {

        statusText.textContent = "LISTENING...";

        if (micBtn) {
            micBtn.classList.add("active");
        }
    };


    recognition.onresult = function(event) {

        const transcript =
            event.results[0][0].transcript;

        if (!transcript) return;

        addMessage(transcript, "user");

        askAI(transcript);
    };


    recognition.onerror = function(event) {

        console.error("Mic error:", event.error);

        statusText.textContent = "MIC ERROR";

        if (micBtn) {
            micBtn.classList.remove("active");
        }
    };


    recognition.onend = function() {

        statusText.textContent = "ONLINE";

        if (micBtn) {
            micBtn.classList.remove("active");
        }
    };


    if (micBtn) {

        micBtn.addEventListener("click", function() {

            try {
                recognition.start();
            } catch (error) {
                console.log(error);
            }

        });

    }


} else {

    statusText.textContent =
        "MIC NOT SUPPORTED";

    if (micBtn) {
        micBtn.disabled = true;
    }
}


// ================================
// QUICK COMMANDS
// ================================

window.quickCommand = function(command) {

    addMessage(command, "user");

    askAI(command);
};


// ================================
// STARTUP
// ================================

setTimeout(() => {

    const welcome =
        "Systems online. I am ready.";

    addMessage(welcome, "ai");

    speak(welcome);

}, 800);