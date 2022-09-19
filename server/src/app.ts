import { createServer } from "http";
import { Server } from "socket.io";
import config from "config";
import socket from "./socket";

const port = config.get<number>("port");
const host = config.get<string>("host");
const corsOrigin = config.get<string>("corsOrigin");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const UPLOAD_DIR = "./public/uploads/";
const uuid = require("uuid");

// https://github.com/herbrandson/short-uuid/blob/master/index.js
function suuid_create() {
  function fromBuffer(buffer: Buffer) {
    return buffer
      .toString("base64")
      .substring(0, 22) // remove the trailing "=="
      .replace(/\//g, "-"); // make our uuid url friendly by replacing "/" with "-"
  }
  const buffer = Buffer.alloc(16);
  uuid.v4(null, buffer, 0);
  return fromBuffer(buffer);
}

const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: Function) {
    //console.log('destination');
    cb(null, UPLOAD_DIR);
  },
  filename: function (req: any, file: any, cb: Function) {
    //console.log('filename');
    cb(null, suuid_create() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const startServer = () => {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });
  app.get("/", (_: any, res: any) => res.send(`Server is up`));
  app.get("/api/*", (req: any, res: any) => {
    //if (req.url.length > 5) {
    //const socket_id = req.url.substring(5);
    //console.log(socket_id);
    const out_path = path.normalize(
      __dirname + "/../" + UPLOAD_DIR + req.url.substring(5)
    ); //socket_id + ".tmp";
    console.log(out_path, req.url);
    if (fs.existsSync(out_path)) {
      //const out_name = socket_id + ".txt"; //path.basename(out_path, ".tmp");
      return res.download(out_path, req.url);
    }
    //}
    res.status(500);
    return res.send("No processed file");
  });

  httpServer.listen(port, host, () => {
    console.log(`http://${host}:${port}`);

    socket({ io });
  });

  app.post(
    "/api/upload_file",
    upload.single("file1"),
    function (req: any, res: any, next: any) {
      const socket_id = req.body["socket_id"];
      const newPath =
        UPLOAD_DIR + socket_id + "_tmp" + path.extname(req.file.originalname);
      fs.rename(UPLOAD_DIR + req.file.filename, newPath, () => {});
      console.log("rename", req.file.filename, newPath);
      const response = JSON.stringify({
        filename: socket_id + path.extname(req.file.originalname),
        originalname: req.file.originalname,
      });
      //console.log(response);
      res.send(response);
    }
  );
};

startServer();

export { UPLOAD_DIR };
