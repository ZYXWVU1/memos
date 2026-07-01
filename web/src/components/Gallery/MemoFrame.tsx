import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import type { Memo } from "@/types/proto/api/v1/memo_service_pb";
import { getFirstImageUrl, getMemoDisplayText } from "@/hooks/useGalleryMemos";

interface MemoFrameProps {
  memo: Memo;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
}

/**
 * 使用原生TextureLoader显示图片
 * 最稳定的方式，不依赖drei
 */
function TextureImage({
  url,
  frameWidth,
  frameHeight,
  onError,
}: {
  url: string;
  frameWidth: number;
  frameHeight: number;
  onError: () => void;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();

    loader.load(
      url,
      // 成功
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        setTexture(loadedTexture);
        console.log("✅ Texture loaded:", url);
      },
      // 进度
      undefined,
      // 错误
      (error) => {
        console.warn("❌ Texture load failed:", url, error);
        onError();
      }
    );

    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [url]);

  if (!texture) return null;

  return (
    <mesh position={[0, 0, 0.01]}>
      <planeGeometry args={[frameWidth * 0.9, frameHeight * 0.9]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * MemoFrame - 3D空间中的单个Memo展示卡片（升级版）
 * 特性：
 * - 毛玻璃亚克力相框材质
 * - 图片防拉伸（object-fit: cover效果）
 * - 高清SDF文字渲染
 * - Float悬浮微动效果
 */
export function MemoFrame({ memo, position, rotation, scale }: MemoFrameProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = getFirstImageUrl(memo);
  const displayText = getMemoDisplayText(memo, 50);

  // 调试：记录图片加载状态
  console.log('🎨 MemoFrame render:', {
    memoName: memo.name,
    imageUrl,
    imageError,
    shouldShowImage: imageUrl && !imageError,
    hasAttachments: memo.attachments?.length || 0
  });

  // 相框尺寸
  const frameWidth = 2;
  const frameHeight = 3;

  // 只在图片URL有效且未出错时显示图片
  const shouldShowImage = imageUrl && !imageError;

  // 手动实现浮动动画（替代Float组件）
  useFrame((state) => {
    if (groupRef.current) {
      // 悬浮发光效果
      if (hovered) {
        const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.3;
        groupRef.current.userData.emissiveIntensity = pulse;
      }

      // 手动浮动动画
      const floatY = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.3;
      const floatX = Math.cos(state.clock.elapsedTime * 0.3 + position[2]) * 0.1;
      groupRef.current.position.set(
        position[0] + floatX,
        position[1] + floatY,
        position[2]
      );

      // 轻微旋转
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  const handleClick = () => {
    setClicked(!clicked);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* 毛玻璃相框底板 - 使用 MeshPhysicalMaterial */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[frameWidth, frameHeight]} />
        <meshPhysicalMaterial
          transmission={hovered ? 0.9 : 1}
          roughness={0.2}
          thickness={2}
          envMapIntensity={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          color={hovered ? "#e0e7ff" : "#ffffff"}
          emissive={hovered ? "#4f46e5" : "#000000"}
          emissiveIntensity={hovered ? 0.3 : 0}
          opacity={0.95}
          transparent
        />
      </mesh>

      {/* 图片内容 - 使用原生TextureLoader */}
      {shouldShowImage && (
        <TextureImage
          url={imageUrl!}
          frameWidth={frameWidth}
          frameHeight={frameHeight}
          onError={() => setImageError(true)}
        />
      )}

      {/* 文字内容（如果没有图片或图片加载失败） - 使用SDF高清渲染 */}
      {!shouldShowImage && (
        <Text
          position={[0, 0, 0.02]}
          fontSize={0.2}
          maxWidth={frameWidth * 0.85}
          lineHeight={1.2}
          textAlign="center"
          color="#1f2937"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#ffffff"
        >
          {displayText}
        </Text>
      )}

      {/* 标题标签 - 始终显示在底部 */}
      {memo.property?.title && (
        <Text
          position={[0, -frameHeight / 2 - 0.3, 0.01]}
          fontSize={0.14}
          maxWidth={frameWidth}
          textAlign="center"
          color="#f3f4f6"
          anchorX="center"
          anchorY="top"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {memo.property.title}
        </Text>
      )}

      {/* 标签云（如果有标签） */}
      {memo.tags && memo.tags.length > 0 && (
        <Text
          position={[0, frameHeight / 2 + 0.2, 0.01]}
          fontSize={0.1}
          maxWidth={frameWidth}
          textAlign="center"
          color="#93c5fd"
          anchorX="center"
          anchorY="bottom"
        >
          {memo.tags.slice(0, 3).map(tag => `#${tag}`).join(" ")}
        </Text>
      )}

      {/* Pinned指示器 - 金色小球 */}
      {memo.pinned && (
        <mesh position={[frameWidth / 2 - 0.2, frameHeight / 2 - 0.2, 0.05]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      )}

      {/* 相框外框 - 深色边框 */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[frameWidth + 0.15, frameHeight + 0.15, 0.08]} />
        <meshStandardMaterial
          color="#1f2937"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* 点击后的详情弹窗（HTML混排） */}
      {clicked && (
        <Html
          position={[0, 0, 1]}
          center
          distanceFactor={6}
          style={{
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: clicked ? 1 : 0,
            transform: `scale(${clicked ? 1 : 0.5})`,
          }}
        >
          <MemoDetailCard memo={memo} onClose={() => setClicked(false)} />
        </Html>
      )}
    </group>
  );
}

/**
 * Memo详情卡片（HTML叠加层）
 */
function MemoDetailCard({ memo, onClose }: { memo: Memo; onClose: () => void }) {
  return (
    <div
      className="bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl p-6 max-w-md border border-gray-200"
      style={{ width: "400px" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
      >
        ✕
      </button>

      {/* 标题 */}
      {memo.property?.title && (
        <h3 className="text-xl font-bold text-gray-900 mb-3 pr-8">
          {memo.property.title}
        </h3>
      )}

      {/* 内容 */}
      <div className="text-gray-700 text-sm mb-4 max-h-64 overflow-y-auto">
        {memo.content}
      </div>

      {/* 标签 */}
      {memo.tags && memo.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {memo.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 时间信息 */}
      <div className="text-xs text-gray-500 flex justify-between items-center pt-4 border-t border-gray-200">
        <span>
          {memo.createTime
            ? new Date(Number(memo.createTime.seconds) * 1000).toLocaleDateString()
            : "Unknown date"}
        </span>
        {memo.pinned && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
            📌 Pinned
          </span>
        )}
      </div>
    </div>
  );
}
