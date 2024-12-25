import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const primsa = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "thrishankkalluru@gmail.com",
    pass: process.env.MAIL,
  },
});

var address = 0;
export async function GET() {
  try {
    const data = await primsa.walletData.findMany();
    console.log(address);
    if (address !== data.length) {
      address = data.length;

      const lastItem = data[data.length - 1];
      const mailOptions = {
        from: "thrishankkalluru@gmail.com",
        to: "thrishankkalluru@gmail.com",
        subject: "solanascore stats",
        html: `
        <html>
        <head>
        <style>
        @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
        </style>
        </head>
        <body>
        <div class="p-4">
        <h1 class="text-2xl font-bold mb-4 text-red-500">Solanascore Stats</h1>
        <p class="mb-4">Total Address: ${data.length}</p>
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <div class="p-4">
        <p><strong>Address:</strong> ${lastItem.address}</p>
        <p><strong>Score:</strong> ${lastItem.score}</p>
        <p><strong>Fee:</strong> ${lastItem.fee}</p>
        <p><strong>Total Transactions:</strong> ${lastItem.totalTransactions}</p>
        </div>
        </div>
        </div>
        </body>
        </html>
        `,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }
  } catch (e) {
    console.log(e);
  }

  return NextResponse.json("Hello");
}
