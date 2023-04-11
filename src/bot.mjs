import {parseCommands, keyboardGrid} from "telebot-utils";
import TeleBot from "telebot";

const {
    LOG_CHAT_ID,
    TELEGRAM_BOT_TOKEN,
} = process.env;

const info = `Send any text content to get it as file`;

const extensions = ["txt", "md", "csv", "json", "html", "css", "svg", "js"];

const bot = new TeleBot(TELEGRAM_BOT_TOKEN);

bot.mod("message", parseCommands);

bot.on("text", async ({isCommand, message_id, chat: {id} = {}, reply = {}} = {}) => {
    if (isCommand) return reply.text(info);
    if (LOG_CHAT_ID) await bot.forwardMessage(parseInt(LOG_CHAT_ID), id, message_id);
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
    const [{message_id} = {}] = await Promise.all([
        bot.sendDocument(chatId, new Buffer(text), {fileName}),
        bot.answerCallbackQuery(id, {text: "Uploading file..."}),
        bot.sendAction(chatId, "upload_document"),
        bot.editMessageText({chatId, messageId}, `Generated file:`),
    ]).catch(console.error) || [];
    if (LOG_CHAT_ID && message_id) await bot.forwardMessage(parseInt(LOG_CHAT_ID), chatId, message_id);
});

export default bot
