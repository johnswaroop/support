import React, { useEffect, useState } from "react";
import { TitleHead } from "../components/TitleHead";
import axios from "axios";
import { create } from "zustand";
import Lottie from "react-lottie-player";
import loadingJson from "../loading.json";
import speechJson from "../speech.json";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import getSound from "./../textToSpeech";
import Markdown from "react-markdown";

//main branch floating

type message = {
  role: "user" | "assistant";
  content: string;
};

type Store = {
  messageHistory: message[];
  addMessage: (message: message) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  showRecord: boolean;
  setShowRecord: (record: boolean) => void;
};

const useStore = create<Store>()((set) => ({
  showRecord: false,
  setShowRecord: (record: boolean) => set({ showRecord: record }),
  messageHistory: [],
  addMessage: (message: message) => {
    return set((st) => {
      return {
        messageHistory: [...st.messageHistory, message],
      };
    });
  },
  prompt: "",
  setPrompt: (prompt: string) =>
    set({
      prompt: prompt,
    }),
}));

const postQuery = async (
  query: string,
  addMessage: (message: message) => void,
  messageHistory: message[]
) => {
  let message: message = {
    role: "user",
    content: query,
  };
  let msgHtr = messageHistory;
  addMessage(message);

  let res = await axios.post("/api/gpt", {
    messages: [...msgHtr, message],
  });
  let resMsg = res.data.result.message as message;
  addMessage(resMsg);
  setTimeout(() => {
    var objDiv = document.getElementById("scroll");
    objDiv!.scrollTop = objDiv!.scrollHeight;
  }, 0);
};

function playSound(url: string) {
  const audio = new Audio(url);
  audio.play();
}

const triggerSound = async (text: string) => {
  let blob = await getSound(text);
  blobToBase64(blob, (ele: any) => {
    console.log(ele);
    playSound(ele);
  });
};

function HomePage() {
  let { messageHistory } = useStore();

  return (
    <div
      style={{
        backgroundImage: "linear-gradient( 135deg, #6685ff 10%, #123597 100%)",
      }}
      className="flex flex-col w-full h-screen justify-center items-center "
    >
      {/* Content */}

      <div className="flex flex-col max-w-[900px] h-[90%] mx-auto w-full bg-white rounded-xl overflow-hidden shadow-2xl">
        <div
          id="scroll"
          className="py-10 lg:py-14 flex flex-col h-full overflow-scroll "
        >
          {<TitleHead />}
          {/* End Title */}
          <ul className="flex flex-col items-start outline mt-16 space-y-5">
            {/* Chat Bubble */}
            <Assistant
              greet="Welcome to our hotel's restaurant! How can I assist you today?"
              answer={` Here are some options:
btn[I want to check out room options]
btn[I want to make a reservation]
btn[I am just browsing]
Please choose an option by clicking the button, and I will assist you accordingly.`}
            />
            {messageHistory.map((msgs, idx) => {
              if (msgs.role == "user") {
                return <User key={"usr" + idx} answer={msgs.content} />;
              }
              if (msgs.role == "assistant") {
                return <Assistant key={"ast" + idx} answer={msgs.content} />;
              }
            })}
            {messageHistory.length > 0 &&
              messageHistory[messageHistory.length - 1].role == "user" && (
                <Loading />
              )}
          </ul>
        </div>
        {/* Search */}
        {<Search />}
        {/* End Search */}
      </div>

      {/* End Content */}
    </div>
  );
}
function blobToBase64(blob: any, callback: any) {
  const reader = new FileReader();
  reader.onloadend = () => {
    // The result attribute contains the data as a base64 encoded string
    callback(reader.result);
  };
  reader.readAsDataURL(blob);
}

