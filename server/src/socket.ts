import { Server, Socket } from "socket.io";
const exec = require("child_process").exec;
import { UPLOAD_DIR } from "./app";
const spawn = require("child_process").spawn;

function socket({ io }: { io: Server }) {
  io.on("connection", (socket: Socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on("sendMessage", (message) => {
      console.log(`${socket.id} response ${message}`);
      socket.emit("responseMessage", message);
    });

    socket.on("preprocess", (data: any) => {
      console.log("preprocess");
      socket.emit("preprocessFinished", {});
    });

    socket.on("startProcess", () => {
      console.log("startProcess");
      const python_exe = "python";
      const python_src_path = __dirname + "/../script/test_txt.py";
      const filepath = __dirname + "/../" + UPLOAD_DIR + socket.id + ".txt";
      const outfilepath = filepath + ".tmp";
      const execCmd = spawn(python_exe, [
        python_src_path,
        filepath,
        outfilepath,
      ]);
      console.log(execCmd, execCmd.pid);

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
