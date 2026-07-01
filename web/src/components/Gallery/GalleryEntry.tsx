import { Link } from "react-router-dom";
import { Cuboid } from "lucide-react";
import { ROUTES } from "@/router/routes";

/**
 * GalleryEntryButton - 进入3D画廊的入口按钮
 * 可以放置在侧边栏、导航栏或任何合适的位置
 */
export function GalleryEntryButton() {
  return (
    <Link
      to={ROUTES.GALLERY}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      <Cuboid size={18} />
      <span className="font-medium">3D Gallery</span>
    </Link>
  );
}

/**
 * 导航栏链接版本（更简洁）
 */
export function GalleryNavLink() {
  return (
    <Link
      to={ROUTES.GALLERY}
      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Cuboid size={16} />
      <span>3D Gallery</span>
    </Link>
  );
}

/**
 * 浮动按钮版本（固定在页面角落）
 */
export function GalleryFloatingButton() {
  return (
    <Link
      to={ROUTES.GALLERY}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-110 group"
      title="Enter 3D Gallery"
    >
      <Cuboid size={24} className="group-hover:rotate-12 transition-transform" />
    </Link>
  );
}
