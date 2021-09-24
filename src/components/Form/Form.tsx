import React, { useEffect, useState } from "react";

const defaultColor = "#2e7eff";
const { protocol, hostname, port } = window.location;
export const baseAppURL = `${protocol}//${hostname}:${port}`;

interface Props {
  onSetFinalLink: (id: string) => void;
}

export const Form = ({ onSetFinalLink }: Props) => {
  const [username, setUsername] = useState("");
  const [repository, setRepository] = useState("");
  const [color, setColor] = useState(defaultColor);
  const [avatarURLs, setAvatarURLs] = useState([] as string[]);
  const [avatar, setAvatar] = useState("");

  const onUserNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(ev.target.value);
  };

  const onRepoChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setRepository(ev.target.value);
  };

  const onColorChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setColor(ev.target.value);
  };

  const onAvatarClick = (ev: React.MouseEvent<HTMLLIElement>) => {
    const url = (ev.target as HTMLImageElement).getAttribute("src") as string;
    setAvatar(url);
  };

  useEffect(() => {
    setAvatarURLs(getAvatars());
  }, []);

  const resetForm = () => {
    setUsername("");
    setRepository("");
    setColor(defaultColor);
    setAvatar("");
  };

  const onFormSubmit = async (ev: React.MouseEvent) => {
    ev.preventDefault();
    const data = {
      username,
      repository,
      color,
      avatar: avatar,
    };

    const response = await fetch(`${baseAppURL}/create-entry`, {
      method: "POST",
      headers: {
        Accept: "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return window.alert(
        `Something went wrong with your entry,\nstatus: ${response.status}`
      );
    }

    const responseData = (await response?.json()) as { newId: string };
    onSetFinalLink(responseData.newId);
    resetForm();
  };

  const isSubmitDisabled = !(username && repository && avatar);
  return (
    <form>
      <h1>Get shareable link for your Github repo</h1>
      <label htmlFor="username-input">Add your Github username</label>
      <input
        type="text"
        id="username-input"
        onChange={onUserNameChange}
        value={username}
      />

      <label htmlFor="repository-input">Add Github repository</label>
      <input
        type="text"
        id="repository-input"
        onChange={onRepoChange}
        value={repository}
      />

      <label htmlFor="color-input">Choose your color</label>
      <input
        type="color"
        id="color-input"
        onChange={onColorChange}
        value={color}
      />

      <label htmlFor="color-input">Choose your avatar</label>
      <ul>
        {avatarURLs.map((url) => (
          <li
            key={url}
            value={url}
            onClick={onAvatarClick}
            className={url === avatar ? "selected" : ""}
          >
            <img src={url} alt="avatar" className="avatar-thumb" />
          </li>
        ))}
      </ul>

      <button
        onClick={onFormSubmit}
        id="submit-button"
        disabled={isSubmitDisabled}
      >
        Get your link
      </button>
    </form>
  );
};

function getAvatars() {
  // https://randomuser.me/documentation#format
  // https://randomuser.me/api/portraits/thumb/men/75.jpg

  const ids = [];
  for (let i = 1; i < 9; i++) ids.push(i);

  return ids.map(
    (id) => `https://randomuser.me/api/portraits/thumb/lego/${id}.jpg`
  );
}
