import { Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { GalleryScene } from "@/components/Gallery/GalleryScene";
import { useGalleryMemos } from "@/hooks/useGalleryMemos";

/**
 * 3D Memory Gallery - 全屏沉浸式3D记忆画廊
 */
export default function Gallery() {
  const { memos, isLoading, error } = useGalleryMemos(50);

  // 调试信息
  console.log("Gallery Debug:", {
    memosCount: memos.length,
    isLoading,
    hasError: !!error,
    memos: memos.slice(0, 3).map(m => ({
      name: m.name,
      hasAttachments: !!m.attachments?.length,
      content: m.content?.substring(0, 50),
    }))
  });

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-xl mb-4">Failed to load gallery</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      {/* 返回按钮 - 覆盖在3D场景上方 */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition"
        >
          <ArrowLeft size={16} />
          Exit Gallery
        </Link>
      </div>

      {/* 加载指示器 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-lg">Loading your memories...</p>
          </div>
        </div>
      )}

      {/* 无数据提示 */}
      {!isLoading && memos.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <div className="text-center text-white bg-black/50 backdrop-blur-sm rounded-lg p-8 max-w-md">
            <p className="text-2xl mb-4">📝 No Memos Yet</p>
            <p className="text-sm opacity-80 mb-4">
              Create some memos with images to see them in 3D space!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              <ArrowLeft size={16} />
              Create Memos
            </Link>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: [0, 1.6, 8],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        dpr={[1, 2]} // 设备像素比：移动端1x，桌面端最高2x
        gl={{
          antialias: true,
          alpha: false,
        }}
        shadows
      >
        <Suspense fallback={null}>
          <GalleryScene memos={memos} />
        </Suspense>
      </Canvas>

      {/* 操作提示 */}
      {!isLoading && memos.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-black/50 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm">
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">
              🖱️ Drag to look around • Click to view • Scroll to zoom
            </span>
            <span className="md:hidden">👆 Drag to explore • Tap to view</span>
            <span className="opacity-70">•</span>
            <span className="font-semibold">{memos.length} Memories</span>
          </div>
        </div>
      )}
    </div>
  );
}
