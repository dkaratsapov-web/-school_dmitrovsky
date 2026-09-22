import type { Metadata } from 'next';
import { PreviewStage } from '@/components/admin/PreviewStage';

/** Служебное окно: открывается только внутри админки. */
export const metadata: Metadata = {
  title: 'Превью материала',
  robots: { index: false, follow: false },
};

export default function AdminPreviewPage() {
  return <PreviewStage />;
}
