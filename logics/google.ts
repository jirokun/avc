// ブラウザからGoogle Cloud Text-to-Speechを呼び出して音声を再生する
export const playText = async (apiKey: string, voice: string, text: string) => {
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          text,
        },
        voice: {
          languageCode: voice.substring(0, 5),
          name: voice,
        },
        audioConfig: {
          audioEncoding: "OGG_OPUS",
        },
      }),
    }
  );
  const data = await response.json();
  return new Promise<void>((resolve) => {
    const audio = new Audio(`data:audio/ogg;base64,${data.audioContent}`);
    audio.play();
    // 再生が終わったらresolveする
    audio.addEventListener("ended", () => {
      resolve();
    });
  });
};
