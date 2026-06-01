/**
 * Ambient declarations for the globals exposed by the verbatim portfolio runtime
 * (public/portfolio.runtime.js) and the Lucide CDN. These let TSX call into the
 * runtime (e.g. the modal backdrop handler) without `any` casts at every site.
 */
export {};

declare global {
  interface Window {
    lucide?: {
      createIcons: (opts?: {
        attrs?: Record<string, unknown>;
        nameAttr?: string;
      }) => void;
    };
    // Modal / lightbox API
    handleModalBackdropClick?: (event: Event) => void;
    openModal?: (type: 'video' | 'image' | 'web', index: number, set?: string) => void;
    closeModal?: () => void;
    modalNav?: (dir: number) => void;
    // Showcase section toggles
    toggleProjectShowcase?: (projectType: string) => void;
    hideProjectShowcase?: () => void;
    toggleMute?: (btn: HTMLElement) => void;
  }
}
