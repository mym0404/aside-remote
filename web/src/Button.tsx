import type { ComponentProps } from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import * as stylex from '@stylexjs/stylex';
import { tokens } from './tokens.stylex';

export function Button({ variant = 'secondary', size = 'default', type = 'button', className, ...props }: Omit<ComponentProps<typeof BaseButton>, 'className'> & { className?: string; variant?: 'secondary' | 'primary' | 'danger'; size?: 'default' | 'compact' }) {
  const appearance = stylex.props(styles.button, variant === 'primary' && styles.primary, variant === 'danger' && styles.danger, size === 'compact' && styles.compact);
  return <BaseButton type={type} {...props} className={[appearance.className, className].filter(Boolean).join(' ')} />;
}

const styles = stylex.create({
  button: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, padding: '10px 16px', borderWidth: 1, borderStyle: 'solid', borderColor: tokens.border, borderRadius: 14, fontSize: '0.875rem', fontWeight: 550, lineHeight: 1.4, backgroundColor: { default: tokens.canvas, ':hover': tokens.surface }, color: tokens.text },
  primary: { backgroundColor: { default: tokens.primary, ':hover': tokens.primaryHover }, color: tokens.primaryForeground, borderColor: tokens.primary },
  danger: { backgroundColor: { default: tokens.danger, ':hover': 'color-mix(in srgb, var(--danger) 88%, var(--canvas))' }, color: tokens.canvas, borderColor: tokens.danger },
  compact: { minHeight: 36, padding: '6px 12px', fontSize: '0.8125rem' },
});
