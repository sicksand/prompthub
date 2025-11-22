const { useState } = React;
const { motion } = window['framer-motion'];

function PromptGallery() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState("");

  const handleUpload = () => {
    if (!file) return;
    const newItem = {
      url: URL.createObjectURL(file),
      prompt,
      tags: tags.split(/[,\s]+/).filter(Boolean)
    };
    setItems([newItem, ...items]);
    setFile(null);
    setPrompt("");
    setTags("");
  };

  return (
    React.createElement("div", { className: "container" },
      React.createElement(motion.h1, { initial:{opacity:0}, animate:{opacity:1}, className:"title" }, "Prompt Gallery"),

      React.createElement("div", { className: "card" },
        React.createElement("input", {
          type:"file",
          accept:"image/*,video/*",
          onChange:(e)=>setFile(e.target.files[0])
        }),
        React.createElement("textarea", {
          placeholder:"Prompt description",
          value:prompt,
          onChange:(e)=>setPrompt(e.target.value)
        }),
        React.createElement("input", {
          placeholder:"#hashtags",
          value:tags,
          onChange:(e)=>setTags(e.target.value)
        }),
        React.createElement("button", { onClick:handleUpload }, "Upload")
      ),

      React.createElement("div", { className:"gallery" },
        items.map((item, idx) =>
          React.createElement("div", { key:idx, className:"card" },
            item.url.endsWith("mp4") || item.url.endsWith("webm") ?
              React.createElement("video", { src:item.url, controls:true, className:"media" }) :
              React.createElement("img", { src:item.url, className:"media" }),
            React.createElement("p", null, item.prompt),
            React.createElement("div", { className:"tags" },
              item.tags.map((t, i)=>
                React.createElement("span", { key:i, className:"tag" }, `#${t}`)
              )
            )
          )
        )
      )
    )
  );
}

ReactDOM.render(
  React.createElement(PromptGallery),
  document.getElementById("root")
);
