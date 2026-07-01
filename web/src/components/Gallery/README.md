# 3D Memory Gallery

一个极具沉浸感的3D记忆画廊功能，将Memos在3D空间中以相框形式展示。

## 功能特性

### ✨ 核心功能
- **3D空间布局**：使用黄金螺旋算法在3D空间中优雅分布Memos
- **图片纹理映射**：自动将带图片附件的Memo渲染为相框
- **文字3D渲染**：无图片的Memo显示为带3D文字的卡片
- **交互式相机**：支持鼠标拖拽旋转、滚轮缩放
- **悬浮效果**：鼠标悬停时相框发光并放大
- **详情弹窗**：点击相框查看完整Memo内容
- **智能优先级**：自动根据重要性（pinned、有图片、有标题）排序

### 🎨 视觉效果
- 美术馆级别的光照系统
- 实时阴影和反射
- 平滑的动画过渡
- 渐变背景和氛围光

### 📱 响应式设计
- 桌面端：完整特效，60 FPS
- 移动端：优化性能，触摸交互

## 技术栈

- **3D引擎**: Three.js + @react-three/fiber
- **辅助库**: @react-three/drei
- **数据管理**: @tanstack/react-query
- **样式**: Tailwind CSS

## 快速开始

### 1. 访问3D画廊

在应用中添加入口按钮：

```tsx
import { GalleryFloatingButton } from "@/components/Gallery";

function App() {
  return (
    <div>
      {/* 你的应用内容 */}
      <GalleryFloatingButton />
    </div>
  );
}
```

或在导航栏中添加链接：

```tsx
import { GalleryNavLink } from "@/components/Gallery";

function Navigation() {
  return (
    <nav>
      <GalleryNavLink />
    </nav>
  );
}
```

### 2. 直接访问

浏览器访问：`/gallery`

## 使用方式

### 基础交互
- **旋转视角**：鼠标左键拖拽
- **缩放**：鼠标滚轮
- **查看详情**：点击相框
- **退出**：点击左上角"Exit Gallery"

### 移动端操作
- **旋转**：单指拖拽
- **缩放**：双指缩放
- **查看详情**：点击相框

## 自定义配置

### 修改布局算法

在 `GalleryScene.tsx` 中切换布局：

```tsx
import { calculateCylinderLayout } from "./layoutAlgorithm";

// 使用圆柱体布局
const layout = calculateCylinderLayout(memos);
```

可选布局：
- `calculateGalleryLayout` - 黄金螺旋（默认，推荐）
- `calculateCylinderLayout` - 圆柱体排列
- `calculateCloudLayout` - 随机云状分布

### 调整加载数量

在 `Gallery.tsx` 中修改：

```tsx
const { memos } = useGalleryMemos(30); // 改为30个
```

### 更换环境光照

在 `GalleryScene.tsx` 中修改：

```tsx
<Environment preset="sunset" /> 
// 可选: city, dawn, night, warehouse, forest, apartment
```

### 自定义相机位置

在 `Gallery.tsx` 的 Canvas 配置中：

```tsx
<Canvas
  camera={{
    position: [0, 2, 10], // [x, y, z]
    fov: 70, // 视野角度
  }}
/>
```

## 性能优化

### 当前配置
- 最大Memo数量：50个
- 纹理缓存：5分钟
- 设备像素比：移动端1x，桌面端2x
- 自动内存清理：React Three Fiber管理

### 优化建议
详见 [PERFORMANCE.md](./PERFORMANCE.md)

## 文件结构

```
src/
├── components/Gallery/
│   ├── GalleryScene.tsx        # 3D场景主组件
│   ├── MemoFrame.tsx            # 单个Memo的3D相框
│   ├── GalleryEntry.tsx         # 入口按钮组件
│   ├── layoutAlgorithm.ts       # 空间布局算法
│   ├── index.ts                 # 导出文件
│   ├── index.d.ts               # TypeScript类型定义
│   ├── PERFORMANCE.md           # 性能优化指南
│   └── README.md                # 本文档
├── hooks/
│   └── useGalleryMemos.ts       # 数据获取Hook
└── pages/
    └── Gallery.tsx              # 画廊页面
```

## API参考

### useGalleryMemos

获取并过滤适合3D展示的Memos。

```typescript
const { memos, isLoading, error } = useGalleryMemos(limit?: number);
```

**参数**：
- `limit`: 最大加载数量（默认50）

**返回值**：
- `memos`: 排序后的Memo数组
- `isLoading`: 加载状态
- `error`: 错误信息

### GalleryScene

3D场景的核心组件。

```typescript
<GalleryScene memos={memos} />
```

### MemoFrame

单个Memo的3D相框。

```typescript
<MemoFrame
  memo={memo}
  position={[x, y, z]}
  rotation={[rx, ry, rz]}
  scale={1.0}
/>
```

## 故障排除

### 问题：画廊加载缓慢
**解决方案**：
- 减少 `useGalleryMemos` 的 `limit` 参数
- 检查网络连接（图片加载）
- 查看浏览器控制台是否有纹理加载错误

### 问题：帧率低
**解决方案**：
- 在移动设备上使用（会自动降低质量）
- 减少Memo数量
- 禁用阴影：在 `GalleryScene.tsx` 中移除 `castShadow`

### 问题：纹理无法显示
**解决方案**：
- 检查图片URL的CORS配置
- 查看浏览器控制台的错误信息
- 确认附件类型为 `image/*`

### 问题：内存泄漏
**解决方案**：
- 确保正常退出画廊（点击Exit按钮）
- React Three Fiber会自动清理资源
- 如果长时间使用后卡顿，刷新页面

## 浏览器兼容性

### 完全支持
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 部分支持
- iOS Safari 13+ (性能降低)
- Android Chrome 85+ (性能降低)

### 不支持
- IE 11 及以下（不支持WebGL 2.0）

## 未来计划

- [ ] VR/AR模式支持
- [ ] 语音导航
- [ ] 时间轴过滤
- [ ] 标签云筛选
- [ ] 导出3D场景为视频
- [ ] 多人协同浏览
- [ ] AI生成的相框排列

## 贡献

欢迎提交Issue和PR！

## 许可证

遵循Memos项目的开源协议。
