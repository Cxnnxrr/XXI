const contenidoPrincipal = document.getElementById('contenidoPrincipal');
const btnEmpezar = document.getElementById('btnEmpezar');
const btnVolver = document.getElementById('btnVolver');
const escena = document.getElementById('escena');
const contenedorSecciones = document.getElementById('contenedorSecciones');
const secciones = document.querySelectorAll('.seccion-card');
const particulasLayer = document.getElementById('particulasLayer');
const particulasLayerFinal = document.getElementById('particulasLayerFinal');
const customCursor = document.getElementById('customCursor');

const btnFlechaFinal = document.getElementById('btnFlechaFinal');
const btnFlechaRegresar = document.getElementById('btnFlechaRegresar');
const haloNeon = document.getElementById('haloNeon');

const CURSORES = {
    normal: 'Cursores/Normal.png',
    apuntar: 'Cursores/Apuntar.png',
    click: 'Cursores/Click.png',
    escribir: 'Cursores/Escribir.png',
    bloqueo: 'Cursores/Bloqueo.png'
};

let cursorState = 'normal';
let mouseDown = false;
let cursorVisible = false;
let cursorX = -100;
let cursorY = -100;

function setCursorState(state) {
    if (cursorState === state) return;
    cursorState = state;
    customCursor.style.backgroundImage = `url('${CURSORES[state]}')`;
}

function getCursorState(target) {
    if (!target) return 'normal';

    const bloqueado = target.closest('.btn-entrar.bloqueado');
    if (bloqueado) return 'bloqueo';

    if (target.closest('input, textarea, [contenteditable="true"]')) {
        return 'escribir';
    }

    const interactivo = target.closest('button:not(.bloqueado), a, [role="button"], .icono-social');
    if (interactivo) {
        return mouseDown ? 'click' : 'apuntar';
    }

    return 'normal';
}

function updateCustomCursorPosition(x, y) {
    cursorX = x;
    cursorY = y;
    customCursor.style.transform = `translate(${cursorX - 16}px, ${cursorY - 16}px)`;
}

function refreshCursorFromTarget(target) {
    setCursorState(getCursorState(target));
}

if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
        cursorVisible = true;
        customCursor.classList.remove('oculto');
        updateCustomCursorPosition(e.clientX, e.clientY);
        refreshCursorFromTarget(e.target);
    });

    document.addEventListener('mouseenter', () => {
        cursorVisible = true;
        customCursor.classList.remove('oculto');
    });

    document.addEventListener('mouseleave', () => {
        cursorVisible = false;
        customCursor.classList.add('oculto');
    });

    document.addEventListener('mousedown', (e) => {
        mouseDown = true;
        updateCustomCursorPosition(e.clientX, e.clientY);
        const estado = getCursorState(e.target);
        setCursorState(estado === 'apuntar' ? 'click' : estado);
    });

    document.addEventListener('mouseup', (e) => {
        mouseDown = false;
        refreshCursorFromTarget(e.target);
    });

    window.addEventListener('blur', () => {
        customCursor.classList.add('oculto');
    });

    window.addEventListener('focus', () => {
        if (cursorVisible) {
            customCursor.classList.remove('oculto');
        }
    });
}
let ultimoRastroMouse = 0;

function crearRastroMouse(x, y) {
    const ahora = performance.now();
    if (ahora - ultimoRastroMouse < 18) return;
    ultimoRastroMouse = ahora;

    const particula = document.createElement('span');
    particula.className = 'particula-rastro';

    const size = Math.random() * 3 + 2; // 2px a 5px
    particula.style.width = `${size}px`;
    particula.style.height = `${size}px`;
    particula.style.left = `${x}px`;
    particula.style.top = `${y}px`;

    document.body.appendChild(particula);

    setTimeout(() => {
        particula.remove();
    }, 750);
}

if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
        crearRastroMouse(e.clientX, e.clientY);
    });
}
// ==============================
// MÚSICA
// ==============================
const btnMusica = document.getElementById('btnMusica');
const iconoMusica = document.getElementById('iconoMusica');
const musicaAmbiente = document.getElementById('musicaAmbiente');
const musicaFinal = document.getElementById('musicaFinal');

const VOLUMEN_MUSICA = 0.35;
const DURACION_FADE = 1200;

let musicaSilenciada = false;
let musicaOcultaPorSistema = false;
let musicaIniciada = false;
let musicaEnFinal = false;
let musicaActual = musicaAmbiente;
let fadeToken = 0;

function actualizarIconoMusica() {
    iconoMusica.src = musicaSilenciada ? 'Imagenes/SDE.png' : 'Imagenes/SAC.png';
    iconoMusica.alt = musicaSilenciada ? 'Música muteada' : 'Música activa';
    btnMusica.title = musicaSilenciada ? 'Activar música' : 'Mutear música';
}

