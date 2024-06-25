import type { ChatMessage as ChatMessageProp } from '@/types/chat'
import capitalize from '@/lib/string'
import { cn } from '@/lib/utils'

export const ChatMessage = ({ message }: { message: ChatMessageProp }) => {

  return message.sender != "you" ? (
    <div className="flex items-end w-3/4">
      <img className="w-8 h-8 m-3 rounded-full" src="https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_960_720.png" alt="avatar" />
      <div className={cn("p-3 border mx-3 my-1 rounded-2xl rounded-bl-none sm:w-3/4 md:w-3/6 shadow-sm border-input",
        message.level === "error" ? "bg-rose-600/20 border-rose-700" : message.level === "warning" ? "bg-yellow-600/20 border-yellow-700" : ""
      )}>
        <div className="text-xs text-gray-400">
          {capitalize(message.sender)}
        </div>
        <div>
          {message.content}
        </div>

        {message.datetime && (
          <div className="text-xs text-gray-400">
            {new Date(message.datetime).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex justify-end">
      <div className="flex items-end w-auto light:bg-sky-100 dark:bg-zinc-900 m-1 rounded-md rounded-br-none sm:w-3/4 md:w-auto border shadow-sm border-input">
        <div className="p-2">
          <div>
            {message.content}
          </div>

          {message.datetime && (
            <div className="text-xs text-gray-400">
              {new Date(message.datetime).toLocaleString()}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
