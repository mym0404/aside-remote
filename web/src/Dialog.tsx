import type { ComponentProps, ReactNode } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import * as stylex from '@stylexjs/stylex';
import { X } from 'lucide-react';
import { usePresence } from 'motion/react';
import { IconButton, ICON_STROKE, resolveDialogReturnFocus } from './ui';
import { tokens } from './tokens.stylex';

export function Dialog({ title, children, onClose, initialFocus }: { title: string; children: ReactNode; onClose: () => void; initialFocus?: BaseDialog.Popup.Props['initialFocus'] }) {
  const [isPresent, safeToRemove] = usePresence();
  const [portalContainer, setPortalContainer] = useState<HTMLElement>();
  const [returnFocus] = useState(() => document.activeElement instanceof HTMLElement ? document.activeElement : null);
  const viewportRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    setPortalContainer([...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].filter(dialog => getComputedStyle(dialog).pointerEvents !== 'none').at(-1) ?? document.body);
  }, []);
  useLayoutEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const resize = () => {
      viewportRef.current?.style.setProperty('--dialog-height', viewport.height + 'px');
      viewportRef.current?.style.setProperty('--dialog-top', viewport.offsetTop + 'px');
    };
    resize();
    viewport.addEventListener('resize', resize);
    viewport.addEventListener('scroll', resize);
    return () => { viewport.removeEventListener('resize', resize); viewport.removeEventListener('scroll', resize); };
  }, [portalContainer]);

  if (!portalContainer) return undefined;
  return <BaseDialog.Root open={isPresent} onOpenChange={isOpen => { if (!isOpen && isPresent) onClose(); }} onOpenChangeComplete={isOpen => { if (!isOpen) safeToRemove?.(); }}>
    <BaseDialog.Portal container={portalContainer}>
      <BaseDialog.Backdrop data-app-dialog-backdrop="" {...stylex.props(styles.backdrop)} />
      <BaseDialog.Viewport ref={viewportRef} {...stylex.props(styles.viewport)}>
        <BaseDialog.Popup data-app-dialog="" {...stylex.props(styles.popup)} initialFocus={initialFocus} onKeyDown={event => { if (event.key === 'Tab') event.stopPropagation(); }} finalFocus={() => {
          if (portalContainer instanceof HTMLDialogElement && portalContainer.open) return returnFocus?.isConnected && portalContainer.contains(returnFocus) ? returnFocus : portalContainer.querySelector<HTMLElement>('button:not([data-overlay-backdrop]):not(:disabled)');
          return resolveDialogReturnFocus(returnFocus, title);
        }}>
          <div {...stylex.props(styles.header)}><BaseDialog.Title {...stylex.props(styles.title)}>{title}</BaseDialog.Title><BaseDialog.Close render={<IconButton label="Close"><X size={22} strokeWidth={ICON_STROKE} aria-hidden="true" /></IconButton>} /></div>
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  </BaseDialog.Root>;
}

export function DialogDescription({ className, ...props }: Omit<ComponentProps<typeof BaseDialog.Description>, 'className'> & { className?: string }) {
  return <BaseDialog.Description {...props} className={[stylex.props(styles.description).className, className].filter(Boolean).join(' ')} />;
}

export function DialogActions({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.actions)}>{children}</div>;
}

const styles = stylex.create({
  backdrop: { position: 'fixed', inset: 0, zIndex: 20, backgroundColor: 'rgb(0 0 0 / .5)' },
  viewport: { position: 'fixed', top: 'var(--dialog-top, 0px)', left: 0, width: '100%', height: 'var(--dialog-height, 100dvh)', zIndex: 21, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))', overflow: 'hidden', pointerEvents: 'none' },
  popup: { width: '100%', maxWidth: 420, maxHeight: '100%', padding: 22, borderRadius: 24, backgroundColor: tokens.surface, color: tokens.text, borderWidth: 1, borderStyle: 'solid', borderColor: tokens.border, boxShadow: '0 20px 80px rgb(0 0 0 / .3)', overflowY: 'auto', overscrollBehavior: 'contain', pointerEvents: 'auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  title: { fontSize: '1.125rem', fontWeight: 650, lineHeight: 1.3, margin: 0, minWidth: 0 },
  description: { fontSize: '0.875rem', lineHeight: 1.6, color: tokens.muted, margin: '0 0 16px', overflowWrap: 'anywhere' },
  actions: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 20 },
});
