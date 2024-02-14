function setupCacheCollector(intervalInMillseconds: number = 60000) {
  setInterval(() => {
    console.log('Cache collector is running');
  }, intervalInMillseconds);
}
