# CNY Greeting Card Whatsapp Bot

A simple Whatsapp bot that create a CNY greeting card.
## Setup

1. `git clone https://github.com/hongvin/cny-bot`
2. `npm i`
3. Comment line 16 of the `whatsapp-web.js` library at `node_modules/whatsapp-web.js/src/util/Injected.js`
4. `node cny.js` or `pm2 start cny.js`

## How to use this bot?

- Refer [here](https://wwebjs.dev/guide/#qr-code-generation) on how to login to Whatsapp.
- Since this bot involve sending media, you need to have Chrome setup. The code here assumed a Linux machine. Change your chrome location at Line 35 of `cny.js`.

## Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or its affiliates. The official WhatsApp website can be found at https://whatsapp.com. "WhatsApp" as well as related names, marks, emblems and images are registered trademarks of their respective owners.

## License

Copyright 2023 Hong Vin

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this project except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.