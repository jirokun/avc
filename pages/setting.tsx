import Head from "next/head";
import { useRouter } from "next/router";
import styles from "@/styles/Setting.module.scss";
import { ChangeEvent, useCallback, useEffect, useState } from "react";

export default function Setting() {
  const router = useRouter();
  const [openAiApiKey, setOpenAiApiKey] = useState("");
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [googleVoice, setGoogleVoice] = useState("ja-JP-Neural2-B");

  useEffect(() => {
    setOpenAiApiKey(localStorage.getItem("openAiApiKey") || "");
    setGoogleApiKey(localStorage.getItem("googleApiKey") || "");
    setGoogleVoice(localStorage.getItem("googleVoice") || "ja-JP-Neural2-B");
  }, []);

  const onSave = useCallback(() => {
    localStorage.setItem("openAiApiKey", openAiApiKey);
    localStorage.setItem("googleApiKey", googleApiKey);
    localStorage.setItem("googleVoice", googleVoice);
    // indexに戻る
    router.push("/");
  }, [googleApiKey, googleVoice, openAiApiKey, router]);
  const onChangeOpenAiApiKey = useCallback((e: ChangeEvent) => {
    setOpenAiApiKey((e.target as HTMLInputElement).value);
  }, []);
  const onChangeGoogleApiKey = useCallback((e: ChangeEvent) => {
    setGoogleApiKey((e.target as HTMLInputElement).value);
  }, []);
  const onChangeGoogleVoice = useCallback((e: ChangeEvent) => {
    setGoogleVoice((e.target as HTMLSelectElement).value);
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>Setting</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <header className={styles.header}>
          <h1 className={styles.title}>Setting</h1>
        </header>
        <div className={styles.settingContainer}>
          <div className={styles.settingItem}>
            <label htmlFor="openAiApiKey">OpenAI API Key</label>
            <input
              type="text"
              id="openAiApiKey"
              value={openAiApiKey}
              onChange={onChangeOpenAiApiKey}
            />
          </div>
          <div className={styles.settingItem}>
            <label htmlFor="googleApiKey">Google API Key</label>
            <input
              type="text"
              id="googleApiKey"
              value={googleApiKey}
              onChange={onChangeGoogleApiKey}
            />
          </div>
          <div className={styles.settingItem}>
            <label htmlFor="googleVoice">音声</label>
            <select
              name="googleVoice"
              id="googleVoice"
              value={googleVoice}
              onChange={onChangeGoogleVoice}
            >
              <option value="ja-JP-Neural2-B">Female: ja-JP-Neural2-B</option>
              <option value="ja-JP-Neural2-C">Male: ja-JP-Neural2-C</option>
              <option value="ja-JP-Neural2-D">Male: ja-JP-Neural2-D</option>
              <option value="en-US-Neural2-A">Male: en-US-Neural2-A</option>
              <option value="en-US-Neural2-C">Female: en-US-Neural2-C</option>
            </select>
          </div>
          <div className={styles.settingButton}>
            <button className="cancel">Cancel</button>
            <button onClick={onSave} className="save">
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
