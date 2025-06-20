import React from "react";
import axios from "axios";
import Parser from "rss-parser";
import { Markdown } from "../ui";
import { t } from "../i18next_wrapper";

export interface NewsPost {
  id: string;
  title: string;
  link: string;
  content: string;
}

const FEED_URL = "https://farm.bot/blogs/news.atom";

const parser = new Parser();

export const truncate = (html: string) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const ps = Array.from(doc.body.querySelectorAll("p")).slice(0, 3);
  return ps.map(p => p.outerHTML).join("");
};

export const NewsCard = ({ post }: { post: NewsPost }) =>
  <div className="problem-alert bulletin-alert">
    <div className="problem-alert-title row grid-exp-2">
      <i className="fa fa-info-circle" />
      <h3>{post.title}</h3>
    </div>
    <div className="problem-alert-content">
      <Markdown html={true}>{truncate(post.content)}</Markdown>
      <a className="link-button fb-button green" href={post.link}
        target="_blank" rel="noreferrer">
        {t("Read more")}
      </a>
    </div>
  </div>;

export const useNewsFeed = () => {
  const [posts, setPosts] = React.useState<NewsPost[]>([]);
  React.useEffect(() => {
    axios.get(FEED_URL)
      .then(resp => parser.parseString(resp.data))
      .then(feed => setPosts((feed.items || []).slice(0, 3).map(i => ({
        id: i.id || i.guid || i.link || "",
        title: i.title || "",
        link: i.link || "",
        content: i['content:encoded'] || i.content || "",
      }))))
      .catch(() => { });
  }, []);
  return posts;
};

export const News = () => {
  const posts = useNewsFeed();
  if (posts.length === 0) { return <div />; }
  return <div className="farmbot-news">
    <h3>{t("FarmBot News")}</h3>
    {posts.map(p => <NewsCard key={p.id} post={p} />)}
  </div>;
};