function aplicarEstadoAudio() {
    const debeEstarSilenciado = musicaSilenciada || musicaOcultaPorSistema;
    musicaAmbiente.muted = debeEstarSilenciado;
    musicaFinal.muted = debeEstarSilenciado;
}

function detenerAudios() {
    musicaAmbiente.pause();
    musicaFinal.pause();
}

function animarVolumen(audio, volumenInicial, volumenFinal, duracion = DURACION_FADE) {
    const token = ++fadeToken;

    return new Promise((resolve) => {
        const inicio = performance.now();
        audio.volume = volumenInicial;

        function paso(tiempoActual) {
            if (token !== fadeToken) {
                resolve(false);
                return;
            }

            const progreso = Math.min((tiempoActual - inicio) / duracion, 1);
            const volumen = volumenInicial + (volumenFinal - volumenInicial) * progreso;
            audio.volume = Math.max(0, Math.min(1, volumen));

            if (progreso < 1) {
                requestAnimationFrame(paso);
            } else {
                resolve(true);
            }
        }

        requestAnimationFrame(paso);
    });
}

async function reproducirMusica(audio, reiniciar = false) {
    musicaIniciada = true;
    aplicarEstadoAudio();

    if (reiniciar) {
        try {
            audio.currentTime = 0;
        } catch (error) {
        }
    }

    audio.volume = (musicaSilenciada || musicaOcultaPorSistema) ? VOLUMEN_MUSICA : 0;

    try {
        await audio.play();
    } catch (error) {
    }

    if (!musicaSilenciada && !musicaOcultaPorSistema) {
        animarVolumen(audio, 0, VOLUMEN_MUSICA, 250);
    }
}

async function hacerCrossfade(audioOrigen, audioDestino) {
    fadeToken++;

    musicaActual = audioDestino;
    musicaIniciada = true;
    aplicarEstadoAudio();

    try {
        audioDestino.currentTime = 0;
    } catch (error) {
    }

    audioDestino.volume = 0;

    try {
        await audioDestino.play();
    } catch (error) {
    }

    const origenEstabaSonando = audioOrigen && !audioOrigen.paused;

    if (origenEstabaSonando) {
        animarVolumen(audioOrigen, audioOrigen.volume || VOLUMEN_MUSICA, 0, DURACION_FADE).then(() => {
            try {
                audioOrigen.pause();
                audioOrigen.currentTime = 0;
            } catch (error) {
            }
        });
    }

    if (!musicaSilenciada && !musicaOcultaPorSistema) {
        animarVolumen(audioDestino, 0, VOLUMEN_MUSICA, DURACION_FADE);
    } else {
        audioDestino.volume = VOLUMEN_MUSICA;
    }
}

function iniciarMusicaAmbiente() {
    musicaEnFinal = false;
    musicaActual = musicaAmbiente;
    reproducirMusica(musicaAmbiente, true);
}

function cambiarAMusicaFinal() {
    if (musicaEnFinal) return;
    musicaEnFinal = true;
    hacerCrossfade(musicaAmbiente, musicaFinal);
}

function cambiarAMusicaAmbiente() {
    if (!musicaEnFinal && musicaActual === musicaAmbiente) return;
    musicaEnFinal = false;
    hacerCrossfade(musicaFinal, musicaAmbiente);
}

function pausarPorSistema() {
    musicaOcultaPorSistema = true;
    aplicarEstadoAudio();
    detenerAudios();
}

function reanudarPorSistema() {
    musicaOcultaPorSistema = false;
    aplicarEstadoAudio();

    if (!musicaIniciada) return;
    if (musicaSilenciada) return;

    const audioAReproducir = musicaActual || (musicaEnFinal ? musicaFinal : musicaAmbiente);
    audioAReproducir.play().catch(() => {});
}

btnMusica.addEventListener('click', () => {
    musicaSilenciada = !musicaSilenciada;
    actualizarIconoMusica();
    aplicarEstadoAudio();

    if (musicaSilenciada) {
        detenerAudios();
    } else if (musicaIniciada && !document.hidden) {
        const audioAReproducir = musicaActual || (musicaEnFinal ? musicaFinal : musicaAmbiente);
        audioAReproducir.play().catch(() => {});
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        pausarPorSistema();
    } else {
        reanudarPorSistema();
    }
});

window.addEventListener('blur', () => {
    pausarPorSistema();
});

window.addEventListener('focus', () => {
    reanudarPorSistema();
});

window.addEventListener('pagehide', () => {
    pausarPorSistema();
});

window.addEventListener('pageshow', () => {
    reanudarPorSistema();
});

// ==============================
// EFECTOS DE ERROR / DESBLOQUEO
// ==============================
const sonidoError = document.getElementById('sonidoError');
const sonidoDesbloqueo = document.getElementById('sonidoDesbloqueo');

let timerHalo = null;
let timerHaloError = null;
let timerTemblor = null;

