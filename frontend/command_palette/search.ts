import { Command, CommandAction } from "./interfaces";

export const normalizeCommandText = (text: string) => text
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^\p{L}\p{N}+-]+/gu, " ")
  .trim();

const MAX_SUBSEQUENCE_SCATTER_RATIO = 0.5;

const compactSubsequence = (query: string, text: string) => {
  const queryCharacters = [...query];
  const textCharacters = [...text];
  return textCharacters.some((character, start) => {
    if (character != queryCharacters[0]) { return false; }
    let queryIndex = 1;
    let textIndex = start + 1;
    while (queryIndex < queryCharacters.length
      && textIndex < textCharacters.length) {
      if (textCharacters[textIndex] == queryCharacters[queryIndex]) {
        queryIndex++;
      }
      textIndex++;
    }
    const scatter = textIndex - start - queryCharacters.length;
    return queryIndex == queryCharacters.length
      && scatter < queryCharacters.length * MAX_SUBSEQUENCE_SCATTER_RATIO;
  });
};

const commandText = (command: Command) => ({
  names: [command.name, command.englishName].map(normalizeCommandText),
  aliases: (command.aliases || []).map(normalizeCommandText),
});

export const scoreCommand = (command: Command, rawQuery: string) => {
  const query = normalizeCommandText(rawQuery);
  if (!query) { return 1; }
  const queryTokens = query.split(" ");
  const { names, aliases } = commandText(command);
  const all = [...names, ...aliases];
  if (names.includes(query)) { return 1000; }
  if (names.some(name => name.startsWith(query))) { return 900; }
  if (aliases.includes(query)) { return 850; }
  if (names.some(name => name.split(" ").some(word => word.startsWith(query)))) {
    return 800;
  }
  if (queryTokens.every(token => all.some(text => text.includes(token)))) {
    return 700 - queryTokens.length;
  }
  if (names.some(name => name.includes(query))) { return 600; }
  if (aliases.some(alias => alias.includes(query))) { return 500; }
  if (query.length > 2
    && names.some(name => compactSubsequence(query, name))) {
    return 200;
  }
  return 0;
};

const actionCommand = (
  command: Command,
  action: CommandAction,
): Command => ({
  ...command,
  name: `${command.name} ${action.name}`,
  englishName: `${command.englishName} ${action.englishName}`,
  aliases: [...(command.aliases || []), ...(action.aliases || [])],
  unavailable: action.unavailable || command.unavailable,
  actions: undefined,
  execute: action.execute,
});

export const searchCommands = (commands: Command[], query: string) => commands
  .map(command => {
    const score = scoreCommand(command, query);
    if (!command.actions?.length) { return { command, score }; }
    const actionMatches = command.actions
      .map(action => ({
        action,
        score: scoreCommand(actionCommand(command, action), query),
      }))
      .filter(result => result.score > 0);
    const bestActionScore = Math.max(
      0, ...actionMatches.map(result => result.score));
    if (score >= bestActionScore) { return { command, score }; }
    const bestActions = actionMatches
      .filter(result => result.score == bestActionScore);
    return {
      command: { ...command, actions: bestActions.map(result => result.action) },
      score: bestActionScore,
    };
  })
  .filter(result => result.score > 0)
  .sort((a, b) => b.score - a.score
    || (b.command.searchPriority || 0) - (a.command.searchPriority || 0)
    || (b.command.priority || 0) - (a.command.priority || 0)
    || Number(!!a.command.unavailable) - Number(!!b.command.unavailable)
    || a.command.name.length - b.command.name.length
    || a.command.name.localeCompare(b.command.name))
  .map(result => result.command);
