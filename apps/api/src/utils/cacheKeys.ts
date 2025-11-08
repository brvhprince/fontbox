export const cacheKeys = {
  fontsList: (hash: string) => `fonts:list:${hash}`,
  font: (id: string) => `font:${id}`,
  tagsList: 'tags:list',
  categoriesList: 'categories:list',
  projectsList: (userId: string) => `projects:list:${userId}`,
  search: (term: string) => `search:${term}`,
};
