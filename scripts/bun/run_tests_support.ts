export const consumeValueFlag = (
  argv: string[],
  flag: string,
): string | undefined => {
  const inlinePrefix = `${flag}=`;
  for (let index = 0; index < argv.length; index++) {
    const current = argv[index];
    if (current === flag) {
      const value = argv[index + 1];
      argv.splice(index, 2);
      return value;
    }
    if (current.startsWith(inlinePrefix)) {
      const value = current.slice(inlinePrefix.length);
      argv.splice(index, 1);
      return value;
    }
  }
  return undefined;
};
