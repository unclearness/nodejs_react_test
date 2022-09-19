import { Server, Socket } from "socket.io";
const exec = require("child_process").exec;
import { UPLOAD_DIR } from "./app";
const spawn = require("child_process").spawn;
import path from "path";
//let socketid2ext = { string: string };

function socket({ io }: { io: Server }) {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on("sendMessage", (message) => {
      console.log(`${socket.id} response ${message}`);
      socket.emit("responseMessage", message);
    });

    socket.on("preprocess", (data: any) => {
      console.log("preprocess");
      //const filename = data["data"];
      socket.emit("preprocessFinished", {});
    });

    socket.on("startProcess", (msg) => {
      console.log("startProcess", msg);
      const ext = path.extname(msg["data"]);
      const python_exe = "python";
      const python_txt_src_path = __dirname + "/../script/test_txt.py";
      const python_zip_src_path = __dirname + "/../script/test_zip.py";

      const outfilepath = __dirname + "/../" + UPLOAD_DIR + socket.id + ext;
      const intpufilepath =
        __dirname + "/../" + UPLOAD_DIR + socket.id + "_tmp" + ext;
      let python_src_path = "";
      if (ext == ".txt") {
        python_src_path = python_txt_src_path;
      } else if (ext == ".zip") {
        python_src_path = python_zip_src_path;
      } else {
        const message = `ext ${ext} is wrong! Stop further proccess...`;
        socket.emit("exit", { data: message });
        return;
      }
      const execCmd = spawn(python_exe, [
        python_src_path,
        intpufilepath,
        outfilepath,
      ]);
      console.log(execCmd.pid);

      execCmd.stdout.on("data", function (buf: Buffer) {
        const data = buf.toString();
        console.log(data);
        const splitted = data.split(/\r\n|\n/);
        socket.emit("response", { data: splitted });
      });

      execCmd.stderr.on("data", function (buf: Buffer) {
        const data = buf.toString();
        console.log(data);
        const splitted = data.split(/\r\n|\n/);
        socket.emit("response", { data: splitted });
      });

      execCmd.on("exit", function (code: Buffer) {
        socket.emit("exit", { data: code.toString() });
      });
    });
  });
}

export default socket;
