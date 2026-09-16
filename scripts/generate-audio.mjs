import { writeFileSync } from "node:fs";

const sampleRate = 22050;
const duration = 12;
const sampleCount = sampleRate * duration;
const dataSize = sampleCount * 2;
const wav = Buffer.alloc(44 + dataSize);

wav.write("RIFF", 0);
wav.writeUInt32LE(36 + dataSize, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(dataSize, 40);

const chords = [
  [261.63, 329.63, 392],
  [220, 261.63, 329.63],
  [174.61, 220, 261.63],
  [196, 246.94, 293.66],
];

for (let index = 0; index < sampleCount; index += 1) {
  const time = index / sampleRate;
  const chord = chords[Math.floor(time / 3) % chords.length];
  const withinChord = time % 3;
  const envelope = Math.min(1, withinChord * 2.5) * Math.min(1, (3 - withinChord) * 1.8);
  const shimmer = Math.sin(Math.PI * 2 * chord[2] * 2 * time) * 0.04;
  const tone = chord.reduce((sum, frequency, noteIndex) => (
    sum + Math.sin(Math.PI * 2 * frequency * time + noteIndex * 0.35) * (0.16 - noteIndex * 0.025)
  ), 0);
  const sample = Math.max(-1, Math.min(1, (tone + shimmer) * envelope * 0.42));
  wav.writeInt16LE(Math.round(sample * 32767), 44 + index * 2);
}

writeFileSync(new URL("../public/assets/scrapbook-loop.wav", import.meta.url), wav);
