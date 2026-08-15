import FaceEngine from "@/components/FaceEngine";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950">
      <div className="w-[800px] h-[480px] bg-black rounded-3xl border-8 border-zinc-800 shadow-2xl relative overflow-hidden flex items-center justify-center">
        {/* CRT/OLED Scanline Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-10" />
        
        {/* Screen Bezel inner shadow */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.8)] z-20" />

        <FaceEngine />
      </div>
      
      <p className="mt-8 text-zinc-500 font-mono text-sm max-w-lg text-center">
        BloomFace Web Client. This UI acts as the display for BloomOS. It expects a WebSocket server running on <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">localhost:4000</code>.
      </p>
    </main>
  );
}