function reproducirEfecto(audioEl, volumen = 0.7) {
    try {
        audioEl.pause();
        audioEl.currentTime = 0;
        audioEl.volume = volumen;
        audioEl.play().catch(() => {});
    } catch (error) {
    }
}

function activarTemblorPantalla() {
    contenidoPrincipal.classList.remove('temblor-activo');
    void contenidoPrincipal.offsetWidth;
    contenidoPrincipal.classList.add('temblor-activo');

    if (timerTemblor) {
        clearTimeout(timerTemblor);
    }

    timerTemblor = setTimeout(() => {
        contenidoPrincipal.classList.remove('temblor-activo');
    }, 480);
}

function mostrarHaloNeon() {
    haloNeon.classList.remove('halo-error');
    haloNeon.classList.add('mostrar-halo');

    if (timerHalo) {
        clearTimeout(timerHalo);
    }

    timerHalo = setTimeout(() => {
        haloNeon.classList.remove('mostrar-halo');
    }, 900);
}

function mostrarHaloError() {
    haloNeon.classList.add('halo-error', 'mostrar-halo');

    if (timerHaloError) {
        clearTimeout(timerHaloError);
    }

    timerHaloError = setTimeout(() => {
        haloNeon.classList.remove('mostrar-halo', 'halo-error');
    }, 900);
}

function efectoError() {
    reproducirEfecto(sonidoError, 0.7);
    activarTemblorPantalla();
    mostrarHaloError();
}

function efectoExito() {
    reproducirEfecto(sonidoDesbloqueo, 0.7);
    mostrarHaloNeon();
}

// Sonidos
const clickSoundSrc = 'Audios/Click.mp3';
const bloqueoSoundSrc = 'Audios/Bloqueo.mp3';
const hoverPilarSoundSrc = 'Audios/PilaresH.mp3';
const hoverBotonSoundSrc = 'Audios/BotonesH.mp3';

function reproducirSonido(src, volumen = 0.35) {
    try {
        const sonido = new Audio(src);
        sonido.volume = volumen;
        sonido.play().catch(() => {});
    } catch (error) {
    }
}

document.addEventListener('click', (e) => {
    const boton = e.target.closest('button');
    if (!boton) return;

    const esBloqueado =
        boton.classList.contains('bloqueado') ||
        boton.closest('.btn-entrar.bloqueado') !== null;

    if (esBloqueado) {
        reproducirSonido(bloqueoSoundSrc, 0.45);
    } else {
        reproducirSonido(clickSoundSrc, 0.35);
    }
}, true);

// Hover en todos los botones
let ultimoBotonHover = null;

document.addEventListener('mouseover', (e) => {
    const boton = e.target.closest('button');
    if (!boton) return;
    if (boton.contains(e.relatedTarget)) return;
    if (boton === ultimoBotonHover) return;

    const esBloqueado =
        boton.classList.contains('bloqueado') ||
        boton.closest('.btn-entrar.bloqueado') !== null;

    if (esBloqueado) return;

    ultimoBotonHover = boton;
    reproducirSonido(hoverBotonSoundSrc, 0.25);
});

document.addEventListener('mouseout', (e) => {
    const boton = e.target.closest('button');
    if (!boton) return;
    if (!boton.contains(e.relatedTarget)) {
        ultimoBotonHover = null;
    }
});

// Hover en los pilares
secciones.forEach((pilar) => {
    pilar.addEventListener('mouseenter', () => {
        if (pilar.classList.contains('desvanecer-pilar')) return;
        reproducirSonido(hoverPilarSoundSrc, 0.25);
    });
});

// Partículas
function crearParticulas(layer, cantidad = 250) {
    const colores = ['rgba(255,20,147,1'];

    for (let i = 0; i < cantidad; i++) {
        const particula = document.createElement('span');
        particula.className = 'particula';

        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = Math.random() * 14 + 10;
        const delay = Math.random() * 10 * -1;
        const opacity = (Math.random() * 0.18 + 0.08).toFixed(2);
        const dx = (Math.random() * 120 - 60).toFixed(0) + 'px';
        const dy = (-100 - Math.random() * 180).toFixed(0) + 'px';
        const colorBase = colores[Math.floor(Math.random() * colores.length)];

        particula.style.width = `${size}px`;
        particula.style.height = `${size}px`;
        particula.style.left = `${left}%`;
        particula.style.top = `${top}%`;
        particula.style.background = `${colorBase}${opacity})`;
        particula.style.animationDuration = `${duration}s`;
        particula.style.animationDelay = `${delay}s`;
        particula.style.setProperty('--opacidad', opacity);
        particula.style.setProperty('--dx', dx);
        particula.style.setProperty('--dy', dy);

        layer.appendChild(particula);
    }
}

crearParticulas(particulasLayer, 200);
crearParticulas(particulasLayerFinal, 120);

const pilar1 = document.getElementById('pilar1');
const pilar2 = document.getElementById('pilar2');
const pilar3 = document.getElementById('pilar3');
const pilar4 = document.getElementById('pilar4');
const pilar5 = document.getElementById('pilar5');

