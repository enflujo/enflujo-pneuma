export default class Pneuma {
  constructor() {
    const ContextoAudio = window.AudioContext || window.webkitAudioContext;
    this.ctx = new ContextoAudio();
  }

  crearOscilador() {
    return this.ctx.createOscillator();
  }

  crearFuenteConArchivo(buffer) {
    const fuente = new AudioBufferSourceNode(this.ctx);
    fuente.buffer = buffer;
    fuente.connect(this.ctx.destination);
    return fuente;
  }

  crearAnalizador(fuente) {
    const analizador = this.ctx.createAnalyser();
    analizador.fftSize = 2048;
    this.tamañoBuffer = analizador.frequencyBinCount;
    this.datosAnalizador = new Float32Array(this.tamañoBuffer);
    analizador.getFloatTimeDomainData(this.datosAnalizador);

    fuente.connect(analizador);
    return analizador;
  }

  async cargarAudio(url) {
    const audioCrudo = await fetch(url).then((respuesta) => respuesta.arrayBuffer());
    const audioDecodificado = await this.ctx.decodeAudioData(audioCrudo);
    return this.crearFuenteConArchivo(audioDecodificado);
  }

  definirFrecuencia(fuente, frecuencia, tiempo = this.ctx.currentTime) {
    fuente.frequency.setValueAtTime(frecuencia, tiempo);
  }
}
