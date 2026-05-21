/**
 * Logo BPS — proporción 3:2 (1536×1024).
 * Usar este componente en navbar, footer y demás ubicaciones para mantener el mismo aspecto.
 */

import Image from 'next/image';

const LOGO_WIDTH = 1536;
const LOGO_HEIGHT = 1024;

export type BpsLogoVariant = 'navbar' | 'footer';

const variantClassName: Record<BpsLogoVariant, string> = {
  /** Altura igual al header (h-20 = 80px); ancho automático según proporción del PNG. */
  navbar: 'h-20 w-auto',
  footer: 'h-24 w-auto',
};

type BpsLogoProps = {
  variant?: BpsLogoVariant;
  className?: string;
  priority?: boolean;
};

export default function BpsLogo({
  variant = 'navbar',
  className = '',
  priority,
}: BpsLogoProps) {
  const sizeClass = variantClassName[variant];
  const mergedClassName = className ? `${sizeClass} ${className}` : sizeClass;

  return (
    <Image
      src="/images/bps-logo.png"
      alt="BPS Logo"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      className={mergedClassName}
      priority={priority ?? variant === 'navbar'}
      sizes={variant === 'navbar' ? '(max-width: 768px) 120px, 160px' : '160px'}
    />
  );
}
