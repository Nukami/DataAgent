import { Client, Interaction, TextBasedChannel } from 'discord.js';
import { GlobalStorage } from '../../global-storage';
import { limitString } from '../utils';
import { ButtonInteractionHandler } from '../button-interaction-handler';
import { generatePublicExcel, generatePrivateExcel, generatePPTX } from '../helper';
import { Production } from '../../db';

export class Generate extends ButtonInteractionHandler {
  customId: string = 'generate';

  constructor(client: Client) {
    super(client);
  }

  async genAndSend(channel: TextBasedChannel, id: string, productions: Production[]) {
    const publicExcel = await generatePublicExcel(id, productions);
    const privateExcel = await generatePrivateExcel(id, productions);
    const pptx = await generatePPTX(id, productions);
    const files = [publicExcel, privateExcel, ...pptx];
    await channel.send(`${id} - 生成完成，共${files.length}个文件，正在上传中，请注意查收`);
    for (const file of files) {
      await channel.send({ files: [file] });
    }
    await channel.send(`${id} - 上传完毕`);
  }

  async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton()) return;
    if (interaction.customId !== this.customId) return;
    const resultId = Number(interaction.component.label?.replace('生成 - ', '') ?? '0');
    const productions = GlobalStorage.getInstance().getSearchResult(resultId);
    if (productions.length === 0) {
      await interaction.reply('没有符合的结果');
      return;
    }

    if (interaction.channel !== null) {
      const replyMessage = `正在生成${productions.length}条结果，请稍候。`;
      this.genAndSend(interaction.channel, resultId.toString(), productions);
      await interaction.reply({
        content: limitString(replyMessage, 2000),
      });
      return;
    }
    await interaction.reply('无法获取频道信息');
  }
}
