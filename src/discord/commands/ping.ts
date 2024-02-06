import { Client, Interaction, SlashCommandBuilder } from 'discord.js';
import { CommandInteractionHandler } from '../command-interaction-handler';

export class Ping extends CommandInteractionHandler {
  constructor(client: Client) {
    super(client);
  }

  command: string = 'ping';
  description: string = 'Replies with Pong!';

  getBuilder(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.command).setDescription(this.description);
  }

  async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
      await interaction.reply('Pong!');
    }
  }
}
