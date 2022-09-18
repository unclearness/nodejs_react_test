import { Server, Socket } from "socket.io";
const exec = require("child_process").exec;
import { UPLOAD_DIR } from "./app";
//const uuid = require('uuid');
//const path = require('path');
const spawn = require("child_process").spawn;

function socket({ io }: { io: Server }) {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on("sendMessage", (message) => {
      console.log(`${socket.id} response ${message}`);
      socket.emit("responseMessage", message);
    });

    socket.on("preprocess", (data: any) => {
      //const tmp_path = suuid_create() + path.extname(filename);
      //socketid2filepath[socket.id] =
      //  __dirname + "/../" + UPLOAD_DIR + data["data"];
      console.log("preprocess");
      //console.log(socketid2filepath);
      socket.emit("preprocessFinished", {});
    });

    socket.on("startProcess", () => {
      console.log("startProcess");
      const python_exe = "python";
      const python_src_path = __dirname + "/../script/test.py";
      const filepath = __dirname + "/../" + UPLOAD_DIR + socket.id + ".txt";
      const outfilepath = filepath + ".tmp";
      const command = `${python_exe} ${python_src_path} ${filepath} ${outfilepath}`;

      const execCmd = spawn(python_exe, [
        python_src_path,
        filepath,
        outfilepath,
      ]); //exec(command);
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
        // 処理が終了したことをクライアントに送信
        socket.emit("exit", { data: code.toString() });
      });
    });
  });
}

export default socket;
