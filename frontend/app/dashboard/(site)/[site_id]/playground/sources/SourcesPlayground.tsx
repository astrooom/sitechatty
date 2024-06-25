"use client";

import type { ChatMessage } from '@/types/chat';
import io, { Socket } from 'socket.io-client';
// import { ChatSidepanel } from './chatSidepanel';
import { useEffect, useState } from 'react';
import { getPlaygroundWsDetailsAction } from '@/lib/actions/tasks';
import { ChatMessages } from './ChatMessages';

export const SourcesPlayground = ({ siteId }: { siteId: number }) => {

  return (
    <div className="flex flex-row gap-x-2">
      {/* <ChatSidepanel className="w-80 hidden md:block" /> */}
      <ChatMessages className="w-full h-full" />
    </div>
  )
}