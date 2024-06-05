"use client";

import { cn } from "@/lib/utils";


type ConversationItemProps = {
  active?: boolean,
  time: string,
  name: string,
  message: string
}

export const ConversationItem = ({ active, time, name, message }: ConversationItemProps) => {
  const _class = active ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white dark:bg-zinc-900';
  return (
    <div className={cn(
      _class,
      'conversation-item p-1 hover:bg-accent hover:text-accent-foreground rounded-md'
    )}>
      <div className={'flex items-center p-2 cursor-pointer'}>
        <div className="w-7 h-7 m-1">
          <img className="rounded-full" src="https://cdn.pixabay.com/photo/2017/01/31/21/23/avatar-2027366_960_720.png" alt="avatar" />
        </div>
        <div className="flex-grow p-2">
          <div className="flex justify-between text-md ">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{name}</div>
            <div className="text-xs text-gray-400 dark:text-gray-300">{time}</div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 w-40 truncate">
            {message}
          </div>
        </div>
      </div>
    </div>
  )
}
