import React, { useRef, useState, useEffect } from "react";
//import logo from './logo.svg';
import { useSockets } from "./context/socket.context";
import axios from "axios";
import { AxiosResponse } from "axios";
import "./App.css";
const baseUrl = "";
const fileApiUrl = baseUrl + "/api/upload_file";

const rows = 25;

function App() {
  const { socket, messages, setMessages, logData, setLogData } = useSockets();
  const messageRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [text1, setText1] = useState("");
  //const [text2, setText2] = useState("");
  const [file1, setFile1] = useState(new File([], ""));
  //let ext = "";
  const [ext, setExt] = useState("");
  const file1Ref = useRef(file1);
  const extRef = useRef(ext);
  const text1Ref = useRef(text1);

  useEffect(() => {
    return () => {
      console.log("should be once");

      socket.on("preprocessFinished", () => {
        // Execute server program
        console.log("got preprocessFinished", file1Ref.current.name);
        setLogData(() => []);

        socket.emit("startProcess", {
          filename: file1Ref.current.name,
          options: text1Ref.current,
        });
      });

      socket.on("response", function (msg) {
        msg = msg["data"];
        console.log("response");
        console.log("logData", logData);
        console.log("msg", msg);
        setLogData((prevLogData: any) => {
          const cat = prevLogData.concat(msg);
          return cat;
        });
      });

      socket.on("exit", function (msg) {
        console.log(msg);
        const download_name = `${socket.id}.${extRef.current}`;
        const download_msg = `processed file is avairable at /api/${download_name}`;
        setLogData((prevLogData: any) => {
          const cat = prevLogData.concat(download_msg);
          return cat;
        });
        axios
          .get(`/api/${download_name}`, {
            responseType: "blob",
          })
          .then(({ headers, data }) => {
            console.log("succeeded to get result", headers);
            //fileDownload(res.data, download_name);

            const getFileNameFromHeader = (
              content: any,
              defaultName = "download.csv"
            ) => {
              const regex = content.match(
                /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
              );
              if (regex === null) return defaultName;
              return decodeURI(regex[1]) || defaultName;
            };

            const contentDisposition = headers["content-disposition"];
            const fileName = download_name; //getFileNameFromHeader(
            //contentDisposition,
            // download_name
            //);

            const downloadUrl = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", fileName); //any other extension
            document.body.appendChild(link);
            link.click();
            link.remove();

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

  const onText1InputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText1(e.target.value);
    text1Ref.current = e.target.value;
  };

  const onClickSubmit = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    if (!file1 || file1.name === "") {
      alert("Please attach file");
      return;
    }

    if (
      file1.name.split(".").length < 2 ||
      (file1.name.split(".").pop() != "txt" &&
        file1.name.split(".").pop() != "zip")
    ) {
      alert("Please attach .txt or .zip");
      return;
    }

    file1Ref.current = file1;
    setExt(file1.name.split(".").pop()!);
    extRef.current = file1.name.split(".").pop()!;

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

  contactForm = (
    <form id="upload_form" onSubmit={() => {}}>
      <p> Please upload .txt or .zip </p>
      <p>
        <input
          type="file"
          id="file1"
          onChange={onFileInputChange}
          disabled={submitted}
        />
      </p>
      <p>
        <input
          type="text"
          id="text1"
          onChange={onText1InputChange}
          disabled={submitted}
          placeholder="Options"
        ></input>
      </p>
      <p>
        <input type="submit" onClick={onClickSubmit} disabled={submitted} />
      </p>
    </form>
  );

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
  const [displayLogs, setDisplayLogs] = useState("server logs");
  const logData = props.logData;
  useEffect(() => {
    if (logData) {
      setDisplayLogs(logData.join("\n"));
    }
  }, [logData]);

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

export default App;
