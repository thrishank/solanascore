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
