"use client";

import { useEffect, useRef, useState } from "react";
import { PlaygroundSourcesContextProvider as ContextProvider } from "./usePlaygroundSourcesContext";
import { ChatMessage } from "@/types/chat";
import { io, type Socket } from "socket.io-client";
import { getPlaygroundWsDetailsAction } from "@/lib/actions/tasks";
import { useInterval } from "react-interval-hook";

export const PlaygroundSourcesContextProvider = ({ children, siteId }: { children: React.ReactNode, siteId: number }) => {

  const placeholderMessages: ChatMessage[] = [
    {
      sender: "bot",
      content: "gsegjsghjbdg bfb sbjbfsj fsksnf jsnfj snf nnfnsnfsnj",
      datetime: "1 day ago",
    },
    {
      sender: "you",
      content: "Hello ? How Can i help you ?",
      datetime: "",
    },
    {
      sender: "bot",
      content: "Hello po ang pogi niyo :)",
      datetime: "just now",
      level: "warning",
    },
    {
      sender: "you",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
      datetime: "",
    },
    {
      sender: "bot",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam",
      datetime: "just now",
      level: "error",
    },
  ];

  const [wsDetails, setWsDetails] = useState({ ws_url: "", ws_token: "" });

  // const [socket, setSocket] = useState<Socket | undefined>(undefined);

  const socketRef = useRef<Socket | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(placeholderMessages);

  const fetchWsDetails = async () => {
    const response = await getPlaygroundWsDetailsAction({ site_id: siteId, type: "sources" });
    const data = response?.data;
    if (!data) {
      return;
    }
    const { ws_url, ws_token } = data;
    setWsDetails({ ws_url, ws_token });
  };

  /*
  * Establish Socket Connection on Page Load
  */
  useEffect(() => {
    if ((!wsDetails.ws_token || !wsDetails.ws_url) && !socketRef.current) {
      fetchWsDetails();
    }
  }, []);

  useEffect(() => {
    if (wsDetails.ws_token && wsDetails.ws_url) {

      const socketInstance = io(wsDetails.ws_url, {
        query: { token: wsDetails.ws_token }
      });

      socketRef.current = socketInstance;

      socketInstance.emit('join', { token: wsDetails.ws_token, site_id: siteId });

      socketInstance.on('status', (data) => {
        console.log(data.msg);

        // enable the interval
        start();
      });

      socketInstance.on('message', (data: ChatMessage) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });

      socketInstance.on("error", (data) => {
        console.error(data);
      });

      socketInstance.on("expiring", (data) => {
        console.warn("Token is about to expire. Refreshing...", data);
        fetchWsDetails();
      });

      return () => {
        socketInstance.off('status');
        socketInstance.off('message');
        socketInstance.off('error');
        socketInstance.off('expiring');
        socketInstance.close();
        stop();
        socketRef.current = null;
      };

    }
  }, [wsDetails]);

  // On interval, send ping to server to check time left before token expires.
  // An "expiring" event is sent back if the token is about to expire.
  const { start, stop } = useInterval(
    () => {
      // Get current time before expiration
      socketRef.current?.emit('ping');
    },
    30 * 1000, // Send ping event every 30 seconds
    {
      autoStart: false,
      immediate: false,
    }
  );

  const handleSearch = ({ query }: { query: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('search', { query });
      setMessages((prevMessages) => [...prevMessages, {
        sender: "you",
        content: query,
        datetime: (new Date()).toISOString(),
        level: "success"
      }]);
    }
  };

  return (
    <ContextProvider
      value={{

        socketRef,

        wsDetails,
        setWsDetails,

        handleSearch,

        messages,
        setMessages
      }}
    >
      {children}
    </ContextProvider>
  );
};
