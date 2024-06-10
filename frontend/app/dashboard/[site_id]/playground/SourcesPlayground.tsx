"use client";

import { ChatMessages } from './ChatMessages';
import io, { Socket } from 'socket.io-client';
// import { ChatSidepanel } from './chatSidepanel';
import { useEffect, useState } from 'react';
import { getPlaygroundWsDetailsAction } from '@/lib/actions/tasks';

export type ChatMessage = {
  sender: string;
  content: string;
  datetime: string;
};
export const SourcesPlayground = ({ siteId }: { siteId: number }) => {

  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [query, setQuery] = useState('');

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
    },
  ];

  const [messages, setMessages] = useState(placeholderMessages);
  const [wsUrl, setWsUrl] = useState('');
  const [wsToken, setWsToken] = useState('');

  useEffect(() => {
    const fetchWsDetails = async () => {

      const response = await getPlaygroundWsDetailsAction({ site_id: siteId, type: "sources" });
      const data = response?.data;

      if (!data) {
        return;
      }

      const { ws_url, ws_token } = data;

      setWsUrl(ws_url);
      setWsToken(ws_token);
      localStorage.setItem('wsToken', data.ws_token);  // Save token to local storage
      localStorage.setItem('wsUrl', data.ws_url);      // Save URL to local storage
    };

    const storedWsToken = localStorage.getItem('wsToken');
    const storedWsUrl = localStorage.getItem('wsUrl');
    if (storedWsToken && storedWsUrl) {
      setWsUrl(storedWsUrl);
      setWsToken(storedWsToken);
    } else {
      fetchWsDetails();
    }
  }, []);

  useEffect(() => {
    if (wsUrl && wsToken) {
      const newSocket = io(wsUrl + '/search', {
        query: { token: wsToken }
      });

      setSocket(newSocket);

      newSocket.emit('join', { token: wsToken, site_id: siteId });

      newSocket.on('message', (data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
      });

      newSocket.on('status', (data) => {
        console.log(data.msg);
      });

      return () => newSocket.close();
    }
  }, [wsUrl, wsToken]);

  const handleSearch = () => {
    if (socket) {
      socket.emit('search', { site_id: siteId, query });
    }
  };

  return (
    <div className="flex flex-row gap-x-2">
      {/* <ChatSidepanel className="w-80 hidden md:block" /> */}
      <ChatMessages messages={messages} className="w-full h-full" />
    </div>
  )
}