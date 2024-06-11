"use client";

import { createContext } from "@/hooks/createContext";

import type { SetStateAction } from "react";
import { ChatMessage } from "@/types/chat";
import type { Socket } from "socket.io-client";

type Context = {

  socket: Socket | undefined;
  setSocket: (value: SetStateAction<Socket | undefined>) => void;

  handleSearch: (query: { query: string }) => void;

  wsDetails: {
    ws_url: string;
    ws_token: string;
  };
  setWsDetails: (value: SetStateAction<{
    ws_url: string;
    ws_token: string;
  }>) => void;

  messages: ChatMessage[];
  setMessages: (value: SetStateAction<ChatMessage[]>) => void;
};

export const [PlaygroundSourcesContextProvider, usePlaygroundSourcesContext, PlaygroundSourcesContext] = createContext<Context>({
  name: "PlaygroundSourcesContext",
  strict: false,
  hookName: "usePlaygroundSourcesContext",
  providerName: "PlaygroundSourcesContextProvider",
  defaultValue: {

    wsDetails: {
      ws_url: "",
      ws_token: "",
    },

    setWsDetails: () => { },

    socket: undefined,
    setSocket: () => { },

    handleSearch: () => { },

    messages: [],
    setMessages: () => { },
  },
});
