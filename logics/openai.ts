export type ChatContext = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callWhisper(
  apiKey: string,
  audioBlob: Blob
): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.mp4");
  formData.append("model", "whisper-1");

  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
    },
    body: formData,
  };

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    requestOptions
  );
  const data = await response.json();
  return data.text;
}

export async function callChatGPT(
  apiKey: string,
  chatContext: ChatContext[],
  newMessage: string
): Promise<string> {
  const messages = [
    { role: "system", content: "短文で会話してください" },
    ...chatContext,
    { role: "user", content: newMessage },
  ];
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
    }),
  };

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    requestOptions
  );
  const data = await response.json();
  console.log(data);
  return data.choices[0].message.content;
}
