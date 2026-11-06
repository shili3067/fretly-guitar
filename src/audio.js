// All lesson types share the audio clock and the same count-in.
export class Player {
  async start({ bpm, length, events, loop, demo, onFrame, onEnd }) {
    this.stop();
    const generation = this.generation;
    this.audio ??= new AudioContext();
    await this.audio.resume();
    if (generation !== this.generation) return;
    const seconds = 60 / bpm;
    const origin = this.audio.currentTime + 0.1;
    let cycle = -1;
    const schedule = () => {
      const elapsed = (this.audio.currentTime - origin) / seconds - 4;
      if (elapsed >= length && !loop()) {
        this.stop();
        onEnd();
        return;
      }
      while (cycle * length <= elapsed + 0.2 / seconds) {
        const start = cycle === -1 ? -4 : cycle * length;
        const end = cycle === -1 ? 0 : start + length;
        if (cycle > 0 && !loop()) break;
        for (let beat = start; beat < end; beat++) {
          if (beat >= 0 && events.some(event => event.silentClick)) continue;
          this.tone(origin + (beat + 4) * seconds, (beat % 4 === 0 ? 1000 : 720), 0.035, 0.12);
        }
        if (cycle >= 0 && demo()) {
          for (const event of events) {
            for (const midi of event.notes ?? []) {
              this.tone(origin + (start + event.at + 4) * seconds, 440 * 2 ** ((midi - 69) / 12), Math.min(event.duration * seconds, 1.45), event.notes.length > 1 ? 0.034 : 0.09, 'pluck');
            }
          }
        }
        cycle++;
      }
      onFrame(elapsed < 0 ? Math.max(-4, elapsed) : elapsed % length, elapsed >= length);
    };
    schedule();
    this.timer = setInterval(schedule, 25);
  }

  tone(at, frequency, duration, volume, type = 'sine') {
    if (at < this.audio.currentTime) return;
    const oscillator = this.audio.createOscillator();
    const gain = this.audio.createGain();
    if (type === 'pluck') {
      this.pluck ??= this.audio.createPeriodicWave(
        new Float32Array(6), new Float32Array([0, 1, 0.32, 0.14, 0.06, 0.02]),
      );
      oscillator.setPeriodicWave(this.pluck);
    } else oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.connect(gain).connect(this.audio.destination);
    gain.gain.setValueAtTime(0.001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + Math.min(0.009, duration / 2));
    gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
    this.nodes.add(oscillator);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); this.nodes.delete(oscillator); };
    oscillator.start(at);
    oscillator.stop(at + duration);
  }

  generation = 0;
  nodes = new Set();
  stop() {
    this.generation++;
    clearInterval(this.timer);
    for (const node of this.nodes) node.stop();
    this.nodes.clear();
  }
}
