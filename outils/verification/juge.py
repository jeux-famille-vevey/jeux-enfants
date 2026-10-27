"""Juge : Whisper turbo (français). transcrire(fichier) -> texte."""
import subprocess, numpy as np, sherpa_onnx, sys, os
D="/tmp/claude-0/tts/sherpa-onnx-whisper-turbo/"
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=D+"turbo-encoder.int8.onnx",decoder=D+"turbo-decoder.int8.onnx",tokens=D+"turbo-tokens.txt",language="fr",task="transcribe",num_threads=2)
def audio(f):
    raw=subprocess.run(["ffmpeg","-v","quiet","-i",f,"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.int16).astype(np.float32)/32768
def transcrire(f, avant=None):
    a=audio(f); z=np.zeros(8000,dtype=np.float32)
    parts=[z]
    if avant is not None: parts+= [audio(avant), z]
    parts+=[a, np.zeros(16000,dtype=np.float32)]
    s=rec.create_stream(); s.accept_waveform(16000,np.concatenate(parts)); rec.decode_stream(s)
    return s.result.text.strip()
if __name__=="__main__":
    for f in sys.argv[1:]: print(os.path.basename(f),"→",transcrire(f))
