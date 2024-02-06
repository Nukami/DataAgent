import { Client, Interaction, SlashCommandBuilder, TextBasedChannel } from 'discord.js';
import { CommandInteractionHandler } from '../command-interaction-handler';
import { GlobalStorage } from '../../global-storage';
import { Database } from '../../db';

export class Reload extends CommandInteractionHandler {
  command: string = 'reload';
  description: string = '重新加载数据';

  constructor(client: Client) {
    super(client);
  }

  getBuilder(): SlashCommandBuilder {
    const builder = new SlashCommandBuilder().setName(this.command).setDescription(this.description);
    return builder;
  }

  async reloadAll(channel: TextBasedChannel): Promise<void> {
    const db: Database = GlobalStorage.getInstance().getDatabase();
    await db.reloadAll();
    const itemsAmount = db.getItemsAmount();
    await channel.send(`重新加载数据完成，共加载了${itemsAmount}条数据`);
  }

  async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName !== this.command) return;

    if (interaction.channel !== null) {
      await interaction.reply('开始重新加载数据');
      this.reloadAll(interaction.channel);
      return;
    }

    await interaction.reply('无法获取频道信息');
  }
}
