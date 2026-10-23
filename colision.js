
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const marcador = document.getElementById("marcador");
const nivelTexto = document.getElementById("nivel");
const velocidadTexto = document.getElementById("velocidadTexto");
const cantidadTexto = document.getElementById("cantidad");

const botonPausa = document.getElementById("botonPausa");
const botonReiniciar = document.getElementById("botonReiniciar");
const mensajePausa = document.getElementById("mensajePausa");
const estadoTexto = document.getElementById("estadoTexto");
const puntoEstado = document.getElementById("puntoEstado");

const TOTAL_OBJETOS = 25;
const GRAVEDAD = 0.22;

let ancho = 0;
let alto = 0;
let atrapadas = 0;
let objetos = [];
let estrellas = [];
let pausado = false;
let ultimaMarca = 0;

// ========================================
// CONFIGURACIÓN DEL CANVAS
// ========================================

function ajustarCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    ancho = rect.width;
    alto = rect.height;

    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    crearEstrellas();
}

function crearEstrellas() {
    estrellas = [];

    for (let i = 0; i < 100; i++) {
        estrellas.push({
            x: Math.random() * ancho,
            y: Math.random() * alto,
            radio: Math.random() * 1.7 + 0.3,
            opacidad: Math.random() * 0.7 + 0.2,
            fase: Math.random() * Math.PI * 2
        });
    }
}

// ========================================
// VELOCIDAD Y PUNTUACIÓN
// ========================================

function obtenerVelocidad() {
    if (atrapadas > 20) {
        return 1.8;
    }

    if (atrapadas > 10) {
        return 1.4;
    }

    return 1.0;
}

function actualizarMarcador() {
    marcador.textContent = String(atrapadas).padStart(3, "0");

    const velocidad = obtenerVelocidad();

    if (atrapadas > 20) {
        nivelTexto.textContent = "ALTO";
    } else if (atrapadas > 10) {
        nivelTexto.textContent = "MEDIO";
    } else {
        nivelTexto.textContent = "INICIAL";
    }

    velocidadTexto.textContent = "Velocidad x" +
        velocidad.toFixed(1);

    cantidadTexto.textContent =
        objetos.length + " / " + TOTAL_OBJETOS;
}

// ========================================
// CREACIÓN DE GEMAS
// ========================================

function crearGema(inicial = false) {
    const radio = 15 + Math.random() * 9;

    const colores = [
        "#00f5ff",
        "#287bff",
        "#63aaff",
        "#a4faff",
        "#4385ff",
        "#8ceeff"
    ];

    return {
        x: radio + Math.random() *
            Math.max(1, ancho - radio * 2),

        y: -radio - Math.random() * (inicial ? alto : 100),

        radio: radio,

        velocidadX: (Math.random() - 0.5) * 1.3,

        velocidadY: 0,

        // Cada gema tiene su propia velocidad de caída.
        gravedadPropia: 0.75 + Math.random() * 0.7,

        rotacion: Math.random() * Math.PI * 2,

        giro: (Math.random() - 0.5) * 0.055,

        color: colores[
            Math.floor(Math.random() * colores.length)
        ],

        rebotes: 0,

        estado: "cayendo"
    };
}

function iniciarJuego() {
    atrapadas = 0;
    pausado = false;
    ultimaMarca = 0;

    ajustarCanvas();

    objetos = [];

    for (let i = 0; i < TOTAL_OBJETOS; i++) {
        objetos.push(crearGema(true));
    }

    actualizarMarcador();
    actualizarControles();
}

// ========================================
// FONDO ESPACIAL
// ========================================

