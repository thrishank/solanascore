import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, address } = body;

    if (!image || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const imageUrl = await upload(image, address);
    // // Remove data URL prefix if present
    // const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // // Ensure the upload directory exists
    // const uploadDir = path.resolve("public/uploads"); 
    // if (!fs.existsSync(uploadDir)) {
    //   fs.mkdirSync(uploadDir, { recursive: true });
    // }

    // // Save the file
    // const filePath = path.resolve(uploadDir, `${address}.png`);
    // fs.writeFileSync(filePath, base64Data, "base64");

    // // Generate the URL for the saved file
    // const url = new URL(`/uploads/${address}.png`, "https://solanascore.xyz").href;
    console.log("Image uploaded to Cloudinary:", imageUrl);
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function upload(img_data: any, stat_account: string) {
  try {
    const options = {
      public_id: stat_account,
    };
    const uploadResult = await cloudinary.uploader.upload(img_data, options);
    return uploadResult.secure_url;
  } catch (error) {
    console.error(error);
  }
}