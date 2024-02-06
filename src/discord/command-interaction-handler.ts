import { Client, Interaction, SlashCommandBuilder } from 'discord.js';

export abstract class CommandInteractionHandler {
  protected readonly client: Client;
  constructor(client: Client) {
    this.client = client;
  }
  abstract command: string;
  abstract description: string;
  abstract getBuilder(): SlashCommandBuilder;
  abstract onInteraction(interaction: Interaction): Promise<void>;
}
