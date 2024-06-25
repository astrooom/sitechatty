import { Input } from '@/components/ui/input'
import { SendHorizontal } from 'lucide-react'
import { usePlaygroundSourcesContext } from './usePlaygroundSourcesContext'
import { useState } from 'react';

export const PlaygroundSourcesQueryInput = () => {

  const [query, setQuery] = useState<string>("");

  const { handleSearch } = usePlaygroundSourcesContext();

  const _handleSearchAndEmptyQuery = () => {
    handleSearch({ query });
    setQuery("");
  }

  return (
    <div className="search-chat flex flex-grow">
      <Input className="p-6" type="text" placeholder="Type your message ..." onChange={(e) => setQuery(e.target.value)} />
      <div className="mx-2 flex items-center">
        <SendHorizontal className="w-5 h-5 cursor-pointer" onClick={
          () => _handleSearchAndEmptyQuery()
        } />
      </div>
    </div>
  )
}
