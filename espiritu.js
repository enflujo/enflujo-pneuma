import './estilos.scss';
import Pneuma from './Pneuma';
//const soploRapido = 'soplo-rapido.wav';
const soploRapido = 'Los Días.mp3';
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
  console.log(pneuma.tamañoBuffer);
  pasoX = ancho / pneuma.tamañoBuffer;
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
let min = Infinity;
let max = -Infinity;
let tick = 0;
const vel = 2;

function pintar() {
  if (tick === vel) {
    let x = 0;
    ctx.fillRect(0, 0, ancho, alto);
    ctx.beginPath();

    analizador.getByteTimeDomainData(pneuma.datosAnalizador);
    const t0 = performance.now();
    for (let i = 0; i < pneuma.tamañoBuffer; i++) {
      const v = pneuma.datosAnalizador[i] / 128;
      const y = (v * alto) / 2;
      //console.log(pneuma.datosAnalizador[i], v);
      max = pneuma.datosAnalizador[i] > max ? pneuma.datosAnalizador[i] : max;
      min = pneuma.datosAnalizador[i] < min ? pneuma.datosAnalizador[i] : min;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += pasoX;
    }

    ctx.lineTo(ancho, alto / 2);
    ctx.stroke();

    const t1 = performance.now();
    mensaje.innerText = `min: ${min}, max: ${max} \ntiempo: ${(t1 - t0) / 1000}`;
    tick = 0;
  }

  tick++;
  if (animar) {
    requestAnimationFrame(pintar);
  } else {
    console.log(min, max);
  }
}
