import { Input } from '@/components/ui/input'
import { SendHorizontal } from 'lucide-react'
import type { ChatMessage as ChatMessageProp } from './SourcesPlayground'
import { cn } from '@/lib'

export const ChatMessage = ({ message }: { message: ChatMessageProp }) => {

  return message.sender === "bot" ? (
    <div className="flex items-end w-3/4">
      <img className="w-8 h-8 m-3 rounded-full" src="https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_960_720.png" alt="avatar" />
      <div className="p-3 border mx-3 my-1 rounded-2xl rounded-bl-none sm:w-3/4 md:w-3/6 shadow-sm border-input">
        {/* <div className="text-xs text-gray-100 hidden dark:text-gray-200">
          {message.sender}
        </div> */}
        <div>
          {message.content}
        </div>
        <div className="text-xs text-gray-400">
          {message.datetime}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-end">
      <div className="flex items-end w-auto bg-sky-100 m-1 rounded-md rounded-br-none sm:w-3/4 md:w-auto border shadow-sm border-input">
        <div className="p-2">
          <div>
            {message.content}
          </div>

          <div className="text-xs text-gray-400">
            {message.datetime}
          </div>
        </div>
      </div>
    </div>
  )
}
