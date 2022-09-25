import './estilos.scss';
import Pneuma from './Pneuma';
const soploRapido = 'soplo2.wav';
const pneuma = new Pneuma();

const mensaje = document.getElementById('mensaje');
const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');
let audioCargado = false;
let reproduciendo = false;
let pasoX = 0;
let analizador;
let animar = false;

const ancho = (lienzo.width = window.innerWidth);
const alto = (lienzo.height = window.innerHeight);
ctx.fillStyle = '#231942';
ctx.lineWidth = 2;
ctx.strokeStyle = '#e0b1cb';
ctx.fillRect(0, 0, ancho, alto);

async function inicio() {
  const fuente = await pneuma.cargarAudio(soploRapido);
  analizador = pneuma.crearAnalizador(fuente);

  pasoX = ancho / pneuma.tamañoBuffer;
  console.log(pasoX);
  mensaje.innerText = 'Audio Cargado';

  document.body.onclick = () => {
    fuente.onended = () => {
      animar = false;
    };
    animar = true;
    pintar();

    fuente.start();
  };
}

// const fuente = pneuma.crearOscilador();
// "sine", "square", "sawtooth", "triangle" and "custom"
// fuente.type = 'triangle';
// pneuma.definirFrecuencia(fuente, 20);

// fuente.connect(pneuma.ctx.destination);
// fuente.start();
inicio();

function pintar() {
  let x = 0;

  ctx.fillRect(0, 0, ancho, alto);
  ctx.beginPath();

  analizador.getByteFrequencyData(pneuma.datosAnalizador);
  console.log(pneuma.datosAnalizador);
  for (let i = 0; i < pneuma.tamañoBuffer; i++) {
    const v = pneuma.datosAnalizador[i] / 128;

    // Invertir (multiplicar * -1) para visualizar de abajo hacia arriba
    const y = -1 * ((v * alto) / 1.5);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y + alto * 0.9);
    }

    x += pasoX;
  }

  ctx.lineTo(ancho, alto / 2);
  ctx.stroke();

  if (animar) {
    requestAnimationFrame(pintar);
  }
}