const Search = () => {
  let {
    setShowRecord,
    showRecord,
    prompt,
    setPrompt,
    messageHistory,
    addMessage,
  } = useStore();

  let { startRecording, stopRecording, isRecording, recordingBlob } =
    useAudioRecorder();

  const transcribe = (blob: any) => {
    blobToBase64(blob, async (base64Url: any) => {
      let res = await axios.post("/api/transcribe", {
        file: base64Url,
      });
      let output = res.data.output.text;
      postQuery(output, addMessage, messageHistory);
      setShowRecord(false);
    });
  };

  useEffect(() => {
    if (!recordingBlob) return;
    transcribe(recordingBlob);
  }, [recordingBlob]);

  useEffect(() => {
    startRecording();
  }, []);

  if (showRecord) {
    return (
      <footer className="mt-auto z-10 bg-white border-t border-gray-200 pt-2 pb-3 sm:pt-4 sm:pb-6 dark:bg-slate-900 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3">
            <Lottie
              loop
              animationData={speechJson}
              play
              style={{ width: 100, height: 100 }}
            />
            <div className="flex flex-col w-fit ">
              <h1 className="text-black">Listening to your query...</h1>
              <p
                style={
                  isRecording
                    ? {
                        color: "red",
                      }
                    : {}
                }
                className="text-blue-800"
              >
                Please ask your query and click submit
              </p>
              <button
                onClick={() => {
                  stopRecording();
                }}
                className="text-red-500 border border-red-500 px-2 py-[1px] mt-1 cursor-pointer rounded-3xl hover:bg-red-100 "
              >
                Click here to Submit the Query
              </button>
            </div>
            <div className="absolute top-[-10000%]">
              <AudioRecorder
                onRecordingComplete={(blob) => {}}
                audioTrackConstraints={{
                  noiseSuppression: true,
                  echoCancellation: true,
                }}
                downloadFileExtension="webm"
              />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto z-10 bg-white border-t border-gray-200 pt-2 pb-3 sm:pt-4 sm:pb-6 dark:bg-slate-900 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Input */}
        <div className="relative border">
          <textarea
            className="text-black p-4 pb-12 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600"
            placeholder="Ask me anything..."
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
          />
          {/* Toolbar */}
          <div className="absolute bottom-px inset-x-px p-2 rounded-b-md bg-white dark:bg-slate-900">
            <div className="flex justify-between items-center">
              {/* Button Group */}
              <div className="flex items-center"></div>
              {/* End Button Group */}
              {/* Button Group */}
              <div className="flex hidden items-center gap-x-1">
                {/* Mic Button */}
                <button
                  onClick={() => {
                    setShowRecord(true);
                  }}
                  type="button"
                  className="inline-flex flex-shrink-0 justify-center items-center size-8 rounded-lg bg-violet-600 text-gray-500 hover:text-violet-600 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:text-blue-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                >
                  <svg
                    className="flex-shrink-0 size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffff"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1={12} x2={12} y1={19} y2={22} />
                  </svg>
                </button>
                {/* End Mic Button */}
                {/* Send Button */}
                <button
                  onClick={() => postQuery(prompt, addMessage, messageHistory)}
                  type="button"
                  className="inline-flex flex-shrink-0 justify-center items-center size-8 rounded-lg text-white bg-violet-600 hover:bg-blue-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                >
                  <svg
                    className="flex-shrink-0 size-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z" />
                  </svg>
                </button>
                {/* End Send Button */}
              </div>
              {/* End Button Group */}
            </div>
          </div>
          {/* End Toolbar */}
        </div>
        {/* End Input */}
      </div>
    </footer>
  );
};

