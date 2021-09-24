import { useState } from "react";
import { Form, baseAppURL } from "./components/Form/Form";
import {
  RepoShowcase,
  getRepoIdFromURL,
} from "./components/RepoShowcase/RepoShowcase";
import "./App.css";

function App() {
  const hasURLResultId = /^\/r\//i.test(window.location.pathname);
  const entryId = getRepoIdFromURL();
  const [shareLink, setShareLink] = useState(entryId ?? "");

  const onSetFinalLink = (id: string) => {
    setShareLink(id);
  };

  return (
    <div className="App">
      {hasURLResultId ? (
        <RepoShowcase />
      ) : (
        <>
          <Form onSetFinalLink={onSetFinalLink} />

          {shareLink && (
            <div id="result-container">
              <p>Share your link:</p>
              <a
                href={`${baseAppURL}/r/${shareLink}`}
                target="blank"
                rel="noopener noreferrer"
              >
                {`${baseAppURL}/r/${shareLink}`}
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
