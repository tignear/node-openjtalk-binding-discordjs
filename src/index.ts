import { Readable } from "stream";
import { synthesis as _synthesis, OpenJTalkOptions as _OpenJTalkOptions, dictionary_dir as _dictionary_dir, WaveObject } from "node-openjtalk-binding";
export type OpenJTalkOptions = Omit<_OpenJTalkOptions, "sampling_frequency" | "dictionary"> & {
  dictionary?: string
};
class SynthesizedSoundStream extends Readable {
  wave_p: Promise<boolean>;
  buf!: Int16Array;
  destroyed = false;
  pos: number = 0;
  constructor(wave: Promise<WaveObject>) {
    super();
    this.wave_p = wave.then(wave => {
      this.buf = wave.data;
      if (wave.sampleRate != 48000) {
        this._emitError(new Error(`Invalid sampleRate(Required 48000): ${wave.sampleRate}`));
        return false;
      }
      return true;
    }, err => {
      this._emitError(err);
      return false;
    });
  }
  _emitError(err: unknown) {
    if (!this.destroyed) {
      this.emit("error", err);
    }
  }
  _read(size: number = 48000 * 2 * 2 / 1000 * 20) {
    if (!this.buf) {
      this.wave_p.then((continues) => {
        if (continues) {
          this._read(size);
        }
      })
      return;
    }
    const offset = this.pos;
    let end = Math.ceil(size / 4);
    if (end + offset > this.buf.length) {
      end = this.buf.length - offset;
    }
    const buf = Buffer.alloc(end * 4);
    const dst = new Int16Array(buf.buffer);
    for (let i = 0; i < end; ++i) {
      const elem = this.buf[i + offset];
      dst[i * 2] = elem;
      dst[i * 2 + 1] = elem;
    }
    this.push(buf);
    this.pos += end;
    if (this.pos == this.buf.length) {
      this.buf = null!;
      this.push(null);
    }
  }
  _destroy() {
    this.wave_p = Promise.resolve(false);
    this.destroyed = false;
  }
}
/**
 * Text to voice Stream.
 * @param text Text to synthesize.
 * @param options OpenJTalk options excluded sampling_frequency.
 * @returns Stream of 48kHz 16bit stereo PCM.
 */
export function synthesis(text: string, options: OpenJTalkOptions): Readable {
  if ("sampling_frequency" in options && ((options as any).sampling_frequency != null || (options as any).sampling_frequency != 48000)) {
    throw new TypeError("Do not set sampling_frequency");
  }
  const p_wave = _synthesis(text, { dictionary: dictionary_dir, ...options, sampling_frequency: 48000 });
  return new SynthesizedSoundStream(p_wave);
}
export const dictionary_dir = _dictionary_dir;