import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, Interaction, SlashCommandBuilder } from 'discord.js';
import { CommandInteractionHandler } from '../command-interaction-handler';
import { Condiction, NumbericProperties, Production, StringProperties } from '../../db/types';
import { isValidField, translateChineseToEnglish, translateEnglishToChinese } from '../../db/helper';
import { GlobalStorage } from '../../global-storage';
import { Database, FilterMethod } from '../../db';
import { limitString } from '../utils';

export class Find extends CommandInteractionHandler {
  command: string = 'find';
  description: string = '查找产品';

  constructor(client: Client) {
    super(client);
  }

  private numericFields: { [key in NumbericProperties]?: string } = {
    factoryPrice2: '出厂价2',
    minOrderQuantity: '最小起订量',
    onePieceDistributionPrice2: '一件代发价2',
  };

  private stringFields: { [key in StringProperties]?: string } = {
    productBrand: '产品品牌',
    productName: '产品名称',
    itemNumber: '货号',
    packageAttribute: '包装属性',
    productAttribute: '产品属性',
    suitableChannels: '合适渠道',
    connectedChannels: '对接过的渠道',
  };

  getBuilder(): SlashCommandBuilder {
    const builder = new SlashCommandBuilder().setName(this.command).setDescription(this.description);

    for (const field of Object.keys(this.numericFields) as NumbericProperties[]) {
      builder
        .addNumberOption(option =>
          option
            .setName(`${translateEnglishToChinese(field)}小于`)
            .setDescription(this.numericFields[field] ?? '')
            .setRequired(false)
        )
        .addNumberOption(option =>
          option
            .setName(`${translateEnglishToChinese(field)}大于`)
            .setDescription(this.numericFields[field] ?? '')
            .setRequired(false)
        );
    }

    for (const field of Object.keys(this.stringFields) as StringProperties[]) {
      builder.addStringOption(option =>
        option
          .setName(`${translateEnglishToChinese(field)}`)
          .setDescription(this.stringFields[field] ?? '')
          .setRequired(false)
      );
    }

    builder.addBooleanOption(option =>
      option
        .setName(`${translateEnglishToChinese('isNewProduct')}`)
        .setDescription('是否新品')
        .setRequired(false)
    );

    return builder;
  }

  async onInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName !== 'find') return;

    const db: Database = GlobalStorage.getInstance().getDatabase();
    const condictions: Condiction[] = [];
    interaction.options.data.forEach(option => {
      if (option.name.endsWith('小于')) {
        const field = (translateChineseToEnglish(option.name.slice(0, option.name.length - 2)) ??
          '') as keyof Production;
        if (!isValidField(field)) return;
        condictions.push({
          field,
          method: FilterMethod.LessThan,
          value: option.value as number,
        });
      } else if (option.name.endsWith('大于')) {
        const field = (translateChineseToEnglish(option.name.slice(0, option.name.length - 2)) ??
          '') as keyof Production;
        if (!isValidField(field)) return;
        condictions.push({
          field,
          method: FilterMethod.GreaterThan,
          value: option.value as number,
        });
      } else if (option.name === '是否新品') {
        const field = (translateChineseToEnglish(option.name) ?? '') as keyof Production;
        if (!isValidField(field)) return;
        condictions.push({
          field,
          method: option.value === true ? FilterMethod.NotEmpty : FilterMethod.IsEmpty,
          value: -1,
        });
      } else {
        const field = (translateChineseToEnglish(option.name) ?? '') as keyof Production;
        if (!isValidField(field)) return;
        condictions.push({
          field,
          method: FilterMethod.Include,
          value: option.value as string,
        });
      }
    });
    if (condictions.length === 0) {
      await interaction.reply('没有提供任何查询条件');
      return;
    }
    const productions = db.filter(condictions);
    if (productions.length === 0) {
      await interaction.reply('没有符合的结果');
      return;
    }
    const replyMessage = `查询到${productions.length}条结果: \n${productions
      .map(p => `${p.productBrand} - ${p.itemNumber} - ${p.productName}`)
      .slice(0, 10)
      .join('\n')}}`;

    const timestamp = Date.now();
    GlobalStorage.getInstance().setSearchResult(timestamp, productions);

    const generate = new ButtonBuilder()
      .setCustomId('generate')
      .setLabel(`生成 - ${timestamp.toString()}`)
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(generate);

    await interaction.reply({
      content: limitString(replyMessage),
      components: [row],
    });
  }
}