const btnEntrarPilar1 = document.getElementById('btnEntrarPilar1');
const btnEntrarPilar2 = document.getElementById('btnEntrarPilar2');
const btnEntrarPilar3 = document.getElementById('btnEntrarPilar3');
const btnEntrarPilar4 = document.getElementById('btnEntrarPilar4');
const btnEntrarPilar5 = document.getElementById('btnEntrarPilar5');

const puzzleCorredizo1 = document.getElementById('puzzleCorredizo1');
const btnRetraerPuzzle1 = document.getElementById('btnRetraerPuzzle1');
const inputPassword = document.getElementById('inputPassword');
const btnResolver1 = document.getElementById('btnResolver1');
const mensajeFeedback = document.getElementById('mensajeFeedback');

const puzzleCorredizo2 = document.getElementById('puzzleCorredizo2');
const btnRetraerPuzzle2 = document.getElementById('btnRetraerPuzzle2');
const inputPassword2 = document.getElementById('inputPassword2');
const btnResolver2 = document.getElementById('btnResolver2');
const mensajeFeedback2 = document.getElementById('mensajeFeedback2');

const puzzleCorredizo3 = document.createElement('div');
puzzleCorredizo3.className = 'seccion-puzzle-corrediza';
puzzleCorredizo3.id = 'puzzleCorredizo3';
puzzleCorredizo3.innerHTML = `
    <button type="button" class="btn-retraer" id="btnRetraerPuzzle3" title="Esconder puzzle">
        <img src="Imagenes/flecha.png" alt="Retraer" class="img-flecha" />
    </button>
    <h3 class="titulo-pilar" style="color: #ff1493; margin-top: 10px; margin-bottom: 20px;">Puzzle 3</h3>
    <a href="Audios/k278.mp3" download="Audios/k278.mp3" style="display:block; margin-bottom: 18px; text-decoration:none;">
        <button type="button" class="btn-entrar" style="width:auto; padding:10px 20px; font-size:0.8rem;">Descargar audio</button>
    </a>
    <div style="width: 80%; max-width: 300px; display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 25px;">
        <input type="text" id="inputPassword3" placeholder="Clave" class="input-puzzle" />
        <span id="mensajeFeedback3" class="feedback"></span>
    </div>
    <button type="button" class="btn-entrar" id="btnResolver3">Responder</button>
`;
contenedorSecciones.appendChild(puzzleCorredizo3);

const puzzleCorredizo4 = document.createElement('div');
puzzleCorredizo4.className = 'seccion-puzzle-corrediza';
puzzleCorredizo4.id = 'puzzleCorredizo4';
puzzleCorredizo4.innerHTML = `
    <button type="button" class="btn-retraer" id="btnRetraerPuzzle4" title="Esconder puzzle">
        <img src="Imagenes/flecha.png" alt="Retraer" class="img-flecha" />
    </button>
    <h3 class="titulo-pilar" style="color: #ff1493; margin-top: 10px; margin-bottom: 20px;">Puzzle 4</h3>

    <div class="download-wrap">
        <a href="Imagenes/Tabla.png" download="Tabla.png" style="display:block; text-decoration:none;">
            <button type="button" class="btn-entrar" style="width:auto; padding:10px 20px; font-size:0.8rem;">Descargar</button>
        </a>

        <div class="player-tapcode" id="playerTapcode">
            <button type="button" class="btn-play-tapcode" id="btnTapcodePlay" aria-label="Reproducir">
                <span id="tapcodeIcon">▶</span>
            </button>

            <div class="barra-tapcode" id="barraTapcode" aria-label="Progreso de audio">
                <div class="progreso-tapcode" id="progresoTapcode"></div>
                <input type="range" class="slider-tapcode" id="sliderTapcode" min="0" max="100" value="0" step="0.1" />
            </div>

            <span class="tiempo-tapcode" id="tiempoTapcode">/</span>

            <audio id="audioTapcode" src="Audios/Tapcode.mp3" preload="metadata"></audio>
        </div>
    </div>

    <div style="width: 80%; max-width: 300px; display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 25px;">
        <input type="text" id="inputPassword4" placeholder="Clave" class="input-puzzle" />
        <span id="mensajeFeedback4" class="feedback"></span>
    </div>
    <button type="button" class="btn-entrar" id="btnResolver4">Responder</button>
`;
contenedorSecciones.appendChild(puzzleCorredizo4);