function dibujarFondo(tiempo) {
    const degradado = ctx.createLinearGradient(
        0, 0, 0, alto
    );

    degradado.addColorStop(0, "#07132b");
    degradado.addColorStop(0.55, "#0b1740");
    degradado.addColorStop(1, "#100c2d");

    ctx.fillStyle = degradado;
    ctx.fillRect(0, 0, ancho, alto);

    // Resplandor azul en el centro.
    const resplandor = ctx.createRadialGradient(
        ancho * 0.5,
        alto * 0.45,
        10,
        ancho * 0.5,
        alto * 0.45,
        alto * 0.65
    );

    resplandor.addColorStop(0, "#0759a51c");
    resplandor.addColorStop(1, "#00102000");

    ctx.fillStyle = resplandor;
    ctx.fillRect(0, 0, ancho, alto);

    // Estrellas titilantes.
    for (const estrella of estrellas) {
        const brillo = 0.65 + 0.35 *
            Math.sin(tiempo * 0.001 + estrella.fase);

        ctx.beginPath();

        ctx.arc(
            estrella.x,
            estrella.y,
            estrella.radio,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            `rgba(170,235,255,${estrella.opacidad * brillo})`;

        ctx.fill();
    }

    // Línea luminosa del suelo.
    ctx.save();

    ctx.shadowColor = "#00f5ff";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#00eaff";

    ctx.fillRect(0, alto - 3, ancho, 3);

    ctx.restore();
}

// ========================================
// DIBUJAR GEMAS NEÓN
// ========================================

function dibujarGema(gema) {
    ctx.save();

    ctx.translate(gema.x, gema.y);
    ctx.rotate(gema.rotacion);

    // Forma de cristal hexagonal.
    ctx.beginPath();

    for (let i = 0; i < 6; i++) {
        const angulo = Math.PI / 3 * i - Math.PI / 6;

        const px = Math.cos(angulo) * gema.radio;
        const py = Math.sin(angulo) * gema.radio;

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.closePath();

    ctx.shadowColor = gema.color;
    ctx.shadowBlur = 20;

    const relleno = ctx.createLinearGradient(
        -gema.radio,
        -gema.radio,
        gema.radio,
        gema.radio
    );

    relleno.addColorStop(0, "#ffffff");
    relleno.addColorStop(0.25, gema.color);
    relleno.addColorStop(1, "#1748bb");

    ctx.fillStyle = relleno;
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#d9ffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Facetas del cristal.
    ctx.beginPath();

    ctx.moveTo(-gema.radio * 0.5, -gema.radio * 0.45);
    ctx.lineTo(0, gema.radio * 0.65);
    ctx.lineTo(gema.radio * 0.5, -gema.radio * 0.45);

    ctx.strokeStyle = "#ffffffaa";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(-gema.radio * 0.5, -gema.radio * 0.45);
    ctx.lineTo(0, -gema.radio * 0.15);
    ctx.lineTo(gema.radio * 0.5, -gema.radio * 0.45);

    ctx.strokeStyle = "#ffffffdd";
    ctx.stroke();

    ctx.restore();
}

// ========================================
// MOVIMIENTO, GRAVEDAD Y REBOTES
// ========================================

function moverGema(gema, delta) {
    const factor = obtenerVelocidad();

    gema.rotacion += gema.giro * delta * factor;

    // Desplazamiento horizontal.
    gema.x += gema.velocidadX * delta * factor;

    // Rebote contra las paredes laterales.
    if (gema.x - gema.radio < 0) {
        gema.x = gema.radio;
        gema.velocidadX = Math.abs(gema.velocidadX);
    }

    if (gema.x + gema.radio > ancho) {
        gema.x = ancho - gema.radio;
        gema.velocidadX = -Math.abs(gema.velocidadX);
    }

    // Aplicar gravedad durante la caída y los rebotes.
    if (
        gema.estado === "cayendo" ||
        gema.estado === "rebotando"
    ) {
        gema.velocidadY +=
            GRAVEDAD * gema.gravedadPropia * delta * factor;

        gema.y += gema.velocidadY * delta * factor;

        // Contacto con el suelo.
        if (gema.y + gema.radio >= alto) {
            gema.y = alto - gema.radio;

            const fuerza = Math.abs(gema.velocidadY);

            let perdidaEnergia;

            if (gema.estado === "cayendo") {
                perdidaEnergia = 0.62;
            } else {
                perdidaEnergia = 0.48;
            }

            const nuevaFuerza = fuerza * perdidaEnergia;

            gema.rebotes++;

            // Los rebotes pierden energía progresivamente.
            if (nuevaFuerza > 1.2 && gema.rebotes < 7) {
                gema.velocidadY = -nuevaFuerza;
                gema.estado = "rebotando";
            } else {
                gema.estado = "terminada";
            }
        }
    }
}

// ========================================
// SUSTITUIR UNA GEMA
// ========================================

function reiniciarGema(indice) {
    objetos[indice] = crearGema(false);

    actualizarMarcador();
}

// ========================================
// CONTROLES DE PAUSA Y REINICIO
// ========================================

function actualizarControles() {
    if (pausado) {
        botonPausa.textContent = "▶ Reanudar";

        mensajePausa.classList.add("visible");

        estadoTexto.textContent = "SISTEMA EN PAUSA";
        puntoEstado.style.background = "#ffcf5c";
        puntoEstado.style.boxShadow = "0 0 12px #ffcf5c";
    } else {
        botonPausa.textContent = "❚❚ Pausar";

        mensajePausa.classList.remove("visible");

        estadoTexto.textContent = "SISTEMA ACTIVO";
        puntoEstado.style.background = "#00f5ff";
        puntoEstado.style.boxShadow = "0 0 12px #00f5ff";
    }
}

botonPausa.addEventListener("click", function() {
    pausado = !pausado;

    ultimaMarca = 0;

    actualizarControles();
});

botonReiniciar.addEventListener("click", function() {
    iniciarJuego();
});

// ========================================
// DETECCIÓN DEL CLIC IZQUIERDO
// ========================================

canvas.addEventListener("click", function(evento) {
    if (evento.button !== 0 || pausado) {
        return;
    }

    const rect = canvas.getBoundingClientRect();

    const mouseX =
        (evento.clientX - rect.left) * (ancho / rect.width);

    const mouseY =
        (evento.clientY - rect.top) * (alto / rect.height);

    // Revisar las gemas desde la última dibujada.
    for (let i = objetos.length - 1; i >= 0; i--) {
        const gema = objetos[i];

        const dx = mouseX - gema.x;
        const dy = mouseY - gema.y;

        const distancia = Math.sqrt(dx * dx + dy * dy);

        if (distancia <= gema.radio) {
            atrapadas++;

            // La gema atrapada se sustituye inmediatamente.
            reiniciarGema(i);

            break;
        }
    }
});

// ========================================
// BUCLE PRINCIPAL DE ANIMACIÓN
// ========================================

function animar(tiempo) {
    let delta = 1;

    if (ultimaMarca !== 0) {
        delta = (tiempo - ultimaMarca) / 16.67;

        // Evitar saltos grandes si se bloquea la pestaña.
        delta = Math.min(delta, 2);
    }

    ultimaMarca = tiempo;

    dibujarFondo(tiempo);

    for (let i = 0; i < objetos.length; i++) {
        const gema = objetos[i];

        if (!pausado) {
            moverGema(gema, delta);

            if (gema.estado === "terminada") {
                reiniciarGema(i);
                continue;
            }
        }

        dibujarGema(gema);
    }

    requestAnimationFrame(animar);
}

// ========================================
// INICIAR APLICACIÓN
// ========================================

window.addEventListener("resize", ajustarCanvas);

iniciarJuego();

actualizarControles();

requestAnimationFrame(animar);
