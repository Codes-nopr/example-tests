/* eslint-disable no-tabs */
import { CommandInteraction, Collection } from "eris";
import RichEmbed from "../../deps/richembed";
import Logger from "../../deps/logger";
import type { InteractionStructure } from "../../deps/interfaces";

const cooldowns = new Map();

export default async (client: any, interaction: any) => {
	if (!interaction.guildID) return interaction.createMessage({ embeds: [new RichEmbed().setColor(client.color.error).setDescription("Slash commands can only be run in guilds.")], flags: 64 });
	if (interaction.member.user.bot) return null;

	const args: any[] = [];
	const cmd: any = client.slashCommands.get(interaction.data.name);
	if (interaction instanceof CommandInteraction) {
		// eslint-disable-next-line no-restricted-syntax
		for (const option of Object.keys(interaction.data) as unknown as InteractionStructure) {
			if (option.type === 1) {
				if (option.name) args.push(option.name);
					option.options?.forEach((x: any) => {
						if (x.value) args.push(x.value);
					});
			} else if (option.value) args.push(option.value);
		}
	}

	if (!cooldowns.has(cmd?.name)) {
		cooldowns.set(cmd?.name, new Map());
	}

	const currentTime = Date.now();
	const timeStamps = cooldowns.get(cmd?.name);
	const cooldownAmount = (cmd.cooldown) * 1000;

	if (timeStamps.has(interaction?.member.user.id)) {
		const expirationTime = timeStamps.get(interaction?.member.user.id) + cooldownAmount;
		if (currentTime < expirationTime) {
			const timeLeft = (expirationTime - currentTime) / 1000;
			return interaction.createMessage({ content: `⏰ Please wait \`${timeLeft.toFixed(2)}\` seconds, before using \`${cmd.name}\` command.`, flags: 64 });
		}
	}

	timeStamps.set(interaction.member.user.id!, currentTime);
	setTimeout(() => timeStamps.delete(interaction.member.user.id!), cooldownAmount);
	try {
		cmd.run({ client, interaction, args });
	} catch (e) {
        Logger.red(e);
    }
	return null;
};
