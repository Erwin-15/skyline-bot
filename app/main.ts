import { Client, RichEmbed } from "discord.js";
import config from "./config.json"
import * as commands from "./commands"
import { Command, CommandError } from "./commands/command.js";
const client = new Client();
let commandMap = new Map<string, Command>();
let commandVec = new Array<Command>();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  Object.values(commands).forEach((commandT) => {
    let command: Command = new commandT()
    commandMap.set(command.name, command)
    commandMap.set(command.shortname, command)
    commandVec.push(command)
  })
});

client.on('message', msg => {
  if (msg.content.startsWith(config.prefix) && (msg.author.id != client.user.id)) {
    let input = msg.content.split(" ")
    let cmd: string = input[0].substr(config.prefix.length)
    const command = commandMap.get(cmd)
    if (command != undefined) {
      command.run(msg, input).then(() => {
        msg.delete(config.deleteTime)
      }).catch((e) => {
        let embed = new RichEmbed({ "title": "**An Error was Encountered**" })
        if (e instanceof CommandError)
          embed.setDescription(e.message)
        if (e instanceof Error)
          console.warn(e)
        else
          console.warn(`Caught Error: ${e}`)
        msg.channel.send(embed)
      })
    } else if (cmd == "help" || cmd == "h") {
      let embed = new RichEmbed({
        "title": "**Bot Commands**"
      });
      for (const command of commandVec)
        embed.addField(`\`${command.name}\` or \`${command.shortname}\``, command.desc, true)
      if(!msg.author.dmChannel)
        msg.author.createDM().then((channel)=>{channel.send(embed)})
      else
        msg.author.dmChannel.send(embed)
    }
    msg.delete(config.deleteTime)
  }
});

client.login(config.token);