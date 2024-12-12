import axios from 'axios';

export type Contribution = {
  id: string; // or number, depending on the type of mention.id
  username: string;
  avatar: string;
  image: string;
  count: number;
  date?: string;
}

export class ContributionService {
  constructor() {
  }

  async getTimeline() {
    const flux1 = await this.getContributionsFromDiscordChannel('1280924924625682484', true);
    const flux2 = await this.getContributionsFromDiscordChannel('1297965144579637248', true);

    return [...flux1, ...flux2];
  }

  async getContributions() {

    const flux1 = await this.getContributionsFromDiscordChannel('1280924924625682484');
    const flux2 = await this.getContributionsFromDiscordChannel('1297965144579637248');

    let contributions = [...flux1];

    for (const contribution of flux2) {
      const existingContribution = contributions.find((c) => c.username === contribution.username);
      if (existingContribution) {
        existingContribution.count += contribution.count;
      } else {
        contributions.push(contribution);
      }
    }

    contributions = contributions.sort((a, b) => b.count - a.count);

    // Merge the two fluxes
    return {
      data: contributions,
    };
  }

  async getContributionsFromCsvUrl(url: string) {
    try {
      const response = await axios.get(url);
      const csv = response.data;
      const rows = csv.split('\n');
      const userMentions: any = {};
      const mentions = [];

      for (const row of rows) {
        const columns = row.split(',');
        const username = columns[0];
        const count = parseInt(columns[1]);

        if (typeof userMentions[username] !== 'undefined') {
          userMentions[username].count += count;
        } else {
          userMentions[username] = {
            username,
            count,
          };
        }

        mentions.push({ username, count });
      }

      return ({ userMentions, mentions });
    } catch (error: any) {
      return ({ error: error.message });
    }

  }

  async getContributionsFromDiscordChannel(channelId: string, timelineMode = false): Promise<{
    id: string; // or number, depending on the type of mention.id
    username: string;
    avatar: string;
    image: string;
    count: number;
  }[]> {
    const DISCORD_API_URL = `https://discord.com/api/v10/channels/${channelId}/messages`;
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

    if (!DISCORD_BOT_TOKEN) {
      return [];
    }

    try {
      const messages = [];
      let lastMessageId;

      while (true) {
        const response = await axios.get(DISCORD_API_URL, {
          headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
          },
          params: {
            limit: 100,
            before: lastMessageId,
          },
        });

        const data: any = response.data;
        if (data.length === 0) {
          break;
        }

        messages.push(...data);
        lastMessageId = data[data.length - 1].id;
      }

      const mentions = [];

      if (timelineMode) {

        const timeline: Contribution[] = [];
        messages.map((message: any) => {
          message.mentions.map((mention: any) => {
            timeline.push({
              id: mention.id,
              username: mention.username,
              avatar: mention.avatar,
              image: 'https://cdn.discordapp.com/avatars/' + mention.id + '/' + mention.avatar + '.png',
              count: 1,
              date: message.timestamp,
            });
          });
        });

        return timeline;
      }

      for (const message of messages) {
        if (message.mentions) {
          mentions.push({
            ...message.mentions,
          });
        }
      }

      const userMentions: any = {};

      for (const mention of mentions) {
        if (typeof userMentions[mention.username] !== 'undefined') {
          userMentions[mention.username].count++;
        } else {
          userMentions[mention.username] = {
            id: mention.id,
            username: mention.username,
            avatar: mention.avatar,
            image: 'https://cdn.discordapp.com/avatars/' + mention.id + '/' + mention.avatar + '.png',
            count: 1,
          };
        }
      }
      return Object.values(userMentions);
    } catch (error: any) {
      return [];
    }
  }
}
