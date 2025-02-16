function isExternalUrl(url: string): boolean {
  return !url.includes('prod-files-secure.s3.us-west-2.amazonaws.com');
}

export { isExternalUrl };
