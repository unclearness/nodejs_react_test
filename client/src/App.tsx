import React, { useRef, useState, useEffect } from "react";
//import logo from './logo.svg';
import { useSockets } from "./context/socket.context";
import axios from "axios";
import { AxiosResponse } from "axios";
import "./App.css";
import fileDownload from "js-file-download";
const baseUrl = "";
const fileApiUrl = baseUrl + "/api/upload_file";

const rows = 25;

function App() {
  const { socket, messages, setMessages, logData, setLogData } = useSockets();
  const messageRef = useRef(null);
  //const submitted = false;
  const [submitted, setSubmitted] = useState(false);
  //const [text1, setText1] = useState("");
  //const [text2, setText2] = useState("");
  const [file1, setFile1] = useState(new File([], ""));
  //const [displayLogs, setDisplayLogs] = useState("server logs");

  useEffect(() => {
    return () => {
      console.log("should be once");

      socket.on("preprocessFinished", () => {
        // Execute server program
        console.log("got preprocessFinished");
        setLogData(() => []);
        socket.emit("startProcess");
      });

      socket.on("response", function (msg) {
        msg = msg["data"];
        console.log("response");
        console.log("logData", logData);
        console.log("msg", msg);
        //let updated = msg;
        //if (logData) {
        //const updated = logData.concat(msg);
        //}
        //setLogData(updated);
        setLogData((prevLogData: any) => {
          const cat = prevLogData.concat(msg);
          return cat;
        });
        //setDisplayLogs(logData.join("\n"));
      });

      socket.on("exit", function (msg) {
        console.log(msg);
        const download_name = `${socket.id}.txt`;
        const download_msg = `processed file is avairable at /api/${download_name}`;
        setLogData((prevLogData: any) => {
          const cat = prevLogData.concat(download_msg);
          return cat;
        });
        axios
          .get(`/api/${socket.id}.txt`)
          .then((res) => {
            console.log("succeeded to get result", res);
            fileDownload(res.data, download_name);
            socket.disconnect();
          })
          .catch(() => {
            console.log("failed to get result");
            socket.disconnect();
          });
      });
    };
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) {
      return;
    }
    const f1: File = files![0];
    console.log("onFileInputChange", e.target.files, f1);
    setFile1(f1);
  };

  const onClickSubmit = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    if (!file1 || file1.name === "") {
      alert("Please attach file");
      return;
    }

    if (
      file1.name.split(".").length < 2 ||
      file1.name.split(".").pop() != "txt"
    ) {
      alert("Please attach .txt");
      return;
    }

    if (submitted) {
      alert("Already submitted. Reload to process other files");
      return;
    }
    setSubmitted(true);

    console.log("POST");
    // POST

    const formFileData = new FormData();
    formFileData.append("socket_id", socket.id);
    formFileData.append("file1", file1);
    console.log("formFileData", formFileData);
    axios
      .post(fileApiUrl, formFileData)
      .then((response: AxiosResponse<any, any>) => {
        console.log("response", response.data);
        // Send filename by socket
        socket.emit("preprocess", { data: response.data["filename"] });
      })
      .catch((err: Error) => {
        alert(err);
      });
  };

  let contactForm = null;
  //if (submitted) {
  //  contactForm = (
  //     <div className="contact-submit-message">Send data to server...</div>
  //   );
  // } else {
  contactForm = (
    <form
      id="upload_form"
      onSubmit={() => {
        //setSubmitted(true);
      }}
    >
      <p> Please upload .txt </p>
      <input
        type="file"
        id="file1"
        onChange={onFileInputChange}
        disabled={submitted}
      />
      <input type="submit" onClick={onClickSubmit} disabled={submitted} />
    </form>
  );
  // }

  // function handleClick() {
  //   const current: any = messageRef ? messageRef.current : null;
  //   let val = current ? current.value : null;
  //   if (!String(val).trim()) return;
  //   console.log(messageRef, current, String(val).trim());
  //   const date1 = new Date();
  //   //console.log(date1); // Sat Feb 01 2020 20:49:28 GMT+0900 (日本標準時)
  //   //console.log(date1.toLocaleString()); // 2020/2/1 20:49:28
  //   const to_send = {
  //     message: String(val).trim(),
  //     username: socket.id,
  //     time: date1.toLocaleString(),
  //   };

  //   socket.emit("sendMessage", to_send);

  //   if (val) {
  //     val = "";
  //   }
  //   console.log("handleClick");
  // }

  // socket.on("responseMessage", (message) => {
  //   console.log(message);
  //   setMessages([...messages!, message]);
  //   //console.log(messages);
  // });

  // return (
  //   <>
  //     <input type="text" ref={messageRef} placeholder="write message" />
  //     <button onClick={onClickSubmit}>Send</button>
  //     <Messages />
  //   </>
  // );

  return (
    <div className="contact-form">
      <header className="App-header">
        <div>{contactForm}</div>
        <br></br>
        <div>
          <Logs logData={logData} />
        </div>
      </header>
    </div>
  );
}

function Logs(props: any) {
  //const { socket, messages, setMessages, logData, setLogData } = useSockets();
  const [displayLogs, setDisplayLogs] = useState("server logs");
  const logData = props.logData;
  //let displayLogs = "server logs";
  useEffect(() => {
    if (logData) {
      //displayLogs = logData.join("\n");
      setDisplayLogs(logData.join("\n"));
    }
  }, [logData]);
  function onChange(e: any) {
    e.scrollTop = e.scrollHeight;
  }

  const textArea: any = useRef(null);

  // After render, this scrolls the textArea to the bottom.
  useEffect(() => {
    if (textArea) {
      const area = textArea.current;
      if (area) {
        area.scrollTop = area.scrollHeight;
      }
    }
  });

  console.log("display", displayLogs);
  return (
    <div className="logs">
      <textarea
        id="terminal"
        rows={rows}
        cols={80}
        spellCheck={false}
        value={displayLogs}
        ref={textArea}
        readOnly={true}
      ></textarea>
    </div>
  );
}

function Messages() {
  const { socket, messages, setMessages } = useSockets();
  return (
    <>
      {messages && (
        <div>
          {messages.map((message, index) => {
            return (
              <li key={index}>
                {message.message} {message.username} {message.time}
              </li>
            );
          })}
        </div>
      )}
    </>
  );
}

export default App;
