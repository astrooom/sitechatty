"use client";

import { Messages } from './messages';
import { ChatSidepanel } from './chatSidepanel';
export const Chat = () => {
  return (
    <div className="flex flex-row gap-x-2">
      {/* <ChatSidepanel className="w-80 hidden md:block" /> */}
      <Messages className="w-full h-full" />
    </div>
  )
}