function Loading() {
  useEffect(() => {
    document.getElementById("loading")?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);
  return (
    <li
      id="loading"
      className="relative max-w-4xl py-2 px-4 sm:px-6 lg:px-8 flex gap-x-2 sm:gap-x-4"
    >
      <svg
        className="flex-shrink-0 w-[2.375rem] h-[2.375rem] rounded-full"
        width={38}
        height={38}
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={38} height={38} rx={6} fill="#2563EB" />
        <path
          d="M10 28V18.64C10 13.8683 14.0294 10 19 10C23.9706 10 28 13.8683 28 18.64C28 23.4117 23.9706 27.28 19 27.28H18.25"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M13 28V18.7552C13 15.5104 15.6863 12.88 19 12.88C22.3137 12.88 25 15.5104 25 18.7552C25 22 22.3137 24.6304 19 24.6304H18.25"
          stroke="white"
          strokeWidth="1.5"
        />
        <ellipse cx={19} cy="18.6554" rx="3.75" ry="3.6" fill="white" />
      </svg>
      <div className="absolute left-[70px] top-[-50px]">
        <Lottie
          loop
          animationData={loadingJson}
          play
          style={{ width: 150, height: 150 }}
        />
      </div>
    </li>
  );
}

function Assistant({ greet, answer }: { greet?: string; answer?: string }) {
  let { prompt, setPrompt, messageHistory, addMessage } = useStore();
  const [parsedText, setParsedText] = useState<{
    buttons: string[];
    cleanedText: string;
  }>();

  useEffect(() => {
    setParsedText(parseButtons(answer || ""));
    document.getElementById("answer")?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  return (
    <li
      id="answer"
      className="animate-in slide-in-from-bottom-2 duration-700 fade-in max-w-4xl py-2 px-4 sm:px-6 lg:px-8 flex gap-x-2 sm:gap-x-4"
    >
      <svg
        className="flex-shrink-0 w-[2.375rem] h-[2.375rem] rounded-full"
        width={38}
        height={38}
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={38} height={38} rx={6} fill="#2563EB" />
        <path
          d="M10 28V18.64C10 13.8683 14.0294 10 19 10C23.9706 10 28 13.8683 28 18.64C28 23.4117 23.9706 27.28 19 27.28H18.25"
          stroke="white"
          strokeWidth="1.5"
        />
        <path
          d="M13 28V18.7552C13 15.5104 15.6863 12.88 19 12.88C22.3137 12.88 25 15.5104 25 18.7552C25 22 22.3137 24.6304 19 24.6304H18.25"
          stroke="white"
          strokeWidth="1.5"
        />
        <ellipse cx={19} cy="18.6554" rx="3.75" ry="3.6" fill="white" />
      </svg>
      <div className="space-y-3">
        {greet && greet.length > 0 && (
          <h2 className="font-medium text-gray-800 dark:text-white">{greet}</h2>
        )}
        {answer && (
          <h2 className=" text-gray-800 dark:text-white markdown">
            <Markdown>{parsedText?.cleanedText}</Markdown>
          </h2>
        )}
        <div>
          {parsedText?.buttons &&
            parsedText.buttons.map((ch, idx) => {
              return (
                <button
                  onClick={() => postQuery(ch, addMessage, messageHistory)}
                  key={idx + "chips"}
                  type="button"
                  className="mb-2.5 me-1.5 py-2 px-3 inline-flex justify-center items-center gap-x-2 rounded-lg border border-violet-600 bg-white text-violet-600 align-middle hover:bg-blue-50 text-sm dark:bg-slate-900 dark:text-blue-500 dark:border-blue-500 dark:hover:text-blue-400 dark:hover:border-blue-400 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                >
                  {ch}
                </button>
              );
            })}
        </div>
        {answer && false && (
          <button
            onClick={() => {
              answer && triggerSound(answer);
            }}
            className="text-black bg-violet-600 p-1 rounded-full cursor-pointer"
          >
            <svg
              className="h-4 w-4 brightness-0 invert-[100%] "
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
            >
              <path d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" />
            </svg>
          </button>
        )}
      </div>
    </li>
  );
}

const User = ({ answer }: { answer: string }) => {
  return (
    <li className="py-2 sm:py-4">
      <div className="max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="max-w-2xl flex gap-x-2 sm:gap-x-4">
          <span className="flex-shrink-0 inline-flex items-center justify-center size-[38px] rounded-full bg-gray-600">
            <span className="text-sm font-medium text-white leading-none">
              AZ
            </span>
          </span>
          <div className="grow mt-2 space-y-3">
            <p className="text-gray-800 dark:text-gray-200 text-sm">{answer}</p>
          </div>
        </div>
      </div>
    </li>
  );
};

function parseButtons(text: string) {
  // Regular expression to match btn[option]
  const buttonRegex = /btn\[([^\]]+)\]/g;

  // Array to store button options
  const buttons: string[] = [];

  // Replace function to capture button options and remove them from text
  const cleanedText = text.replace(buttonRegex, (match, p1) => {
    buttons.push(p1);
    return "";
  });

  // Trim the cleaned text to remove any leading/trailing whitespace
  const cleanedTextTrimmed = cleanedText.trim();

  return {
    buttons: buttons,
    cleanedText: cleanedTextTrimmed,
  };
}

export default HomePage;
