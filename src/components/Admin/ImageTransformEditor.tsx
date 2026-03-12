import { useState, useRef, useCallback } from 'react';
import QuickPinchZoom, { make3dTransformValue } from 'react-quick-pinch-zoom';
import { Button } from '@/components/ui/button';
import { Move, ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';

interface ImageTransform {
  scale: number;
  x: number;
  y: number;
}

interface ImageTransformEditorProps {
  imageUrl: string;
  initialTransform: ImageTransform;
  onSave: (transform: ImageTransform) => void;
  onClose: () => void;
  aspectRatio?: number;
}

export default function ImageTransformEditor({
  imageUrl,
  initialTransform,
  onSave,
  onClose
}: ImageTransformEditorProps) {
  const [transform, setTransform] = useState<ImageTransform>(initialTransform);
  // 👇 แก้ไขบรรทัด useRef ทั้งสองบรรทัดนี้
const pinchZoomRef = useRef<QuickPinchZoom>(null);
const imageRef = useRef<HTMLDivElement>(null);

  const onUpdate = useCallback(({ scale, x, y }: { scale: number; x: number; y: number }) => {
    if (imageRef.current) {
      const value = make3dTransformValue({ scale, x, y });
      imageRef.current.style.setProperty('transform', value);
      setTransform({ scale, x, y });
    }
  }, []);

  const handleReset = () => {
    if (pinchZoomRef.current) {
      pinchZoomRef.current.scaleTo({ scale: 1, x: 0, y: 0 });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col p-4 md:p-10 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto w-full">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Move className="w-6 h-6 mr-3 text-blue-400" />
          ปรับตำแหน่งและขนาดรูปภาพ
        </h3>
        <div className="flex items-center space-x-3">
            <Button onClick={handleReset} variant="outline" className="text-white border-white/20 hover:bg-white/10">
                <RotateCcw className="w-4 h-4 mr-2" /> รีเซ็ต
            </Button>
            <Button onClick={() => onSave(transform)} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                บันทึกการจัดวาง
            </Button>
            <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors"><X className="w-8 h-8"/></button>
        </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-8 overflow-hidden">
        {/* กรอบพรีวิว */}
        <div className="flex-1 bg-[#111] rounded-2xl overflow-hidden cursor-move border-2 border-white/10 relative shadow-2xl">
          <QuickPinchZoom
            ref={pinchZoomRef}
            onUpdate={onUpdate}
            draggableUnZoomed={true}
            minScale={0.1}
            maxScale={5}
          >
            <div ref={imageRef} className="w-full h-full flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Transform Preview"
                className="max-w-none transition-none"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          </QuickPinchZoom>
          
          <div className="absolute inset-0 pointer-events-none border border-white/5 grid grid-cols-3 grid-rows-3 opacity-30">
            {[...Array(9)].map((_, i) => <div key={i} className="border border-white/5"></div>)}
          </div>
        </div>

        {/* แผงควบคุม */}
        <div className="w-full md:w-72 space-y-8 bg-white/5 p-6 rounded-2xl border border-white/10">
            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-300 flex items-center justify-between">
                    <span className="flex items-center"><ZoomIn className="w-4 h-4 mr-2 text-blue-400"/> ขยาย/ย่อ</span>
                    <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">{transform.scale.toFixed(2)}x</span>
                </label>
                
                <input 
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.01"
                    value={transform.scale}
                    onChange={(e) => {
                        const newScale = parseFloat(e.target.value);
                        if (pinchZoomRef.current) {
                            pinchZoomRef.current.scaleTo({ scale: newScale, x: transform.x, y: transform.y });
                        }
                    }}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
                    <span>Small</span>
                    <span>Large</span>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
                <label className="text-sm font-bold text-gray-300 flex items-center">
                    <Move className="w-4 h-4 mr-2 text-blue-400"/> ตำแหน่งปัจจุบัน
                </label>
                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                    <div className="bg-black/30 p-2 rounded border border-white/5 text-gray-400">X: <span className="text-white">{transform.x.toFixed(0)}</span></div>
                    <div className="bg-black/30 p-2 rounded border border-white/5 text-gray-400">Y: <span className="text-white">{transform.y.toFixed(0)}</span></div>
                </div>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
                <p className="font-bold mb-1">💡 ทิปการใช้งาน:</p>
                <li>ลากรูปเพื่อเปลี่ยนตำแหน่ง</li>
                <li>ใช้ลูกกลิ้งเมาส์เพื่อซูม</li>
                <li>ใช้แถบเลื่อนด้านบนเพื่อปรับขนาด</li>
            </div>
        </div>
      </div>
    </div>
  );
}