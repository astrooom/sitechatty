
import { UsedSourcesContentModal } from './UsedSourcesContentModal';
import { PageProps } from '@/types';
import { getSiteId } from '@/lib/api';
import { getUsedSiteSourceContents } from '@/lib';
import { ModifyTextInput } from './ModifyTextInput';
import { ModifyTextInputModal } from './ModifyTextInputModal';

export default async function Page({ params }: PageProps) {
  const siteId = getSiteId(params);
  const source = params?.source?.toString()
  if (!source) {
    throw new Error('Missing used source');
  }

  const { contents, source_type } = await getUsedSiteSourceContents({
    site_id: siteId,
    source
  })

  return (
    source_type === "input" ? (
      <ModifyTextInputModal siteId={siteId} currentTitle={source} currentContents={contents} />
    ) :
      <UsedSourcesContentModal
        siteId={siteId}
        source={source}
        isOpen={true}
        contents={contents}
      />
  );
};
