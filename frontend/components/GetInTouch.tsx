import { useState } from "react";

export default function GetInTouch() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 bg-[#A8DADC]  px-8 py-12 lg:px-12 lg:py-20 flex items-center justify-center">
        <div className="w-full max-w-lg mx-auto ">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-6">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L8.5 8.5L2 12L8.5 15.5L12 22L15.5 15.5L22 12L15.5 8.5L12 2Z"/>
              </svg>
            </div>
            <h2 className="font-serif text-4xl lg:text-6xl font-[500] text-[#1D3557] mb-8 text-center lg:text-left">Get in Touch</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="border-[#1D3557] border-0 border-b-2 w-full py-3 text-[#1D3557] placeholder:text-[#1D3557] font-[300] text-[18px] lg:text-[24px] focus:outline-none transition duration-300"
                required
              />
            </div>

            <div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your Email"
                className="border-[#1D3557] border-0 border-b-2 w-full py-3 text-[#1D3557] placeholder:text-[#1D3557] font-[300] text-[18px] lg:text-[24px] focus:outline-none transition duration-300"
                required
              />
            </div>
            <div>
              <input
                 id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                className="border-[#1D3557] border-0 border-b-2 w-full py-3 text-[#1D3557] placeholder:text-[#1D3557] font-[300] text-[18px] lg:text-[24px] focus:outline-none transition duration-300"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-[#457B9D] hover:bg-[#1D3557] text-white px-8 py-3 rounded-full font-medium transition-colors duration-300 mt-8 w-full sm:w-auto"
            >
              Send Now!
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="flex-1 bg-cover bg-center bg-no-repeat bg-none lg:bg-[url('/assets/get_in_touch.jpg')] " />
    </div>
  );
}