const puzzleCorredizo5 = document.createElement('div');
puzzleCorredizo5.className = 'seccion-puzzle-corrediza';
puzzleCorredizo5.id = 'puzzleCorredizo5';
puzzleCorredizo5.innerHTML = `
    <button type="button" class="btn-retraer" id="btnRetraerPuzzle5" title="Esconder puzzle">
        <img src="Imagenes/flecha.png" alt="Retraer" class="img-flecha" />
    </button>
    <h3 class="titulo-pilar" style="color: #ff1493; margin-top: 10px; margin-bottom: 20px;">Puzzle 5</h3>
    <div style="width: 85%; max-width: 340px; margin-bottom: 18px;">
        <p class="codigo-bloque">aHR0cHM6Ly90aW55dXJsLmNvbS8yaGFydGZyNw==</p>
    </div>
    <div style="width: 80%; max-width: 300px; display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 25px;">
        <input type="text" id="inputPassword5" placeholder="Clave" class="input-puzzle" />
        <span id="mensajeFeedback5" class="feedback"></span>
    </div>
    <button type="button" class="btn-entrar" id="btnResolver5">Responder</button>
`;
contenedorSecciones.appendChild(puzzleCorredizo5);

const btnRetraerPuzzle3 = document.getElementById('btnRetraerPuzzle3');
const btnRetraerPuzzle4 = document.getElementById('btnRetraerPuzzle4');
const btnRetraerPuzzle5 = document.getElementById('btnRetraerPuzzle5');

const inputPassword3 = document.getElementById('inputPassword3');
const inputPassword4 = document.getElementById('inputPassword4');
const inputPassword5 = document.getElementById('inputPassword5');

const btnResolver3 = document.getElementById('btnResolver3');
const btnResolver4 = document.getElementById('btnResolver4');
const btnResolver5 = document.getElementById('btnResolver5');

const mensajeFeedback3 = document.getElementById('mensajeFeedback3');
const mensajeFeedback4 = document.getElementById('mensajeFeedback4');
const mensajeFeedback5 = document.getElementById('mensajeFeedback5');

const btnResponderFinal = document.getElementById('btnResponderFinal');
const inputLinkFinal = document.getElementById('inputLinkFinal');
const mensajeFinal = document.getElementById('mensajeFinal');

const audioTapcode = document.getElementById('audioTapcode');
const btnTapcodePlay = document.getElementById('btnTapcodePlay');
const tapcodeIcon = document.getElementById('tapcodeIcon');
const barraTapcode = document.getElementById('barraTapcode');
const progresoTapcode = document.getElementById('progresoTapcode');
const sliderTapcode = document.getElementById('sliderTapcode');
const tiempoTapcode = document.getElementById('tiempoTapcode');

let puzzleActual = null;

// Ocultar por completo el texto de tiempo
tiempoTapcode.textContent = '';
tiempoTapcode.style.display = 'none';

// Subir un poco el botón de responder del puzzle 4
btnResolver4.style.marginTop = '-12px';

function actualizarBarraAudio() {
    if (!audioTapcode.duration || !isFinite(audioTapcode.duration)) return;

    const porcentaje = (audioTapcode.currentTime / audioTapcode.duration) * 100;
    progresoTapcode.style.width = `${porcentaje}%`;
    sliderTapcode.value = porcentaje;
}

function ponerPlay() {
    tapcodeIcon.textContent = '▶';
    btnTapcodePlay.setAttribute('aria-label', 'Reproducir');
}

function ponerPause() {
    tapcodeIcon.textContent = '❚❚';
    btnTapcodePlay.setAttribute('aria-label', 'Pausar');
}

btnTapcodePlay.addEventListener('click', async () => {
    try {
        if (audioTapcode.paused) {
            await audioTapcode.play();
            ponerPause();
        } else {
            audioTapcode.pause();
            ponerPlay();
        }
    } catch (error) {
    }
});

audioTapcode.addEventListener('loadedmetadata', () => {
    progresoTapcode.style.width = '0%';
    sliderTapcode.value = 0;
    tiempoTapcode.textContent = '';
});

audioTapcode.addEventListener('timeupdate', actualizarBarraAudio);

audioTapcode.addEventListener('play', () => {
    ponerPause();
});

audioTapcode.addEventListener('pause', () => {
    ponerPlay();
});

audioTapcode.addEventListener('ended', () => {
    ponerPlay();
    progresoTapcode.style.width = '100%';
    sliderTapcode.value = 100;
    tiempoTapcode.textContent = '';
});

sliderTapcode.addEventListener('input', () => {
    if (!audioTapcode.duration || !isFinite(audioTapcode.duration)) return;
    const porcentaje = Number(sliderTapcode.value) / 100;
    audioTapcode.currentTime = porcentaje * audioTapcode.duration;
    progresoTapcode.style.width = `${sliderTapcode.value}%`;
});

barraTapcode.addEventListener('click', (e) => {
    if (!audioTapcode.duration || !isFinite(audioTapcode.duration)) return;
    const rect = barraTapcode.getBoundingClientRect();
    const porcentaje = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    audioTapcode.currentTime = porcentaje * audioTapcode.duration;
    progresoTapcode.style.width = `${porcentaje * 100}%`;
    sliderTapcode.value = porcentaje * 100;
});

