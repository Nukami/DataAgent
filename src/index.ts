import { GatewayIntentBits, REST, Routes } from 'discord.js';

import { Config } from './config';
import { Client } from 'discord.js';

import { default as proxy } from 'node-global-proxy';
import { ProxyAgent } from 'undici';
import { loadButtonHandlers, loadCommandHandlers } from './discord';
import { CommandInteractionHandler } from './discord/command-interaction-handler';
import { Database } from './db';
import { GlobalStorage } from './global-storage';
import { ButtonInteractionHandler } from './discord/button-interaction-handler';

const globalStorage = GlobalStorage.getInstance();

const config: Config = globalStorage.getConfig();

proxy.setConfig({
  http: config.proxy.url ?? '',
  https: config.proxy.url ?? '',
});

if (config.proxy.enable) proxy.start();

const db: Database = globalStorage.getDatabase();
db.loadAll();

const agent: ProxyAgent = new ProxyAgent(config.proxy.url);
const client: Client = new Client({
  intents: [GatewayIntentBits.Guilds],
  rest: { version: '10', agent: config.proxy.enable ? agent : undefined },
});

async function registerDiscordCommands(commands: CommandInteractionHandler[]) {
  const rest: REST = client.rest;
  const body = commands.map(command => command.getBuilder().toJSON());
  await rest.put(Routes.applicationCommands(config.auth.client_id), { body });
}

client.login(config.auth.token);

const commandHandlers: CommandInteractionHandler[] = [];
const buttonHandlers: ButtonInteractionHandler[] = [];

function reloadInteractionHandlers() {
  const loadedCommandHandlers = loadCommandHandlers(client);
  const loadedButtonHandlers = loadButtonHandlers(client);
  console.log(`Loaded ${loadedCommandHandlers.length} commands, ${loadButtonHandlers.length} buttons.`);
  commandHandlers.splice(0, commandHandlers.length);
  commandHandlers.push(...loadedCommandHandlers);
  buttonHandlers.splice(0, buttonHandlers.length);
  buttonHandlers.push(...loadedButtonHandlers);
  registerDiscordCommands(loadedCommandHandlers);
}

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
  reloadInteractionHandlers();
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    for (const command of commandHandlers) {
      if (command.command === interaction.commandName) {
        await command.onInteraction(interaction);
        return;
      }
    }
  } else if (interaction.isButton()) {
    for (const button of buttonHandlers) {
      if (button.customId === interaction.customId) {
        await button.onInteraction(interaction);
        return;
      }
    }
  }
});
