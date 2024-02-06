import { CommandInteractionHandler } from './command-interaction-handler';
import { Client } from 'discord.js';
import { Find } from './commands/find';
import { Ping } from './commands/ping';
import { ButtonInteractionHandler } from './button-interaction-handler';
import { Generate } from './buttons/generate';
import { Reload } from './commands/reload';

export function loadCommandHandlers(client: Client): CommandInteractionHandler[] {
  const commands: (new (client: Client) => CommandInteractionHandler)[] = [Find, Ping, Reload];
  return commands.map(command => new command(client));
}

export function loadButtonHandlers(client: Client): ButtonInteractionHandler[] {
  const buttons: (new (client: Client) => ButtonInteractionHandler)[] = [Generate];
  return buttons.map(button => new button(client));
}
