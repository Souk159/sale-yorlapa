import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/layout/Navbar";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ຢໍລະປາ | ວັດຖຸດິບສົດໃໝ່ອັດສູນຍາກາດ",
  description: "ຂາຍວັດຖຸດິບໃຫ້ຣ້ານອາຫານ ອັດສູນຍາກາດ ສັ່ງໄດ້ເປັນກຣາມ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lo" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f8fdf8]">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-white border-t border-green-100 py-8 mt-12">
            <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
              <p className="text-green-700 font-semibold text-base mb-1">🌿 ຢໍລະປາ</p>
              <p>ວັດຖຸດິບສົດໃໝ່ | ອັດສູນຍາກາດ | ສັ່ງໄດ້ຕາມກຣາມ</p>
              <p className="mt-1">© 2026 ຢໍລະປາ. ສະຫງວນລິຂະສິດ.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
