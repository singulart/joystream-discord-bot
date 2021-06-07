const Discord = require("discord.js");
import { wsLocation } from "../config";
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

  client.on("ready", () => {
    console.log(`Logged in.`);
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
      .post(wsLocation, httpRequestBody.replace('__DATE_AFTER__', formattedDate), {headers: {'Content-Type': 'application/json'}})
      .then((res: any) => {
        console.log(`statusCode: ${res.status}`);
        let response: IVideoResponse = <IVideoResponse>res.data;
        if(response.data.videosConnection) {
          for (let edge of response.data.videosConnection.edges) {            
            console.log("Title: " + edge.node.title);
            console.log("Duration: " + edge.node.duration);
            console.log("Channel Title: " + edge.node.channel.title);
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
  duration:     string,
  id: string,
  channel: IChannel
}


interface IChannel {
  title:    string;
}

main().catch(console.error).finally(() => process.exit());;
