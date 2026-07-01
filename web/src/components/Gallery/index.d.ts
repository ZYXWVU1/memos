// Type declarations for the Gallery module

import type { Memo } from "@/types/proto/api/v1/memo_service_pb";

declare module "@/components/Gallery" {
  import type { Vector3Tuple } from "three";

  export interface LayoutItem {
    memo: Memo;
    position: Vector3Tuple;
    rotation: [number, number, number];
    scale: number;
  }

  export function calculateGalleryLayout(memos: Memo[]): LayoutItem[];
  export function calculateCylinderLayout(memos: Memo[]): LayoutItem[];
  export function calculateCloudLayout(memos: Memo[]): LayoutItem[];

  export function GalleryEntryButton(): JSX.Element;
  export function GalleryNavLink(): JSX.Element;
  export function GalleryFloatingButton(): JSX.Element;

  export function GalleryScene(props: { memos: Memo[] }): JSX.Element;
  export function MemoFrame(props: {
    memo: Memo;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
  }): JSX.Element;
}
