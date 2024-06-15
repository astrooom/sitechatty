import { PageProps } from '@/types';
import { getSiteId } from '@/lib/api';

import { AddSourceModal } from './AddSourceModal';

export default function Page({ params }: PageProps) {
  const siteId = getSiteId(params);

  return (
    <AddSourceModal siteId={siteId} isOpen={true} />
  );
};
