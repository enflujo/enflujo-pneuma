export default class Pneuma {
  constructor() {
    const ContextoAudio = window.AudioContext || window.webkitAudioContext;
    this.ctx = new ContextoAudio();
  }

  crearOscilador() {
    return this.ctx.createOscillator();
  }

  // Función para crear fuente desde archivo
  async crearFuenteConArchivo(buffer) {
    const fuente = new AudioBufferSourceNode(this.ctx);
    fuente.buffer = buffer;
    fuente.connect(this.ctx.destination);

    return fuente;
  }

  /**
   * Función para crear fuente desde entradas externas de audio (micrófonos, interfaces).
   * @param {string} entrada 'interfaz' o 'microfono' para elegir la entrada de audio.
   */
  async crearFuenteConMic(entrada) {
    const dispositivosConectados = await navigator.mediaDevices.enumerateDevices();
    console.log(dispositivosConectados);
    const dispositivo = dispositivosConectados.find(({ kind, label }) => {
      return kind === 'audioinput' && label.toLowerCase().includes(entrada);
    });

    if (dispositivo) {
      const flujo = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: {
            exact: dispositivo.deviceId,
          },
        },
        video: false,
      });
      const ctx = new AudioContext();

      const fuente = ctx.createMediaStreamSource(flujo);
      fuente.connect(ctx.destination);
      return { ctx, fuente };
    } else {
      console.error(`No encontró la entrada ${entrada}`);
    }
  }

  /**
   * Crear un analizador y conectarlo con una fuente y dividir separar los canales
   * L de R para trabajarlos por separado.
   * Por ahora solo se pueden separar si la fuente viene de un archivo de audio.
   * @param {MediaStreamSource | AudioBufferSourceNode} fuente (MediaStreamSource o AudioBufferSourceNode)
   * @param {Number} canal (0, 1)
   */
  crearAnalizador(interfaz) {
    const { ctx, fuente } = interfaz;
    const analizador = ctx.createAnalyser();
    analizador.fftSize = 2048;
    const tamañoBuffer = analizador.frequencyBinCount;

    /** Datos para trabajar con getByteTimeDomainData y getByteFrequencyData */
    //this.datosAnalizador = new Uint8Array(this.tamañoBuffer);

    /** Datos para trabajar con getFloatTimeDomainData y getFloatFrequencyData */
    const datosAnalizador = new Float32Array(tamañoBuffer);

    fuente.connect(analizador);

    return Object.assign(interfaz, { analizador, datosAnalizador, tamañoBuffer });
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