function mostrarBotonEmpezar() {
    btnEmpezar.style.display = 'block';
    btnEmpezar.classList.remove('ocultar');
    btnEmpezar.classList.remove('aparecer');
    void btnEmpezar.offsetWidth;
    btnEmpezar.classList.add('aparecer');
}

function ocultarBotonEmpezar() {
    btnEmpezar.classList.remove('aparecer');
    btnEmpezar.classList.add('ocultar');
}

function mostrarSecciones() {
    contenedorSecciones.classList.add('mostrar-contenedor');
    btnVolver.classList.add('mostrar-volver');

    secciones.forEach((seccion, index) => {
        setTimeout(() => {
            seccion.classList.add('animar-seccion');
        }, 200 + (index * 120));
    });
}

function ocultarFlechaFinal() {
    btnFlechaFinal.classList.remove('mostrar-flecha-final');
}

function ocultarSecciones() {
    btnVolver.classList.remove('mostrar-volver');
    ocultarFlechaFinal();

    secciones.forEach((seccion, index) => {
        setTimeout(() => {
            seccion.classList.remove('animar-seccion');
        }, (secciones.length - 1 - index) * 100);
    });

    setTimeout(() => {
        contenedorSecciones.classList.remove('mostrar-contenedor');
        mostrarBotonEmpezar();
    }, 900);
}

function bloquearMensaje(feedbackEl, color, texto) {
    feedbackEl.style.color = color;
    feedbackEl.textContent = texto;
}

function marcarInputError(inputEl) {
    if (!inputEl) return;
    inputEl.classList.add('input-error');
    setTimeout(() => {
        inputEl.classList.remove('input-error');
    }, 900);
}

function ocultarOtrosPilares(pilarActivo) {
    secciones.forEach(seccion => {
        if (seccion !== pilarActivo) {
            seccion.classList.add('desvanecer-pilar');
        } else {
            seccion.classList.remove('desvanecer-pilar');
        }
    });
}

function restaurarOtrosPilares() {
    secciones.forEach(seccion => {
        seccion.classList.remove('desvanecer-pilar');
        seccion.style.position = '';
        seccion.style.left = '';
        seccion.style.top = '';
        seccion.style.width = '';
        seccion.style.height = '';
        seccion.style.zIndex = '';
        seccion.style.transform = '';
        seccion.style.transition = '';
    });
}

function moverPilarAprimeraPosicion(pilar) {
    const contRect = contenedorSecciones.getBoundingClientRect();
    const pRect = pilar.getBoundingClientRect();
    const gap = 20;
    const targetWidth = (contRect.width - (gap * 4)) / 5;

    pilar.style.position = 'absolute';
    pilar.style.left = (pRect.left - contRect.left) + 'px';
    pilar.style.top = (pRect.top - contRect.top) + 'px';
    pilar.style.width = pRect.width + 'px';
    pilar.style.height = pRect.height + 'px';
    pilar.style.zIndex = '20';
    pilar.style.transition = 'left 0.6s cubic-bezier(0.25, 1, 0.5, 1), top 0.6s cubic-bezier(0.25, 1, 0.5, 1), width 0.6s cubic-bezier(0.25, 1, 0.5, 1), height 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';

    requestAnimationFrame(() => {
        pilar.style.left = '0px';
        pilar.style.top = '0px';
        pilar.style.width = targetWidth + 'px';
        pilar.style.height = '100%';
        pilar.style.transform = 'scale(1.02)';
    });
}

function abrirPuzzle(pilar, puzzle) {
    if (puzzleActual && puzzleActual !== puzzle) return;

    puzzleActual = puzzle;
    pilar.classList.add('fijar-hover');
    ocultarOtrosPilares(pilar);
    moverPilarAprimeraPosicion(pilar);

    setTimeout(() => {
        puzzle.classList.add('deslizar-puerta');
    }, 50);
}

function cerrarPuzzle(puzzle, pilar) {
    puzzle.classList.remove('deslizar-puerta');
    puzzleActual = null;

    setTimeout(() => {
        restaurarOtrosPilares();
        pilar.classList.remove('fijar-hover');
    }, 620);
}

const ESTADO_PILARES = {
    pilar1: {
        titulo: 'Foto',
        imagen: 'Imagenes/Foto.png',
        alt: 'Contenido Sección 1'
    },
    pilar2: {
        titulo: 'Morse',
        imagen: 'Imagenes/Usuario.png',
        alt: 'Contenido Sección 2'
    },
    pilar3: {
        titulo: 'Audio',
        imagen: 'Imagenes/Audio.png',
        alt: 'Contenido Sección 3'
    },
    pilar4: {
        titulo: 'Golpes',
        imagen: 'Imagenes/Tapcode.png',
        alt: 'Contenido Sección 4'
    },
    pilar5: {
        titulo: '64',
        imagen: 'Imagenes/64.png',
        alt: 'Contenido Sección 5'
    }
};

