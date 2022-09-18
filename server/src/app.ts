//import express from "express";
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
//let socketid2filepath: { [id: string]: string } = {};
//const { exec } = require("child_process");
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
    //cb(null, socketid2filepath[req.]);
  },
});

const upload = multer({ storage: storage });

// const serverProcess = (text1, text2, suc_cb, fail_cb) => {
//     let python_exe = 'python';
//     const python_src_path = './src/server/script/test.py';
//     exec(`${python_exe} ${python_src_path} ./public/uploads/${text1} ${text2}`, (error, stdout, stderr) => {
//         console.error(`exec error: ${error}`);
//         console.log(`stdout: ${stdout}`);
//         console.error(`stderr: ${stderr}`);
//         if (error) {
//             fail_cb();
//             return;
//         }
//         suc_cb();
//     });
// };

const startServer = () => {
  const PORT = 4000; //process.env.PORT || 3001;
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  //app.listen(PORT, () => {
  //    console.log(`Server listening on ${PORT}`);
  //});
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });
  app.get("/", (_: any, res: any) => res.send(`Server is up`));
  app.get("/api/*", (req: any, res: any) => {
    //return res.send(`Server is up`);

    if (req.url.length > 5) {
      const socket_id = req.url.substring(5);
      console.log(socket_id);
      const out_path = __dirname + "/../" + UPLOAD_DIR + socket_id + ".tmp";
      if (fs.existsSync(out_path)) {
        const out_name = socket_id + ".txt"; //path.basename(out_path, ".tmp");
        return res.download(out_path, out_name);
      }
    }
    res.status(500);
    return res.send("No processed file");
  });

  httpServer.listen(port, host, () => {
    console.log(`http://${host}:${port}`);

    socket({ io });
  });

  // app.post('/upload_text', (req, res) => {
  //     const response = JSON.stringify(req.body);
  //     console.log(response);
  //     const suc_cb = () => {
  //         console.log('end heavy process');
  //         res.send(response);
  //     }
  //     const fail_cb = () => {
  //         console.log('failed');
  //         res.status(500).send({
  //             message: 'Internal error!'
  //         });
  //     }
  //     serverProcess(req.body.text1, req.body.text2, suc_cb, fail_cb);
  // });

  app.post(
    "/api/upload_file",
    upload.single("file1"),
    function (req: any, res: any, next: any) {
      const socket_id = req.body["socket_id"];
      const newPath =
        UPLOAD_DIR + socket_id + path.extname(req.file.originalname);
      fs.rename(UPLOAD_DIR + req.file.filename, newPath, () => {});
      console.log("rename", req.file.filename, newPath);
      const response = JSON.stringify({
        filename: socket_id + path.extname(req.file.originalname),
        originalname: req.file.originalname,
      });
      console.log(response);
      res.send(response);
    }
  );
};

startServer();

export { UPLOAD_DIR };
