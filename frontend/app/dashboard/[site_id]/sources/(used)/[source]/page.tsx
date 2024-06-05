
import { UsedSourcesContentModal } from './UsedSourcesContentModal';
import { PageProps } from '@/types';
import { getSiteId } from '@/lib/api';
import { getUsedSiteSourceContents } from '@/lib';

export default async function Page({ params }: PageProps) {
  const siteId = getSiteId(params);
  const source = params?.source?.toString()
  if (!source) {
    throw new Error('Missing used source');
  }

  const { contents } = await getUsedSiteSourceContents({
    site_id: siteId,
    source
  })

  return (
    <>
      <UsedSourcesContentModal
        siteId={siteId}
        source={source}
        isOpen={true}
        contents={contents}
      />
    </>
  );
};
