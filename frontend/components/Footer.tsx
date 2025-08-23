import Link from "next/link";
import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#457B9D] py-10 md:py-15 px-6 sm:px-8">
      <div className="max-w-5xl mx-auto text-center">
        {/* Description */}
        <div className="mb-12 max-w-2xl mx-auto">
          <p className="text-white/90 leading-relaxed text-xl sm:text-2xl font-[Cormorant_Garamond] italic">
            Every memory is a piece of who you are. We&apos;re here to help you (capture) it into something that lasts forever.
          </p>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center gap-4 sm:gap-6 mb-12">
          {[
            { href: "#", icon: <FaFacebookF />, label: "Facebook" },
            { href: "#", icon: <FaTwitter />, label: "Twitter" },
            { href: "#", icon: <FaYoutube />, label: "YouTube" },
            { href: "#", icon: <FaInstagram />, label: "Instagram" },
          ].map(({ href, icon, label }, i) => (
            <Link
              key={i}
              href={href}
              aria-label={label}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-inner"
            >
              {icon && (
                <span className="text-white text-lg sm:text-xl">{icon}</span>
              )}
            </Link>
          ))}
        </div>

        {/* Footer Links (Optional) */}
        <div className="mb-10 hidden sm:flex justify-center gap-6 text-white/80 text-sm tracking-wide">
          <Link href="#" className="hover:underline hover:text-white">Privacy Policy</Link>
          <span>|</span>
          <Link href="#" className="hover:underline hover:text-white">Terms of Service</Link>
          <span>|</span>
          <Link href="#" className="hover:underline hover:text-white">Contact</Link>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/20 pt-6">
          <p className="text-[#F1FAEE] text-sm sm:text-base tracking-wide">
            &copy; {new Date().getFullYear()} All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
