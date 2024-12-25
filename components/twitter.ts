import html2canvas from "html2canvas";

export async function convertToImage() {
  try {
    const element = document.getElementById("stats-container");

    if (!element) {
      throw new Error(
        "Element with ID 'stats-container' not found in the DOM."
      );
    }

    const canvas = await html2canvas(element, {
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    return imgData;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error; // Re-throw the error for upstream handling
  }
}

export async function shareOnTwitter(address: string) {
  const base64 = await convertToImage();

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: base64, address: address }),
  });

  const data = await res.json();
  const screenshotUrl = data.url;

  const tweetIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    "Just checked out my Solana score!"
  )}&url=${encodeURIComponent(screenshotUrl)}`;

  window.open(tweetIntentUrl, "_blank");
}
