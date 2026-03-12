import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Move, ZoomIn, RotateCcw, X, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';

interface ImageTransform { scale: number; x: number; y: number; }

interface ImageTransformEditorProps {
  imageUrl: string;
  initialTransform: ImageTransform;
  onSave: (transform: ImageTransform) => void;
  onClose: () => void;
}

export default function ImageTransformEditor({
  imageUrl,
  initialTransform,
  onSave,
  onClose
}: ImageTransformEditorProps) {
  const [transform, setTransform] = useState<ImageTransform>(initialTransform);
  const handleReset = () => setTransform({ scale: 1, x: 0, y: 0 });

  return (
    // 👇 เพิ่ม z-[9999] เพื่อให้ลอยทับทุกอย่าง และป้องกันอาการค้าง
    <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col p-4 md:p-8 backdrop-blur-xl overflow-hidden">
      <div className="flex items-center justify-between mb-4 max-w-6xl mx-auto w-full shrink-0">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Move className="w-6 h-6 mr-3 text-blue-400" /> ปรับแต่งรูปภาพ
        </h3>
        <div className="flex items-center space-x-2">
            <Button onClick={handleReset} variant="outline" className="text-white border-white/20 hover:bg-white/10 text-xs">
                <RotateCcw className="w-3 h-3 mr-2" /> รีเซ็ต
            </Button>
            <Button onClick={() => onSave(transform)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                บันทึกตำแหน่ง
            </Button>
            <button onClick={onClose} className="p-2 text-white/50 hover:text-white"><X className="w-8 h-8"/></button>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-6 overflow-hidden">
        <div className="flex-1 bg-[#111] rounded-2xl overflow-hidden border border-white/10 relative flex items-center justify-center shadow-2xl">
            <div className="relative w-full h-full flex items-center justify-center">
                <img src={imageUrl} alt="Preview" className="max-w-none transition-all duration-200 ease-out"
                    style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, width: 'auto', height: 'auto' }} 
                />
            </div>
            <div className="absolute inset-0 pointer-events-none border border-blue-500/20 grid grid-cols-2 grid-rows-2 opacity-30"></div>
        </div>

        <div className="w-full md:w-64 space-y-6 bg-white/5 p-5 rounded-2xl border border-white/10 shrink-0">
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 flex justify-between"><span>ขนาด (Scale)</span><span className="text-blue-400">{transform.scale.toFixed(2)}x</span></label>
                <input type="range" min="0.1" max="5" step="0.01" value={transform.scale} onChange={(e) => setTransform({...transform, scale: parseFloat(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 flex justify-between"><span>แนวนอน (X)</span><span className="text-white">{transform.x}px</span></label>
                <input type="range" min="-800" max="800" value={transform.x} onChange={(e) => setTransform({...transform, x: parseInt(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
            <div className="space-y-3">
                <label className="text-xs font-bold text-gray-400 flex justify-between"><span>แนวตั้ง (Y)</span><span className="text-white">{transform.y}px</span></label>
                <input type="range" min="-800" max="800" value={transform.y} onChange={(e) => setTransform({...transform, y: parseInt(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
        </div>
      </div>
    </div>
  );
}