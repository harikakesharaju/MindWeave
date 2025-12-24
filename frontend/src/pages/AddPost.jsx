import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddPost.css";   // ⭐ IMPORTANT: CSS file
import { lightenColor, darkenColor } from "../UtilityMethods";


// Icons (unchanged)
const Send = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M15 7l-6 6" />
  </svg>
);
const Trash2 = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);
const Palette = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c1.365 0 2.684-.282 3.9-.817a8.552 8.552 0 0 0 4.1-3.616c.535-1.217.817-2.536.817-3.9 0-5.523-4.477-10-10-10z"/><path d="M18 10a4 4 0 0 0-4-4"/>
  </svg>
);
const Text = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 6H3"/><path d="M12 2v20"/><path d="M10 20h4"/>
  </svg>
);
const Type = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 7 4 4 20 4 20 7"/><line x1="12" y1="9" x2="12" y2="20"/>
  </svg>
);

const ChevronDown = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

// Mock navigation
const useNavigate = () => (path) => console.log("Navigate:", path);

const AddPost = () => {
  const [heading, setHeading] = useState("");
  const [content, setContent] = useState("");
  const [fontStyle, setFontStyle] = useState("Inter, sans-serif");
  const [textColor, setTextColor] = useState("#1f2937");
  const [backgroundColor, setBackgroundColor] = useState("#f3f4f6");
  const [backgroundMode,setBackgroundMode]  =useState("light");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fontOptions = [
    "Arial", "Times New Roman", "Verdana", "Georgia", 
    "Courier New", "Impact", "Inter, sans-serif"
  ];
  const bgStyle = backgroundMode === "light"
  ? `linear-gradient(135deg, ${backgroundColor}, ${lightenColor(backgroundColor, 40)})`
  : `linear-gradient(135deg, ${backgroundColor}, ${darkenColor(backgroundColor, 40)})`;


  const navigate = useNavigate();

  const formatContentForPreview = (text) =>
    text.split("\n").map((line, i) => (
      <React.Fragment key={i}>{line}<br/></React.Fragment>
    ));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
      toast.error("Please log in to create a post.");
      return;
    }

    setIsSubmitting(true);

    const postData = { heading, content, fontStyle, textColor, backgroundColor,backgroundMode};

    try {
      const response = await fetch(`https://mindweave-production-f1b6.up.railway.app/api/posts/create/${loggedInUser}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        toast.success("Thought Published! ✨");
        setHeading("");
        setContent("");
        setFontStyle("Inter, sans-serif");
        setTextColor("#1f2937");
        setBackgroundColor("#f3f4f6");
      } else {
        toast.error("Something went wrong");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="addpost-wrapper">

      <ToastContainer />

      <div className="addpost-container">

        {/* LEFT CARD - FORM */}
        <div className="card-left">
          <h2 className="card-title">
            <Palette className="icon" /> Craft & Style Your Thought
          </h2>

          <form onSubmit={handleSubmit}>

            {/* Heading */}
            <div className="form-group">
              <label className="form-label">Heading (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
              />
            </div>

            {/* Content */}
            <div className="form-group">
              <label className="form-label">Your Message (Required)</label>
              <textarea
                className="form-textarea"
                rows="7"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Style Controls */}
            <div className="style-grid">

              <div>
                <label className="small-label"><Type className="small-icon" /> Font</label>
                <select className="form-select" value={fontStyle} onChange={(e) => setFontStyle(e.target.value)}>
                  {fontOptions.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="small-label"><Text className="small-icon" /> Text Color</label>
                <input type="color" className="color-input" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
              </div>

              <div>
                <label className="small-label"><Palette className="small-icon" /> Background</label>
                <input type="color" className="color-input" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
              </div>
              <div>
                <select value={backgroundMode} onChange={(e) => setBackgroundMode(e.target.value)}>
  <option value="light">Light</option>
  <option value="dark">Dark</option>
</select>

                </div>
              
            </div>

            {/* Buttons */}
            <div className="button-row">
              <button type="button" className="secondary-btn" onClick={() => {
                setHeading(""); setContent(""); 
                setFontStyle("Inter, sans-serif"); setTextColor("#1f2937"); setBackgroundColor("#f3f4f6");
              }}>
                <Trash2 className="icon-small" /> Discard
              </button>

              <button type="submit" className="primary-btn" disabled={isSubmitting}>
                {isSubmitting ? "Publishing..." : <><Send className="icon-small" /> Publish</>}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT CARD - PREVIEW */}
        <div className="card-right">
          <h3 className="preview-title">Live Preview</h3>

          <div className="preview-box" style={{ background:bgStyle }}>
            <h4 className="preview-heading" style={{ color: textColor }}>{heading || "Preview Heading"}</h4>
            <div className="preview-content" style={{ fontFamily: fontStyle, color: textColor }}>
              {formatContentForPreview(content || "Your thought will appear here...")}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddPost;
