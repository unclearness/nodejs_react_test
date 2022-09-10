import React, { useState } from 'react';
import axios from 'axios'

const baseUrl = "";
const textApiUrl = baseUrl + "/upload_text";
const fileApiUrl = baseUrl + "/upload_file";

function SendAndExec() {
    const [submitted, setSubmitted] = useState(false);
    const [text1, setText1] = useState("");
    const [text2, setText2] = useState("");
    const [file1, setFile1] = useState(null);

    //const [response, setResponse] = useState(null);

    const changeText1 = (e) => {
        setText1(e.target.value);
    }

    const changeText2 = (e) => {
        setText2(e.target.value);
    }

    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("onFileInputChange", e.target.files, e.target.files[0]);
        const f1: File = e.target.files[0];
        setFile1(f1);
    };

    const onClickSubmit = (e) => {
        e.preventDefault();
        console.log("POST");
        // POST

        const postTextCb = () => {

            const textData = { text1, text2 }
            axios.post(
                textApiUrl,
                textData)
                .then((response) => {
                    console.log(response);
                    //setResponse(response.data);
                    alert('Success!');
                }).catch(err => {
                    alert(err);
                });

        };

        if (file1) {
            const formFileData = new FormData();
            formFileData.append('file1', file1);
            console.log("formFileData", formFileData);
            axios.post(
                fileApiUrl,
                formFileData)
                .then((response) => {
                    console.log("response", response);
                    //setResponse(response.data);
                    postTextCb();
                }).catch(err => {
                    alert(err);
                });
        } else {
            postTextCb();
        }

    }

    let contactForm = null;
    if (submitted) {
        contactForm = (
            <div className='contact-submit-message'>
                Send data to server...
            </div>
        );
    } else {
        contactForm = (
            <form id="upload_form" onSubmit={() => { setSubmitted(true); }} >
                <p> Input text 1</p>
                <input type="text" id="text1" onChange={changeText1} value={text1}></input>
                <p> Input text 2</p>
                <input type="text" id="text2" onChange={changeText2} value={text2}></input>
                <p> Input file 1</p>
                <input type='file' id="file1" onChange={onFileInputChange} />
                <p> </p>
                <input
                    type='submit'
                    onClick={onClickSubmit}
                />
            </form>
        );
    }

    return (
        <div className='contact-form'>
            <header className="App-header">
                {contactForm}
            </header>
        </div>
    );

}

export default SendAndExec;