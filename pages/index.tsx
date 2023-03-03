import Head from "next/head";
import styles from "@/styles/Home.module.scss";
import { useCallback, useEffect, useRef, useState } from "react";
import { callChatGPT, callWhisper, ChatContext } from "@/logics/openai";
import { playText } from "@/logics/google";
import { AiFillSetting } from "react-icons/ai";
import Link from "next/link";
import { start } from "repl";

type Status =
  | "notInitialized"
  | "idle"
  | "recording"
  | "callWhisper"
  | "callChatGPT"
  | "speaking";
// Statusに対応する文字列を返す関数
const statusToString = (status: Status) => {
  switch (status) {
    case "notInitialized":
      return "最初に押してね";
    case "idle":
      return "話す";
    case "recording":
      return "録音中";
    case "callWhisper":
      return "Whisper呼び出し中";
    case "callChatGPT":
      return "ChatGPT呼び出し中";
    case "speaking":
      return "話しています";
  }
};

export default function Home() {
  const [status, setStatus] = useState("notInitialized" as Status);
  const [chatContext, setChatContext] = useState([] as ChatContext[]);
  const recorderRef = useRef<MediaRecorder>();

  const onClickButton = useCallback(async () => {
    if (status === "notInitialized") {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      //const recorder = new MediaRecorder(stream, { mimeType: "audio/mp4" });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      setStatus("idle");
      return;
    }
    if (status === "recording") {
      recorderRef.current!.stop();
      return;
    }

    if (status !== "idle") return;
    setStatus("recording");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.start();
    const audioChunks: Blob[] = [];
    recorder.addEventListener("dataavailable", (event) => {
      audioChunks.push(event.data);
    });
    recorder.addEventListener("stop", async () => {
      const openAiApiKey = localStorage.getItem("openAiApiKey");
      const googleApiKey = localStorage.getItem("googleApiKey");
      const googleVoice = localStorage.getItem("googleVoice");
      if (!openAiApiKey || !googleApiKey || !googleVoice) {
        alert("設定がされていません");
        setStatus("idle");
        return;
      }

      // audioChunksの中身が1秒以下の場合は無視する
      if (audioChunks[0].size < 5000) {
        setStatus("idle");
        return;
      }
      const audioBlob = new Blob(audioChunks);
      setStatus("callWhisper");
      const message = await callWhisper(openAiApiKey, audioBlob);
      if (!message) {
        setStatus("idle");
        return;
      }
      console.log(message);
      setStatus("callChatGPT");
      const assistantMessage = await callChatGPT(
        openAiApiKey,
        chatContext,
        message
      );
      setChatContext([
        ...chatContext,
        { role: "user", content: message },
        { role: "assistant", content: assistantMessage },
      ]);
      setStatus("speaking");
      await playText(googleApiKey, googleVoice, assistantMessage);
      setStatus("idle");
    });
  }, [chatContext, status]);
  // chatContextが変更されたら一番下までスクロールする
  useEffect(() => {
    const dialogLog = document.querySelector("." + styles.dialogLog);
    dialogLog!.scrollTop = dialogLog!.scrollHeight;
  }, [chatContext]);

  return (
    <>
      <Head>
        <title>AI Voice Chat</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>ChatGPT</h1>
        </header>
        <div className={styles.dialogLog}>
          <table>
            <tbody>
              {chatContext.map((context, index) => (
                <tr key={index}>
                  <td>{context.role}</td>
                  <td>{context.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.speakButtonContainer}>
          <button className={styles.speakButton} onClick={onClickButton}>
            {statusToString(status)}
          </button>
          <Link href="/setting">
            <button className={styles.settingButton}>
              <AiFillSetting size={48} />
            </button>
          </Link>
        </div>
      </main>
    </>
  );
}
