/* Lectura en voz alta (voz del navegador) y pitido del temporizador */

/* Devuelve false si el navegador no tiene voz */
export function hablar(texto, alTerminar) {
    if (!("speechSynthesis" in window)) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-ES";
    u.onend = alTerminar || null;
    speechSynthesis.speak(u);
    return true;
}

export function callar() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
}

export function pitar() {
    try {
        const a = new (window.AudioContext || window.webkitAudioContext)();
        const o = a.createOscillator();
        o.connect(a.destination);
        o.frequency.value = 880;
        o.start();
        setTimeout(() => { o.stop(); a.close(); }, 800);
    } catch { /* sin audio */ }
}
