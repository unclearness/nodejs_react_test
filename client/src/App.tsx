import React, { useRef, useState } from 'react';
//import logo from './logo.svg';
import './App.css';
import {useSockets} from './context/socket.context';

function App() {
  const {socket, messages, setMessages} = useSockets();
  const messageRef = useRef(null);
  //console.log(messages);

  function handleClick() {
    const current: any = messageRef ? messageRef.current : null;
    let val = current ? current.value : null;
    if (!String(val).trim()) return;
    console.log(messageRef, current, String(val).trim())
    const date1 = new Date();
	  //console.log(date1); // Sat Feb 01 2020 20:49:28 GMT+0900 (日本標準時)
	  //console.log(date1.toLocaleString()); // 2020/2/1 20:49:28
    const to_send = {message: String(val).trim(), username: socket.id, time: date1.toLocaleString()}

    socket.emit("sendMessage", to_send);

    if (val) {
      val = "";
    }
    console.log('handleClick')
  }

  socket.on("responseMessage", (message) => {
    console.log(message);
    setMessages([...messages!, message]);
    //console.log(messages);
  });

  return (
    <>
      <input type="text" ref={messageRef} placeholder="write message" />
      <button onClick={handleClick}>Send</button>
      <Messages />
        
    </>
  );
}

function Messages() {
  const {socket, messages, setMessages} = useSockets();
  // return (<>
  //   {messages && (<div>
  //     {messages.map(({message}, index) => {
  //       return <li key={index}>{message}</li>
  //     })}
  //   </div>)}
  // </>
  // );
    return (<>
    {messages && (<div>
      {messages.map((message, index) => {
        return <li key={index}>{message.message} {message.username} {message.time}</li>
      })}
    </div>)}
  </>
  );
}

export default App;