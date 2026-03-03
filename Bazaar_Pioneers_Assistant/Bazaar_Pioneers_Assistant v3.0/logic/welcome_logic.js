const welcomeMessage = [
    "> BAZAAR PIONEERS ASSISTANT: ONLINE",
    "> AUTHENTICATING FOUNDER CREDENTIALS...",
    "> ACCESS GRANTED: WELCOME, BAZAAR TECH.",
    "> MESH PROTOCOL v1.32 STABLE.",
    "> READY TO NAVIGATE THE E-NETWORK."
];

function startTerminalBoot() {
    const output = document.getElementById('assistant-output');
    output.innerHTML = ""; // Clear placeholders
    let line = 0;

    const interval = setInterval(() => {
        if (line < welcomeMessage.length) {
            const p = document.createElement('p');
            p.textContent = welcomeMessage[line];
            output.appendChild(p);
            line++;
        } else {
            clearInterval(interval);
            console.log("MESH-SCAN: Welcome Sequence Complete.");
        }
    }, 800); // 800ms delay between lines for terminal effect
}

window.addEventListener('load', startTerminalBoot);