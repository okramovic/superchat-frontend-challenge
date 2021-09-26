import { useEffect, useState } from "react";
import styles from "./RepoShowcase.module.css";

interface RepoCustomizationData {
  avatar: string;
  color: string;
  repository: string;
  username: string;
  _id: string;
}

interface GithubRepoResponse {
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

interface Contributor {
  login: string;
  contributions: number;
}

export const RepoShowcase = () => {
  const [data, setData] = useState(null as CardData | null);

  useEffect(() => {
    const getData = async () => {
      try {
        const mongoResponse = await fetch("/repo/" + getRepoIdFromURL(), {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }).then((res) => res.json());

        const { username, repository, avatar, color } =
          mongoResponse as RepoCustomizationData;

        const githubResponseAsPromise = fetch(
          `https://api.github.com/repos/${username}/${repository}`,
          {
            method: "GET",
            headers: {
              Accept: "*",
              "Content-Type": "application/json",
            },
          }
        ).then((res) => res.json());

        const contributorsAsPromise = fetch(
          `https://api.github.com/repos/${username}/${repository}/contributors`
        ).then((res) => res.json());

        const [githubResponse, contributors] = await Promise.all([
          githubResponseAsPromise,
          contributorsAsPromise,
        ]);

        const { stargazers_count, description, name } =
          githubResponse as GithubRepoResponse;

        const contributorNames = (contributors as Contributor[])
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
            <ul className={styles["contributors-list"]}>
              {data.contributorNames.map((name) => (
                <li key={name} className={styles.contributor}>
                  {name}
                </li>
              ))}
            </ul>
          </p>

          <a
            className={"github-button " + styles["github-button"]}
            style={{ color }}
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
