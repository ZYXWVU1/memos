import type { Memo } from "@/types/proto/api/v1/memo_service_pb";
import type { Vector3Tuple } from "three";

export interface LayoutItem {
  memo: Memo;
  position: Vector3Tuple;
  rotation: [number, number, number];
  scale: number;
}

/**
 * 球面分布算法（Spherical Distribution）
 * 使用 Fibonacci 球面分布算法，将Memos均匀分布在球面上
 * 这是最自然、最美观的3D空间分布方式
 */
export function calculateSphericalLayout(memos: Memo[]): LayoutItem[] {
  if (!memos || memos.length === 0) return [];

  const layout: LayoutItem[] = [];
  const radius = 12; // 球体半径
  const goldenRatio = (1 + Math.sqrt(5)) / 2; // 黄金比例
  const angleIncrement = Math.PI * 2 * goldenRatio; // Fibonacci角度增量

  memos.forEach((memo, index) => {
    // Fibonacci球面分布公式
    const t = index / memos.length;
    const inclination = Math.acos(1 - 2 * t); // 倾角 (0 到 π)
    const azimuth = angleIncrement * index; // 方位角

    // 球面坐标转换为笛卡尔坐标
    const x = radius * Math.sin(inclination) * Math.cos(azimuth);
    const y = radius * Math.sin(inclination) * Math.sin(azimuth);
    const z = radius * Math.cos(inclination);

    // 相框朝向球心（法线指向中心）
    const rotationY = Math.atan2(x, z);
    const rotationX = -inclination;
    const rotationZ = 0;

    // 根据重要性调整缩放
    let scale = 1.0;
    if (memo.pinned) {
      scale = 1.4; // pinned的memo更大
    } else if (memo.property?.title) {
      scale = 1.15; // 有标题的稍大
    }

    layout.push({
      memo,
      position: [x, y, z],
      rotation: [rotationX, rotationY, rotationZ],
      scale,
    });
  });

  return layout;
}

/**
 * 计算3D画廊的空间布局（黄金螺旋）
 * 使用黄金螺旋线（Golden Spiral）算法在3D空间中分布Memos
 * 这种布局既美观又易于导航
 */
export function calculateGalleryLayout(memos: Memo[]): LayoutItem[] {
  if (!memos || memos.length === 0) return [];

  const layout: LayoutItem[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ≈137.5度
  const spiralSpacing = 2.5; // 相框之间的基础间距

  memos.forEach((memo, index) => {
    // 黄金螺旋的角度
    const theta = index * goldenAngle;

    // 螺旋半径随索引增长
    const radius = Math.sqrt(index + 1) * spiralSpacing;

    // 计算XZ平面上的位置（水平分布）
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);

    // Y轴位置：创建波浪起伏效果
    const y = Math.sin(index * 0.5) * 2 + Math.cos(index * 0.3) * 1.5;

    // 相框朝向中心点
    const rotationY = Math.atan2(x, z) + Math.PI;

    // 轻微的倾斜角度，增加动态感
    const rotationX = Math.sin(index * 0.7) * 0.1;
    const rotationZ = Math.cos(index * 0.5) * 0.05;

    // 根据重要性调整缩放
    let scale = 1.0;
    if (memo.pinned) {
      scale = 1.3; // pinned的memo更大
    } else if (memo.property?.title) {
      scale = 1.1; // 有标题的稍大
    }

    layout.push({
      memo,
      position: [x, y, z],
      rotation: [rotationX, rotationY, rotationZ],
      scale,
    });
  });

  return layout;
}

/**
 * 备选布局算法：圆柱体排列
 * 适合数量较少的场景（10-30个）
 */
export function calculateCylinderLayout(memos: Memo[]): LayoutItem[] {
  if (!memos || memos.length === 0) return [];

  const layout: LayoutItem[] = [];
  const radius = 10; // 圆柱半径
  const heightSpacing = 3; // 垂直间距
  const itemsPerRing = 8; // 每一圈的数量

  memos.forEach((memo, index) => {
    const ring = Math.floor(index / itemsPerRing);
    const angleOffset = (ring % 2) * (Math.PI / itemsPerRing); // 错开排列
    const angle = (index % itemsPerRing) * ((Math.PI * 2) / itemsPerRing) + angleOffset;

    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const y = ring * heightSpacing - 5; // 从下往上排列

    const rotationY = angle + Math.PI; // 朝向中心

    let scale = 1.0;
    if (memo.pinned) scale = 1.2;

    layout.push({
      memo,
      position: [x, y, z],
      rotation: [0, rotationY, 0],
      scale,
    });
  });

  return layout;
}

/**
 * 备选布局算法：随机3D云
 * 创建更自由、有机的分布
 */
export function calculateCloudLayout(memos: Memo[]): LayoutItem[] {
  if (!memos || memos.length === 0) return [];

  const layout: LayoutItem[] = [];
  const spreadX = 15;
  const spreadY = 8;
  const spreadZ = 15;

  // 使用确定性随机（基于索引），保证每次渲染位置一致
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };

  memos.forEach((memo, index) => {
    const x = (seededRandom(index * 3 + 1) - 0.5) * spreadX;
    const y = (seededRandom(index * 3 + 2) - 0.5) * spreadY + 2;
    const z = (seededRandom(index * 3 + 3) - 0.5) * spreadZ;

    // 朝向相机的一般方向
    const rotationY = Math.atan2(x, z) + Math.PI;
    const rotationX = (seededRandom(index * 5) - 0.5) * 0.3;
    const rotationZ = (seededRandom(index * 7) - 0.5) * 0.3;

    let scale = 0.8 + seededRandom(index * 11) * 0.4; // 0.8-1.2
    if (memo.pinned) scale *= 1.3;

    layout.push({
      memo,
      position: [x, y, z],
      rotation: [rotationX, rotationY, rotationZ],
      scale,
    });
  });

  return layout;
}
