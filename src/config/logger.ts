import morgan from "morgan";
import fs from "fs";
import path from "path";

const __dirname = import.meta.dirname;

const logDirectory = path.join(__dirname, "../logs");

if(!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

morgan.token("user-id", (req) => {
    return req.user ? req.user._id : "Guest";
});

const customFormat =
  ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

const accessLogStream = fs.createWriteStream(path.join(logDirectory, "access.log"), { flags: "a" });

const fileLogger = morgan(customFormat, { stream: accessLogStream });
const consoleLogger = morgan("dev");

export default [fileLogger, consoleLogger];
