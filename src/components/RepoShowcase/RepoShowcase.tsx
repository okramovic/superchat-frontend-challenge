import { useEffect, useState } from "react";
import { baseAppURL } from "../Form/Form";
import styles from "./RepoShowcase.module.css";

interface RepoCustomizationData {
  avatar: string;
  color: string;
  repository: string;
  username: string;
  _id: string;
}

interface ghRepoResponse {
  stargazers_count: number;
  name: string;
  description: string;
}

interface CardData extends RepoCustomizationData {
  contributorNames: string[];
  stargazers_count: number;
  repoTitle: string;
  description: string;
}

export const RepoShowcase = () => {
  const [data, setData] = useState(null as CardData | null);

  useEffect(() => {
    const getData = async () => {
      try {
        const mongoResponse = await fetch(
          baseAppURL + "/repo/" + getRepoIdFromURL(),
          {
            method: "GET",
            headers: {
              Accept: "*",
              "Content-Type": "application/json",
            },
          }
        );

        const data = (await mongoResponse.json()) as RepoCustomizationData;
        const { username, repository, avatar, color } = data;

        const githubResponse = await fetch(
          `https://api.github.com/repos/${username}/${repository}`,
          {
            method: "GET",
            headers: {
              Accept: "*",
              "Content-Type": "application/json",
            },
          }
        );
        const githubData = (await githubResponse.json()) as ghRepoResponse;
        const { stargazers_count, description, name } = githubData;

        const contributors = await fetch(
          `https://api.github.com/repos/${username}/${repository}/contributors`
        ).then((res) => res.json());
        const contributorNames = (
          contributors as { login: string; contributions: number }[]
        )
          .sort((a, b) => a.contributions - b.contributions)
          .filter((_, i) => i < 10)
          .map(({ login }) => login);

        return {
          username,
          repository,
          avatar,
          color,
          contributorNames,
          stargazers_count,
          description,
          repoTitle: name,
        } as CardData;
      } catch (e) {
        console.error(e);
        return null;
      }
    };

    getData().then((d) => setData(d));
  }, []);

  const color = data && data.color ? data.color : "black";
  const style = {
    boxShadow: `0 0 5px 5px ${color}`,
    color,
  };

  return (
    <div
      id="repo-showcase-container"
      className={styles["card-container"]}
      style={style}
    >
      {!data ? (
        <div>no repository data found</div>
      ) : (
        <>
          <div className="flex align-items-center">
            <img
              src={data.avatar}
              alt="avatar"
              className={styles.avatar + " avatar-thumb"}
            />
            <h1>
              {data.username} / {data.repository}
            </h1>
          </div>

          <div className={styles["info-container"]}>
            <h2>{data.description}</h2>
          </div>
          <h3>{data.stargazers_count} ⭐</h3>

          <p>
            Top contributors:
            {data.contributorNames.map((name) => (
              <span key={name} className={styles.contributor}>
                {name}
              </span>
            ))}
          </p>

          <a
            className={"github-button " + styles["github-button"]}
            href={`https://github.com/${data.username}/${data.repoTitle}`}
            data-color-scheme="no-preference: light; light: light; dark: dark;"
            data-size="large"
            data-icon="octicon-star"
            aria-label={`Star ${data.username}/${data.repository} on GitHub`}
            target="blank"
            rel="noopener noreferrer"
          >
            Star the repository
          </a>
        </>
      )}
    </div>
  );
};

export function getRepoIdFromURL() {
  return window.location.pathname.replace(/^\/r\//i, "").replace(/^\//, "");
}
