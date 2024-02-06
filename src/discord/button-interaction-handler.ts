import { Client, Interaction } from 'discord.js';

export abstract class ButtonInteractionHandler {
  protected readonly client: Client;
  constructor(client: Client) {
    this.client = client;
  }
  abstract customId: string;
  abstract onInteraction(interaction: Interaction): Promise<void>;
}
