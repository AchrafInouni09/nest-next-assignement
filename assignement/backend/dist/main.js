"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.use(cookieParser());
    const port = Number(process.env.PORT) || 3001;
    await app.listen(port);
    console.log(`Backend listening on http://localhost:${port}`);
}
bootstrap();