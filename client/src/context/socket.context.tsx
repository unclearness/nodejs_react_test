import { useContext, createContext, useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { SOCKET_URL } from "./config/default";
//import EVENTS from "./config/events";

interface Context {
  socket: Socket;
  //setUsername: Function
  messages?: { message: string; username: string; time: string }[];
  setMessages: Function;
  logData: string[];
  setLogData: Function;
}

//SOCKET_URLの中身のところに接続を要求
const socket = io(SOCKET_URL);

const SocketContext = createContext<Context>({
  socket,
  //setUsername: () => false ,
  logData: [],
  setMessages: () => false,
  setLogData: () => false,
});

function SocketsProvier(props: any) {
  const [messages, setMessages] = useState([]);
  const [logData, setLogData] = useState("");

  return (
    <SocketContext.Provider
      value={{ socket, messages, setMessages, logData, setLogData }}
      {...props}
    />
  );
}

export const useSockets = () => useContext(SocketContext);

export default SocketsProvier;
