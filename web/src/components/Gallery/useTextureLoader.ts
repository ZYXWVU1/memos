import { useState, useEffect } from "react";
import * as THREE from "three";

/**
 * 安全的纹理加载Hook
 * 处理错误情况并返回null作为降级方案
 */
export function useTextureLoader(url: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url || error) {
      setTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();

    loader.load(
      url,
      // 成功回调
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        setTexture(loadedTexture);
      },
      // 进度回调
      undefined,
      // 错误回调
      (err) => {
        console.error("Failed to load texture:", url, err);
        setError(true);
        setTexture(null);
      }
    );

    // 清理函数：卸载时释放纹理
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [url, error]);

  return texture;
}
