import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { memoServiceClient } from "@/connect";
import type { Memo } from "@/types/proto/api/v1/memo_service_pb";

/**
 * 3D Gallery专用的Memo数据Hook
 * 过滤并获取适合在3D空间中展示的Memos
 * 优先级：带图片附件 > 带标题 > 最近更新
 */
export const useGalleryMemos = (limit = 50) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["gallery-memos", limit],
    queryFn: async () => {
      // 获取最近的memos，增加一些余量以便过滤
      const response = await memoServiceClient.listMemos({
        pageSize: limit * 2,
        filter: "",
        orderBy: "update_time desc",
      });
      return response.memos;
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存，避免频繁刷新
  });

  // 数据处理和优先级排序
  const processedMemos = useMemo(() => {
    if (!data || data.length === 0) return [];

    // 计算每个Memo的优先级分数
    const scoredMemos = data.map((memo) => {
      let score = 1; // 基础分数，确保所有memo都有分数

      // 有图片附件 +10分
      const hasImage = memo.attachments?.some(
        (att) => att.type?.startsWith("image/")
      );
      if (hasImage) score += 10;

      // 有标题 +5分
      if (memo.property?.title) score += 5;

      // 内容长度适中 +3分 (100-500字符)
      const contentLength = memo.content?.length || 0;
      if (contentLength >= 100 && contentLength <= 500) score += 3;
      // 内容太短也给1分
      else if (contentLength > 0) score += 1;

      // 有标签 +2分
      if (memo.tags && memo.tags.length > 0) score += 2;

      // pinned的memo +8分
      if (memo.pinned) score += 8;

      return { memo, score, hasImage };
    });

    // 按分数排序并限制数量
    // 注意：即使分数为0，也会包含在结果中
    return scoredMemos
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => ({
        ...item.memo,
        _hasImage: item.hasImage,
      }));
  }, [data, limit]);

  return {
    memos: processedMemos,
    isLoading,
    error,
  };
};

/**
 * 辅助函数：从Memo中提取第一张图片URL
 */
export const getFirstImageUrl = (memo: Memo): string | null => {
  const imageAttachment = memo.attachments?.find((att) =>
    att.type?.startsWith("image/")
  );

  // 调试信息
  if (imageAttachment) {
    const url = imageAttachment.externalLink || `/api/v1/${imageAttachment.name}`;
    console.log('📸 Image URL:', {
      memoName: memo.name,
      attachmentName: imageAttachment.name,
      externalLink: imageAttachment.externalLink,
      finalUrl: url,
      type: imageAttachment.type
    });
    return url;
  }

  return null;
};

/**
 * 辅助函数：生成Memo的显示文本（标题优先，否则截取内容）
 */
export const getMemoDisplayText = (memo: Memo, maxLength = 100): string => {
  if (memo.property?.title) {
    return memo.property.title;
  }

  const content = memo.content || "";
  if (content.length <= maxLength) {
    return content;
  }

  return content.substring(0, maxLength) + "...";
};
