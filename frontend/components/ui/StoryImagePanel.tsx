"use client";
import Image from "next/image";

interface Props {
  onJoin?: () => void; // <-- new prop
  isConfirmation?: boolean;
}

export default function StoryImagePanel({ onJoin, isConfirmation }: Props) {
  return (
    <div className="w-full lg:w-1/2 relative order-1 lg:order-2 mb-6 sm:mb-0">
      <div className="relative w-full h-full">
        <Image
          src="/assets/clarity-confirmation-image.jpg"
          width={2000}
          height={2000}
          alt="Story Confirmation"
          className="w-full h-100 md:h-full object-cover rounded-lg lg:rounded-tr-[120px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#0000004D] to-[#000000B2] rounded-lg lg:rounded-tr-[120px]" />
        {!isConfirmation && (
          <div className="absolute inset-0 flex justify-center items-center text-white px-12">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl xl:text-4xl mb-4 font-semibold">
                Turn Your Memories into Stories <br />
                Join our Free 2-Hour Mini Workshop
              </h2>
              <p className="text-sm sm:text-base md:text-lg mb-4">
                Your Memories are More Important than Writing Learn Simple Steps
                and Make Storytelling Easy Leave With a Meaningful Story in Hand
              </p>
              <button
                onClick={onJoin} // <-- opens modal
                className="bg-[#457B9D] hover:bg-[#3A5A6B] text-white px-6 py-[10px] rounded-full font-medium transition-colors"
              >
                Join for free!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
