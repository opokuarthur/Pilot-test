#!/usr/bin/env bash
# Prepare the audio for "Ronaldo vs Jesus" from the two source files:
#   public/audio/ronaldo-vs-jesus-vo.mp3              ElevenLabs voiceover (143.6 s, -22 LUFS)
#   public/audio/the-mountain-trailer-cinematic.mp3   music (99 s, -11 LUFS)
# →
#   public/audio/ronaldo-vs-jesus-vo-mix.mp3          voice +4 dB through a limiter
#                                                     (latency-compensated: timing unchanged)
#   public/audio/ronaldo-vs-jesus-music.mp3           music extended to ~149 s, EQ'd for phone
#                                                     speakers (less sub-bass, more mids/highs:
#                                                     60% of the track's energy sat below 150 Hz,
#                                                     which phones barely play), compressed,
#                                                     normalised to -16 LUFS (the mix sets the level)
# The music is extended with two beat-matched loop seams (found by comparing
# the spectra around candidate jump points), each a short equal-power crossfade:
#   69.000 s → 23.189 s   (inside the climax, back into the rising section)
#   90.500 s → 86.402 s   (one phrase repeated in the calm outro)
# so the track's own ending lands on the end card.
set -euo pipefail
cd "$(dirname "$0")/../.."
A=public/audio
ffmpeg -v error -y -i "$A/ronaldo-vs-jesus-vo.mp3" \
  -af "volume=1.58,alimiter=limit=0.84:attack=5:release=60:level=false:latency=1" \
  -ar 44100 -c:a libmp3lame -b:a 192k "$A/ronaldo-vs-jesus-vo-mix.mp3"
ffmpeg -v error -y -i "$A/the-mountain-trailer-cinematic.mp3" -filter_complex "\
[0]atrim=0:69.125,asetpts=PTS-STARTPTS[a];\
[0]atrim=23.064:90.65,asetpts=PTS-STARTPTS[b];\
[0]atrim=86.252,asetpts=PTS-STARTPTS[c];\
[a][b]acrossfade=d=0.25:c1=qsin:c2=qsin[ab];\
[ab][c]acrossfade=d=0.3:c1=qsin:c2=qsin,\
highpass=f=45,bass=g=-6:f=140,equalizer=f=1200:t=q:w=1.2:g=4,treble=g=5:f=3000,\
acompressor=threshold=-20dB:ratio=3:attack=20:release=300:makeup=1,\
loudnorm=I=-16:TP=-1.5:LRA=7[out]" -map "[out]" -ar 44100 -c:a libmp3lame -b:a 192k "$A/ronaldo-vs-jesus-music.mp3"
for f in ronaldo-vs-jesus-vo-mix ronaldo-vs-jesus-music; do
  printf "%s: %ss " "$f" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$A/$f.mp3")"
  ffmpeg -v info -i "$A/$f.mp3" -af ebur128=framelog=quiet:peak=true -f null - 2>&1 | grep -E "^\s+I:|Peak:" | tail -2 | tr -s ' ' | tr '\n' ' '; echo
done
