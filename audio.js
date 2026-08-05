// Audio narration using Web Speech API
var synth = window.speechSynthesis;
var currentUtterance = null;

function speak(textId) {
    var textEl = document.getElementById(textId);
    if (!textEl) return;
    var text = textEl.textContent || textEl.innerText;
    if (synth.speaking) { synth.cancel(); }
    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'es-ES';
    currentUtterance.rate = 0.9;
    currentUtterance.pitch = 1;
    var statusEl = document.getElementById('audio-status');
    var progressEl = document.getElementById('audio-progress');
    if (statusEl) statusEl.textContent = 'Reproduciendo...';
    currentUtterance.onend = function() {
        if (statusEl) statusEl.textContent = 'Audio finalizado';
        if (progressEl) progressEl.style.width = '100%';
    };
    currentUtterance.onboundary = function(event) {
        if (progressEl && text.length > 0) {
            var pct = Math.round((event.charIndex / text.length) * 100);
            progressEl.style.width = pct + '%';
        }
    };
    synth.speak(currentUtterance);
}

function stopSpeech() {
    if (synth.speaking) synth.cancel();
    var statusEl = document.getElementById('audio-status');
    var progressEl = document.getElementById('audio-progress');
    if (statusEl) statusEl.textContent = 'Detenido';
    if (progressEl) progressEl.style.width = '0%';
}
