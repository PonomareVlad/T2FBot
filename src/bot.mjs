import {parseCommands, keyboardGrid} from "telebot-utils";
import TeleBot from "telebot";

const info = `Send any text content to get it as file`;

const extensions = ["txt", "md", "csv", "json", "html", "css", "svg", "js"];

const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);

bot.mod("message", parseCommands);

bot.on("text", ({isCommand, reply}) => {
    if (isCommand) return reply.text(info);
    const buttons = extensions.map(callback => bot.inlineButton(callback, {callback}));
    const replyMarkup = bot.inlineKeyboard(keyboardGrid(buttons, 4));
    return reply.text(`Select extension for file:`, {asReply: true, replyMarkup});
});

bot.on("callbackQuery", async ({
                                   id,
                                   data,
                                   message: {reply_to_message: {text}, message_id: messageId, chat: {id: chatId}}
                               }) => {
    if (!extensions.includes(data)) return bot.answerCallbackQuery(id, {text: "Wrong extension !"});
    const fileName = `file.${data}`;
    return Promise.all([
        bot.answerCallbackQuery(id, {text: "Uploading file..."}),
        bot.sendAction(chatId, "upload_document"),
        bot.sendDocument(chatId, new Buffer(text), {fileName}),
        bot.editMessageText({chatId, messageId}, `Generated file:`),
    ]).catch(console.error);
});

export default bot
