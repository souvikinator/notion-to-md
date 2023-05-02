export const extractTitleFromMdLink = (mdLink: string) => {
  const regex = /\[(.*?)\]/;
  const match = regex.exec(mdLink);
  return match ? match[1] : "";
};
