import { useRef } from "react";
import { Environment, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { Memo } from "@/types/proto/api/v1/memo_service_pb";
import { MemoFrame } from "./MemoFrame";
import { calculateSphericalLayout } from "./layoutAlgorithm";

interface GallerySceneProps {
  memos: Memo[];
}

/**
 * GalleryScene - 3D画廊的核心场景组件
 * 包含环境光照、相机控制和所有Memo节点
 */
export function GalleryScene({ memos }: GallerySceneProps) {
  const groupRef = useRef<Group>(null);

  // 计算空间布局：使用球面分布算法
  const layout = calculateSphericalLayout(memos);

  // 整体场景的缓慢旋转动画
  useFrame((state) => {
    if (groupRef.current) {
      // 非常缓慢地旋转整个球体，营造宇宙感
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <>
      {/* 环境光照 - 使用预设的HDR环境贴图 */}
      <Environment
        preset="sunset" // 夕阳氛围更温暖
        background={false} // 不替换背景（我们有自定义渐变背景）
        blur={0.5} // 轻微模糊，营造柔和氛围
      />

      {/* 补充光源 - 增强场景深度 */}
      <ambientLight intensity={0.4} />

      {/* 主聚光灯 - 从上方照亮中心区域 */}
      <spotLight
        position={[10, 20, 10]}
        angle={0.5}
        penumbra={1}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* 辅助聚光灯 - 从另一侧平衡光照 */}
      <spotLight
        position={[-10, 15, -10]}
        angle={0.4}
        penumbra={1}
        intensity={1}
        color="#a78bfa" // 轻微紫色调
      />

      {/* 填充光 - 提亮暗部 */}
      <directionalLight
        position={[0, 5, 5]}
        intensity={0.5}
        color="#fbbf24"
      />

      {/* 相机控制器 - 支持鼠标/触摸交互 */}
      <OrbitControls
        enableDamping // 阻尼感，让移动更平滑
        dampingFactor={0.05}
        minDistance={5} // 最近距离（可以更近地观察相框）
        maxDistance={40} // 最远距离（可以看到整个球体）
        maxPolarAngle={Math.PI} // 允许看到球体下方
        minPolarAngle={0} // 允许看到球体上方
        target={[0, 0, 0]} // 视点中心
        autoRotate={false} // 不自动旋转（用户手动控制）
        autoRotateSpeed={0.5}
      />

      {/* Memo Frame 集合 - 球面分布 */}
      <group ref={groupRef}>
        {layout.map((item, index) => (
          <MemoFrame
            key={item.memo.name || index}
            memo={item.memo}
            position={item.position}
            rotation={item.rotation}
            scale={item.scale}
          />
        ))}
      </group>
    </>
  );
}
