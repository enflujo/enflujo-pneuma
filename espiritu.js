import './estilos.scss';
import Pneuma from './Pneuma';
const pneuma = new Pneuma();

const lienzoAmplitud = document.getElementById('lienzoAmplitud');
const lienzoFrecuencia = document.getElementById('lienzoFrecuencia');
const ctxAmplitud = lienzoAmplitud.getContext('2d');
const ctxFrecuencia = lienzoFrecuencia.getContext('2d');
let pasoX = 0;
let analizadorL;
let analizadorR;

const ancho = (lienzoAmplitud.width = lienzoFrecuencia.width = window.innerWidth);
const alto = (lienzoAmplitud.height = lienzoFrecuencia.height = window.innerHeight);
const centroX = ancho / 2;
const centroY = alto / 2;
let anchoBarra = 0;

ctxAmplitud.lineWidth = 2;
ctxAmplitud.strokeStyle = '#e0b1cb';
// ctx.fillRect(0, 0, ancho, alto);

ctxFrecuencia.fillStyle = 'rgba(255, 255, 255, 0.5)';
ctxFrecuencia.lineWidth = 2;
ctxFrecuencia.strokeStyle = '#e0b1cb';
ctxFrecuencia.fillRect(0, 0, ancho, alto);

async function inicio() {
  // const scarlett = await pneuma.crearFuenteConMic('scarlett');
  //const presonus = await pneuma.crearFuenteConMic('presonus');
  const presonus = await pneuma.crearFuenteConMic('handy');
  // pneuma.crearAnalizador(scarlett);
  pneuma.crearAnalizador(presonus);

  const { tamañoBuffer } = presonus;

  pasoX = ancho / tamañoBuffer;
  anchoBarra = ancho / (tamañoBuffer / 2);

  pintar();

  function pintar() {
    ctxFrecuencia.clearRect(0, 0, ancho, alto);
    ctxAmplitud.clearRect(0, 0, ancho, alto);
    // pintarFrecuencia(scarlett, true);
    //  pintarFrecuencia(presonus, false);
    // pintarAmplitud(scarlett, true);
    pintarAmplitud(presonus, false);

    requestAnimationFrame(pintar);
  }
}

inicio();
let min = Infinity;
let max = -Infinity;

function pintarFrecuencia({ analizador, datosAnalizador, tamañoBuffer }, arriba) {
  analizador.getFloatFrequencyData(datosAnalizador);

  const base = arriba ? 0 : alto;

  for (let i = 0; i < tamañoBuffer / 2; i++) {
    const altoBarra = datosAnalizador[i];
    const direccion = arriba ? -1 : 1;
    const x = anchoBarra * i;

    ctxFrecuencia.fillStyle = `rgb(150, 50, ${altoBarra}, 0.5)`;
    ctxFrecuencia.fillRect(x, base, anchoBarra, altoBarra * direccion);
  }
}

function pintarAmplitud({ analizador, datosAnalizador, tamañoBuffer }, arriba) {
  let x = 0;

  analizador.getFloatTimeDomainData(datosAnalizador);

  ctxAmplitud.beginPath();
  const baseY = arriba ? alto / 1.5 : alto / 3;

  for (let i = 0; i < tamañoBuffer; i++) {
    const punto = datosAnalizador[i];
    const v = punto * baseY;
    const y = v + baseY;

    if (i === 0) {
      ctxAmplitud.moveTo(x, y);
    } else {
      ctxAmplitud.lineTo(x, y);
    }
    x += pasoX;
  }

  ctxAmplitud.lineTo(ancho, baseY);
  ctxAmplitud.stroke();
}
