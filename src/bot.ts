const Discord = require("discord.js");
import { channelName, hydraLocation } from "../config";
import { readFileSync } from 'fs';
import axios from 'axios';
import moment from 'moment';

const delay = (ms: number | undefined) => new Promise(res => setTimeout(res, ms));

const queryParams = readFileSync('./query_params.json', 'utf-8');
const graphql = readFileSync('./videos_query.graphql', 'utf-8').replaceAll("\n", "\\n");
const httpRequestBody = readFileSync('./request.json', 'utf-8')
                              .replace('__PARAMS__', queryParams)
                              .replace('__QUERY__', graphql);

const client = new Discord.Client();

const main = async () => {

  client.login(process.env.TOKEN); // environment variable TOKEN must be set

  client.on("ready", async () => {
    console.log(`Logged in.`);
    await client.channels.fetch(channelName);
  });
  
  client.on("message", (msg: { content: string | string[]; reply: (arg0: string) => void; author: any; }) => {
    if (msg.content.includes("@joystream-bot"))
      msg.reply(`Hello, ${msg.author}!`);
  });

  do {
    const now = moment();
    const createdAt = moment(now).subtract(100, 'minutes');
    const formattedDate = createdAt.format('YYYY-DD-MMMTHH:mm:ssZ');
    console.log('Checking for new videos uploaded since ' + formattedDate);

    await axios
      .post(hydraLocation, httpRequestBody.replace('__DATE_AFTER__', formattedDate), {headers: {'Content-Type': 'application/json'}})
      .then((res: any) => {
        console.log(`statusCode: ${res.status}`);
        let response: IVideoResponse = <IVideoResponse>res.data;
        if(response.data.videosConnection) {
          for (let edge of response.data.videosConnection.edges) {            
            const channel = client.channels.cache.get(channelName);
            const exampleEmbed = new Discord.MessageEmbed()
              .setColor('#0099ff')
              .setTitle(edge.node.title)
              .setURL('https://play.joystream.org/video/' + edge.node.id)
              .setAuthor(edge.node.channel.title, 'https://i.imgur.com/wSTFkRM.png', 'https://play.joystream.org/channel/' + edge.node.channel.id)
              .setDescription(edge.node.description)
              .setThumbnail('https://raw.githubusercontent.com/Joystream/design/master/logo/logo%20icon/SVG/Icon-basic-0bg.svg')
              .setTimestamp();
            channel.send(exampleEmbed);
          }  
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
      await delay(10000);
  } while (true);

}

interface IVideoResponse {
  data: IData
}

interface IData {
  videosConnection: IVideoConnection
}

interface IVideoConnection {
  edges: IVideo[]
}

interface IVideo {
  node: INode
}

interface INode {
  title:    string,
  description: string,
  duration:     string,
  id: string,
  channel: IChannel
}


interface IChannel {
  title:    string,
  id: string,
  createdById: string;
}

main().catch(console.error).finally(() => process.exit());;
