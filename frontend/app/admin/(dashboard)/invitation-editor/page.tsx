"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleSessionExpiry } from "@/utils/handleSessionExpiry";
import {
  getInvitationPageAdmin,
  upsertInvitationPageAdmin,
} from "@/api/invitationPageApis";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p style={{ padding: "20px" }}>Loading editor...</p>,
});

import "react-quill-new/dist/quill.snow.css";

const PAGE_KEY = "default";
const PUBLIC_PATH = "/invitation";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["link"],
    ["blockquote"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "bullet",
  "indent",
  "align",
  "link",
  "blockquote",
];

export default function InvitationEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPage = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Missing admin token");
        return;
      }
      const data = await getInvitationPageAdmin(token, PAGE_KEY);
      setTitle(data.title || "");
      setContent(data.html || "");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load invitation page";
      if (handleSessionExpiry(message, router, true)) return;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const savePage = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Missing admin token");
        return;
      }
      await upsertInvitationPageAdmin(token, {
        key: PAGE_KEY,
        title,
        html: content,
      });
      toast.success("Invitation page saved");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save invitation page";
      if (handleSessionExpiry(message, router, true)) return;
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="w-full p-6 sm:p-10">
      <div className="w-full bg-white rounded-xl p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Invitation Page</h1>
          <p className="text-sm text-gray-500 mt-1">
            Public URL:{" "}
            <a
              href={PUBLIC_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#457B9D] underline hover:text-[#1D3557]"
            >
              {typeof window !== "undefined"
                ? `${window.location.origin}${PUBLIC_PATH}`
                : PUBLIC_PATH}
            </a>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={PUBLIC_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-[#1D3557] font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            View public page
          </a>
          <button
            type="button"
            onClick={savePage}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2b4e7e] to-[#1D3557] hover:from-[#1D3557] hover:to-[#192e4b] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-60"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="w-full bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label
              htmlFor="invitationTitle"
              className="text-sm font-semibold text-gray-600 shrink-0"
            >
              Page title:
            </label>
            <input
              id="invitationTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Invitation"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:border-gray-300 transition-all duration-200 disabled:bg-gray-50"
            />
          </div>

          <div className="custom-quill-container rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <p className="p-6 text-sm text-gray-500">Loading editor...</p>
            ) : (
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Write your invitation content here..."
              />
            )}
          </div>
          <p className="text-xs text-gray-500">
            Use the toolbar for headings, bold, bullets, links, and more. Links
            open in a new tab on the public page.
          </p>
        </div>
      </div>
    </main>
  );
}
