export type ChatMessage = {
  sender: string;
  content: string;
  datetime: string;
  level: "warning" | "success" | "error";
};