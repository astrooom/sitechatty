"use client";

import { Conversation } from './conversation';
export const ChatSidepanel = ({ className }: { className?: string }) => {
  return (

    <div className={className}>
      <div className="h-full overflow-y-auto">
        {/* <div className="flex">
            <Input className="h-11" placeholder="Search Messages" />
            <div className="flex justify-center items-center pr-3 rounded-r-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div> */}

        <Conversation />

      </div>

    </div>

  )
}