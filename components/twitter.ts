import html2canvas from "html2canvas";

export async function convertToImage() {
  try {
    console.log("Generating image...");
    const element = document.getElementById("stats-container");

    if (!element) {
      throw new Error(
        "Element with ID 'stats-container' not found in the DOM."
      );
    }

    const canvas = await html2canvas(element, {
      width: 1200, // Set your desired width
      scale: 2, // Increase scale for better quality
      windowWidth: 1600, // Match with width for consistency
    });

    const imgData = canvas.toDataURL("image/png");

    return imgData;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error; // Re-throw the error for upstream handling
  }
}

