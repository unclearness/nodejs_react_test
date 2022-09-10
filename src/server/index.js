// server/index.js
const express = require("express");
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid');
const { exec } = require("child_process");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //console.log('destination');
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        //console.log('filename');
        cb(null, suuid_create() + path.extname(file.originalname));
    }
})
const upload = multer({ storage: storage })

// https://github.com/herbrandson/short-uuid/blob/master/index.js
function suuid_create() {
    function fromBuffer(buffer) {
        return buffer.toString('base64')
            .substring(0, 22) // remove the trailing "=="
            .replace(/\//g, '-'); // make our uuid url friendly by replacing "/" with "-"
    };
    const buffer = Buffer.alloc(16);
    uuid.v4(null, buffer, 0);
    return fromBuffer(buffer);
}

const serverProcess = (text1, text2, suc_cb, fail_cb) => {
    let python_exe = 'python';
    const python_src_path = './src/server/script/test.py';
    exec(`${python_exe} ${python_src_path} ./public/uploads/${text1} ${text2}`, (error, stdout, stderr) => {
        console.error(`exec error: ${error}`);
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        if (error) {
            fail_cb();
            return;
        }
        suc_cb();
    });
};

const startServer = () => {
    const PORT = 4000; //process.env.PORT || 3001;
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.listen(PORT, () => {
        console.log(`Server listening on ${PORT}`);
    });

    app.post('/upload_text', (req, res) => {
        const response = JSON.stringify(req.body);
        console.log(response);
        const suc_cb = () => {
            console.log('end heavy process');
            res.send(response);
        }
        const fail_cb = () => {
            console.log('failed');
            res.status(500).send({
                message: 'Internal error!'
            });
        }
        serverProcess(req.body.text1, req.body.text2, suc_cb, fail_cb);
    });

    app.post('/upload_file', upload.single('file1'), function (req, res, next) {
        const response = JSON.stringify({ filename: req.file.filename, originalname: req.file.originalname });
        console.log(response);
        res.send(response);
    });
};

startServer();