function guardarEstadoOriginalPilar(pilar) {
    const estado = ESTADO_PILARES[pilar.id];
    if (!estado) return;

    pilar.dataset.originalTitle = estado.titulo;
    pilar.dataset.originalImage = estado.imagen;
    pilar.dataset.originalAlt = estado.alt;
}

function aplicarEstadoPilar(pilar, bloqueado) {
    const estado = ESTADO_PILARES[pilar.id];
    if (!estado) return;

    const titulo = pilar.querySelector('.titulo-pilar');
    const imagen = pilar.querySelector('.img-pilar');
    const boton = pilar.querySelector('.btn-entrar');

    if (titulo) {
        titulo.textContent = bloqueado ? 'Bloqueado' : (pilar.dataset.originalTitle || estado.titulo);
    }

    if (imagen) {
        imagen.src = bloqueado ? 'Imagenes/Bloqueo.png' : (pilar.dataset.originalImage || estado.imagen);
        imagen.alt = bloqueado ? 'Bloqueado' : (pilar.dataset.originalAlt || estado.alt);
    }

    if (boton) {
        if (bloqueado) {
            boton.classList.add('bloqueado');
            boton.innerHTML = '<img src="Imagenes/Candado.png" alt="Bloqueado" class="img-candado" />';
        } else {
            boton.classList.remove('bloqueado');
            boton.innerHTML = 'Entrar';
        }
    }

    if (bloqueado) {
        pilar.classList.add('pilar-bloqueado');
    } else {
        pilar.classList.remove('pilar-bloqueado');
    }
}

function bloquearPilar(pilar) {
    aplicarEstadoPilar(pilar, true);
}

function desbloquearPilar(pilar) {
    aplicarEstadoPilar(pilar, false);
}

function desbloquearPilarYRestaurar(pilar) {
    desbloquearPilar(pilar);
}

guardarEstadoOriginalPilar(pilar1);
guardarEstadoOriginalPilar(pilar2);
guardarEstadoOriginalPilar(pilar3);
guardarEstadoOriginalPilar(pilar4);
guardarEstadoOriginalPilar(pilar5);

bloquearPilar(pilar2);
bloquearPilar(pilar3);
bloquearPilar(pilar4);
bloquearPilar(pilar5);

btnEmpezar.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (musicaActual !== musicaAmbiente || musicaAmbiente.paused) {
        iniciarMusicaAmbiente();
    } else if (!musicaIniciada) {
        iniciarMusicaAmbiente();
    }

    ocultarBotonEmpezar();

    setTimeout(() => {
        btnEmpezar.style.display = 'none';
        mostrarSecciones();
    }, 500);
});

btnVolver.addEventListener('click', () => {
    if (puzzleCorredizo1.classList.contains('deslizar-puerta')) {
        cerrarPuzzle(puzzleCorredizo1, pilar1);
        return;
    }

    if (puzzleCorredizo2.classList.contains('deslizar-puerta')) {
        cerrarPuzzle(puzzleCorredizo2, pilar2);
        return;
    }

    if (puzzleCorredizo3.classList.contains('deslizar-puerta')) {
        cerrarPuzzle(puzzleCorredizo3, pilar3);
        return;
    }

    if (puzzleCorredizo4.classList.contains('deslizar-puerta')) {
        cerrarPuzzle(puzzleCorredizo4, pilar4);
        return;
    }

    if (puzzleCorredizo5.classList.contains('deslizar-puerta')) {
        cerrarPuzzle(puzzleCorredizo5, pilar5);
        return;
    }

    if (escena.classList.contains('mostrar-final')) {
        cambiarAMusicaAmbiente();
        escena.classList.remove('mostrar-final');
        ocultarFlechaFinal();
        return;
    }

    ocultarSecciones();
});

btnFlechaFinal.addEventListener('click', () => {
    cambiarAMusicaFinal();
    escena.classList.add('mostrar-final');
});

btnFlechaRegresar.addEventListener('click', () => {
    cambiarAMusicaAmbiente();
    escena.classList.remove('mostrar-final');
});

// ==============================================
// PILAR 1
// ==============================================
btnEntrarPilar1.addEventListener('click', () => {
    abrirPuzzle(pilar1, puzzleCorredizo1);
});

btnRetraerPuzzle1.addEventListener('click', () => {
    cerrarPuzzle(puzzleCorredizo1, pilar1);
});

btnResolver1.addEventListener('click', () => {
    if (inputPassword.value.trim() === "Powder") {
        bloquearMensaje(mensajeFeedback, "#00ffcc", "Muy bien, cuyeya.");
        efectoExito();

        setTimeout(() => {
            desbloquearPilarYRestaurar(pilar2);
            cerrarPuzzle(puzzleCorredizo1, pilar1);
        }, 1000);
    } else {
        bloquearMensaje(mensajeFeedback, "#ff1493", "Dedícate a otra cosa.");
        marcarInputError(inputPassword);
        efectoError();
    }
});

