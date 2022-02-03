import { Client, CommandInteraction, Interaction } from "eris";

export default async (client: Client, interaction: any) => {
    if (!interaction.guildID) return interaction.createMessage({ embeds: [new RichEmbed().setColor(client.color.error).setDescription(`${client.emotes.error} Slash commands can only be run in guilds`)], flags: 64 });
    if (interaction.member.user.bot) return null;
}