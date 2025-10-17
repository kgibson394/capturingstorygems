"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  BookOpen,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Download,
  Sparkles,
  X,
  Edit3,
  Printer,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { IoMdCreate } from "react-icons/io";
import { Button } from "@/components/ui/Button";
import { PrivateRoute } from "@/utils/RouteProtection";
import { handleSessionExpiry } from "@/utils/handleSessionExpiry";
import { handleDownload, handlePrintPDF } from "@/utils/downloadStory";
const serverBaseUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

type Story = {
  _id: string;
  story_title: string;
  read_time: string;
  genre: string;
  enhanced_story: string;
};

type UploadStory = {
  story?: string;
};

const Story = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<string | boolean>(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [editedStory, setEditedStory] = useState("");
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [storyPages, setStoryPages] = useState<Story[]>([]);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [errors, setErrors] = useState({
    story: "",
  });
  const [currentStoryPage, setCurrentStoryPage] = useState<Story>({
    _id: "",
    story_title: "",
    read_time: "",
    genre: "",
    enhanced_story: "",
  });

  const handleRevise = async (updatedStory?: string) => {
    if (!currentStoryPage) return;
    setErrors({
      story: "",
    });
    setLoading("Editing your story");
    setDisabled(true);
    try {
      const token = localStorage.getItem("token");
      const body: UploadStory = {};
      if (updatedStory !== undefined) {
        body.story = updatedStory;
      }
      const res = await fetch(
        `${serverBaseUrl}/user/story/${currentStoryPage._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        if (handleSessionExpiry(data.message, router, true)) return;
        if (res.status === 403) {
          const error = typeof data.error;
          if (error === "object") {
            setErrors(data.error);
          }
        } else {
          toast.error(data.message || "Failed to revise story");
        }
        return;
      }

      await loadStoryPages();
      toast.success(data.message);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to revise story");
    } finally {
      setDisabled(false);
      setLoading(false);
    }
  };

  const loadStoryPages = async () => {
    setLoading("Retrieving something beautiful from what you've shared…");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${serverBaseUrl}/user/story`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        if (handleSessionExpiry(data.message, router, true)) return;
        toast.error(data.message || "Failed to fetch stories");
        return;
      }

      setStoryPages(data?.response?.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getStoryPages = async () => {
      await loadStoryPages();
    };
    getStoryPages();
  }, []);

  useEffect(() => {
    setCurrentStoryPage(storyPages[currentPage]);
  }, [currentPage, storyPages]);

  const nextPage = () => {
    if (currentPage < storyPages.length - 1 && !isAnimating) {
      setDirection("forward");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setTimeout(() => setIsAnimating(false), 300);
      }, 150);
    }
  };

  const previousPage = () => {
    if (currentPage > 0 && !isAnimating) {
      setDirection("backward");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setTimeout(() => setIsAnimating(false), 300);
      }, 150);
    }
  };

  const goToPage = (index: number) => {
    if (!isAnimating && index !== currentPage) {
      setDirection(index > currentPage ? "forward" : "backward");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(index);
        setTimeout(() => setIsAnimating(false), 300);
      }, 150);
    }
  };

  const rawReadTime = currentStoryPage?.read_time ?? "0 minutes read";
  const [readTime, ...readTimeLabelParts] = rawReadTime.split(" ");
  const readTimeLabel = readTimeLabelParts.join(" ");

  const onClose = () => {
    setIsEditing(false);
    setEditedStory(currentStoryPage?.enhanced_story);
  };

  const handleDelete = async (storyId: string) => {
    if (!currentStoryPage) return;
    const index = storyPages.findIndex((s) => s._id === storyId);
    if (index === -1) return;
    setLoading("Deleting your story");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${serverBaseUrl}/user/story/${storyId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        if (handleSessionExpiry(data.message, router, true)) return;
        toast.error(data.message || "Failed to delete story");
        return;
      }

      const newPages = storyPages.filter((s) => s._id !== storyId);
      setStoryPages(newPages);
      if (newPages.length === 0) {
        setCurrentPage(0);
      } else {
        const nextIndex =
          index <= newPages.length - 1 ? index : newPages.length - 1;
        setCurrentPage(nextIndex);
      }

      await loadStoryPages();
      toast.success(data.message);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrivateRoute>
      <div className="bg-white">
        {/* Hero Section */}
        <div
          className="relative w-full py-15 md:h-[50vh] bg-cover bg-center"
          style={{ backgroundImage: 'url("/assets/story-homepage.jpg")' }}
        >
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative px-4">
            <div className="max-w-6xl text-white mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-8xl font-serif mb-6 leading-tight">
                Capturing Story Gems
              </h1>
              <p className="text-normal sm:text-lg xl:text-2xl mb-8 leading-relaxed max-w-3xl mx-auto opacity-90">
                Your memories have a heartbeat. Let&apos;s give them a voice
              </p>
            </div>
          </div>
        </div>

        {storyPages.length < 1 && (
          <div className="flex flex-col gap-4 justify-center items-center mb-8 bg-white">
            <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-serif mt-16 leading-tight">
              No Stories Found
            </h1>
            <Button
              onClick={() => router.push("upload-story")}
              className="flex gap-2 bg-[#457B9D] text-[#FAF9F6] py-2 px-8 rounded-full text-lg font-semibold hover:bg-[#375E73] transition"
            >
              <IoMdCreate className="w-4 h-4 mr-2" />
              Want to create
            </Button>
          </div>
        )}

        {storyPages.length > 0 && (
          <>
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
              <div className="max-w-6xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                  <span>
                    Story {currentPage + 1} of {storyPages.length}
                  </span>
                  <span className="hidden sm:inline">
                    {Math.round(((currentPage + 1) / storyPages.length) * 100)}%
                    Complete
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        ((currentPage + 1) / storyPages.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="py-8 sm:py-12 lg:py-16 px-4 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="hidden lg:flex justify-center mb-8">
                  <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/20">
                    <button
                      onClick={() => {
                        if (currentStoryPage) {
                          setEditedStory(currentStoryPage.enhanced_story);
                          setIsEditing(true);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105 font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      Revise
                    </button>
                    <button
                      onClick={() => {
                        handleDownload(currentStoryPage);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:shadow-lg hover:scale-105 font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        handlePrintPDF(currentStoryPage);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:shadow-lg hover:scale-105 font-medium"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                      <button
                        onClick={() => {
                          handleDelete(currentStoryPage?._id);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:shadow-lg hover:scale-105 font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                  </div>
                </div>
                <div className="lg:hidden relative mb-6">
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowMobileActions(!showMobileActions)}
                      className="flex items-center gap-2 px-4 py-3 bg-white/90 backdrop-blur-sm text-slate-700 rounded-full shadow-lg border border-white/20 hover:bg-white transition-all duration-300"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                      Actions
                    </button>
                  </div>

                  {showMobileActions && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10">
                      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20 min-w-[280px]">
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              if (currentStoryPage) {
                                setEditedStory(currentStoryPage.enhanced_story);
                                setIsEditing(true);
                                setShowMobileActions(false);
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium"
                          >
                            <Edit3 className="w-4 h-4" />
                            Revise
                          </button>
                          <button
                            onClick={() => {
                              handleDownload(currentStoryPage);
                              setShowMobileActions(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          <button
                            onClick={() => {
                              handlePrintPDF(currentStoryPage);
                              setShowMobileActions(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium"
                          >
                            <Printer className="w-4 h-4" />
                            Print
                          </button>
                            <button
                              onClick={() => {
                                handleDelete(currentStoryPage?._id);
                                setShowMobileActions(false);
                              }}
                              className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-0 md:px-4 gap-8 lg:gap-16 items-center">
                  <div
                    className={`transition-all duration-500 ease-in-out ${
                      isAnimating
                        ? direction === "forward"
                          ? "transform translate-x-8 opacity-0"
                          : "transform -translate-x-8 opacity-0"
                        : "transform translate-x-0 opacity-100"
                    }`}
                  >
                    <div className="mb-8">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif mb-6 leading-tight text-slate-800">
                        {currentStoryPage?.story_title}
                      </h2>
                    </div>

                    <div className="prose prose-lg max-w-none">
                      <p className="text-base sm:text-lg leading-relaxed text-slate-700 mb-8">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: currentStoryPage?.enhanced_story
                              ?.replace(/\n\n/g, "<br /><br />")
                              ?.replace(/\n/g, "<br />"),
                          }}
                        />
                      </p>
                    </div>

                    <div className="block lg:hidden mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <Button
                          onClick={previousPage}
                          disabled={currentPage === 0 || isAnimating}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 disabled:opacity-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>

                        <Button
                          onClick={nextPage}
                          disabled={
                            currentPage === storyPages.length - 1 || isAnimating
                          }
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 disabled:opacity-50"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex justify-center gap-2">
                        {storyPages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToPage(index)}
                            className={`w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all duration-300 text-xs sm:text-sm font-medium
                            ${
                              index === currentPage
                                ? "bg-blue-600 text-white scale-110"
                                : "bg-slate-300 text-black hover:bg-slate-400"
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex items-center justify-between mt-12 max-w-4xl mx-auto">
                  <Button
                    onClick={previousPage}
                    disabled={currentPage === 0 || isAnimating}
                    variant="outline"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50 hover:shadow-lg transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous Story
                  </Button>

                  <div className="flex gap-3">
                    {storyPages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToPage(index)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 text-sm font-medium
                        ${
                          index === currentPage
                            ? "bg-black text-white scale-125"
                            : "bg-slate-300 text-black hover:bg-slate-400"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={nextPage}
                    disabled={
                      currentPage === storyPages.length - 1 || isAnimating
                    }
                    variant="outline"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50 hover:shadow-lg transition-all duration-300"
                  >
                    Next Story
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="py-12 sm:py-16 bg-white">
              <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                  <div className="text-center p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold mb-2 text-slate-800">
                      {storyPages.length}
                    </div>
                    <div className="text-slate-600">Stories</div>
                  </div>
                  <div className="text-center p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold mb-2 text-slate-800">
                      {readTime}
                    </div>
                    <div className="text-slate-600">{readTimeLabel}</div>
                  </div>
                  <div className="text-center p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold mb-2 text-slate-800">
                      {currentStoryPage?.genre}
                    </div>
                    <div className="text-slate-600">Genre</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer Quote */}
        <div className="py-16 sm:py-20 bg-[#457B9D] text-white relative overflow-hidden">
          <div className="relative max-w-5xl mx-auto text-center px-4">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <BookOpen className="w-10 h-10" />
            </div>
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-serif italic mb-6 leading-relaxed">
              &quot;Your stories are worth telling… let’s
              bring them to life.&quot;
            </blockquote>
            <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
              A timeless reminder that love grows in the gardens we tend
              together
            </p>
          </div>
        </div>

        {loading && (
          <div className="fixed flex flex-col justify-center items-center bg-[#0000007c] h-full w-full top-0 left-0 backdrop-blur-md z-50">
            <Image
              src={"/loader.svg"}
              width={100}
              height={100}
              alt="Loader"
              className="object-contain animate-spin"
            />
            <p className="text-[#F1FAEE] text-2xl font-[Cormorant_Garamond]">
              {loading}
            </p>
          </div>
        )}
      </div>

      {isEditing && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-40 p-4"
          onClick={() => setIsEditing(false)}
        >
          <div className="fixed inset-0 flex items-center justify-center px-4 animate-fade-in">
            <div
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden animate-scale-in border border-[#A8DADC]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors group"
              >
                <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
              </button>

              <div className="relative p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-full bg-[#457B9D] shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1D3557] mb-2 font-[Cormorant_Garamond]">
                    Update Your Story
                  </h2>
                </div>

                <div className="relative mb-6">
                  <textarea
                    value={editedStory}
                    onChange={(e) => setEditedStory(e.target.value)}
                    placeholder="Once upon a time... or perhaps it was just yesterday."
                    className="w-full h-32 p-4 text-gray-800 bg-[#F1FAEE] border border-[#A8DADC] rounded-xl resize-none placeholder-gray-400 text-sm leading-relaxed focus:outline-none focus:border-[#457B9D] focus:ring-4 focus:ring-[#A8DADC]/50 transition-all duration-200"
                    rows={4}
                  />
                  {errors?.story && (
                    <p className="joi-error-message mb-4 text-xs">
                      {errors?.story[0]}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center mt-1 px-1 text-xs text-gray-500">
                  <span
                    className={
                      editedStory.length ? "text-[#457B9D] font-medium" : ""
                    }
                  >
                    {editedStory.length > 0 && "Great start!"}
                  </span>
                  <span>{editedStory.length}/10,000</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                  <Button
                    onClick={() => handleRevise(editedStory)}
                    disabled={editedStory.trim().length === 0 || disabled}
                    className="flex-1 py-3 text-sm font-semibold bg-[#457B9D] text-white hover:bg-[#1D3557] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                  >
                    Upload & Save Changes
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="mt-6 p-3 bg-[#F1FAEE] border border-[#A8DADC] rounded-xl">
                  <p className="text-center text-[#5A9AAF] italic text-xs">
                    &quot;The universe is made of stories, not atoms.&quot; –
                    Muriel Rukeyser
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PrivateRoute>
  );
};

export default Story;