// ==============================================
// PILAR 2
// ==============================================
btnEntrarPilar2.addEventListener('click', () => {
    if (btnEntrarPilar2.classList.contains('bloqueado')) return;
    abrirPuzzle(pilar2, puzzleCorredizo2);
});

btnRetraerPuzzle2.addEventListener('click', () => {
    cerrarPuzzle(puzzleCorredizo2, pilar2);
});

btnResolver2.addEventListener('click', () => {
    if (inputPassword2.value.trim().toLowerCase() === "tinyurl") {
        bloquearMensaje(mensajeFeedback2, "#00ffcc", "Solo tuviste suerte.");
        efectoExito();

        setTimeout(() => {
            desbloquearPilarYRestaurar(pilar3);
            cerrarPuzzle(puzzleCorredizo2, pilar2);
        }, 1000);
    } else {
        bloquearMensaje(mensajeFeedback2, "#ff1493", "Bro, no es tan dificil");
        marcarInputError(inputPassword2);
        efectoError();
    }
});

// ==============================================
// PILAR 3
// ==============================================
btnEntrarPilar3.addEventListener('click', () => {
    if (btnEntrarPilar3.classList.contains('bloqueado')) return;
    abrirPuzzle(pilar3, puzzleCorredizo3);
});

btnRetraerPuzzle3.addEventListener('click', () => {
    cerrarPuzzle(puzzleCorredizo3, pilar3);
});

btnResolver3.addEventListener('click', () => {
    if (inputPassword3.value.trim() === "Tomodachi") {
        bloquearMensaje(mensajeFeedback3, "#00ffcc", "No pensé que llegarás hasta aquí");
        efectoExito();

        setTimeout(() => {
            desbloquearPilarYRestaurar(pilar4);
            cerrarPuzzle(puzzleCorredizo3, pilar3);
        }, 1000);
    } else {
        bloquearMensaje(mensajeFeedback3, "#ff1493", "JAJAJAJA");
        marcarInputError(inputPassword3);
        efectoError();
    }
});

// ==============================================
// PILAR 4
// ==============================================
btnEntrarPilar4.addEventListener('click', () => {
    if (btnEntrarPilar4.classList.contains('bloqueado')) return;
    abrirPuzzle(pilar4, puzzleCorredizo4);
});

btnRetraerPuzzle4.addEventListener('click', () => {
    cerrarPuzzle(puzzleCorredizo4, pilar4);
});

btnResolver4.addEventListener('click', () => {
    if (inputPassword4.value.trim() === ".com/") {
        bloquearMensaje(mensajeFeedback4, "#00ffcc", "Bro para, me estas asustando");
        efectoExito();

        setTimeout(() => {
            desbloquearPilarYRestaurar(pilar5);
            cerrarPuzzle(puzzleCorredizo4, pilar4);
        }, 1000);
    } else {
        bloquearMensaje(mensajeFeedback4, "#ff1493", "???");
        marcarInputError(inputPassword4);
        efectoError();
    }
});

// ==============================================
// PILAR 5
// ==============================================
btnEntrarPilar5.addEventListener('click', () => {
    if (btnEntrarPilar5.classList.contains('bloqueado')) return;
    abrirPuzzle(pilar5, puzzleCorredizo5);
});

btnRetraerPuzzle5.addEventListener('click', () => {
    cerrarPuzzle(puzzleCorredizo5, pilar5);
});

btnResolver5.addEventListener('click', () => {
    if (inputPassword5.value.trim() === "Yayita") {
        bloquearMensaje(mensajeFeedback5, "#00ffcc", "Tu deberias estar en un curso de informatica");
        efectoExito();

        setTimeout(() => {
            cerrarPuzzle(puzzleCorredizo5, pilar5);
            btnFlechaFinal.classList.add('mostrar-flecha-final');
        }, 1000);
    } else {
        bloquearMensaje(mensajeFeedback5, "#ff1493", "No creo que tengas que usar la guía");
        marcarInputError(inputPassword5);
        efectoError();
    }
});

// ==============================================
// PANTALLA FINAL / SECRETA
// ==============================================
btnResponderFinal.addEventListener('click', () => {
    const valor = inputLinkFinal.value.trim().replace(/\s+/g, '').toLowerCase();

    if (valor === "drxfg") {
        bloquearMensaje(mensajeFinal, "#00ffcc", "");
        efectoExito();
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank", "noopener,noreferrer");
    } else if (valor === "tinyurl.com/bdjxk278") {
        bloquearMensaje(mensajeFinal, "#00ffcc", "");
        efectoExito();
        window.open("https://tinyurl.com/bdjxk278", "_blank", "noopener,noreferrer");
    } else {
        bloquearMensaje(mensajeFinal, "#ff1493", "JAJAJA");
        marcarInputError(inputLinkFinal);
        efectoError();
    }
});

requestAnimationFrame(() => {
    btnEmpezar.classList.add('aparecer');
});