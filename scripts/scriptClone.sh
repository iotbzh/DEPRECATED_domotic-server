git clone https://github.com/iotbzh/civintec-reader.git
cd civintec-reader
npm install && npm run build

cd ..

git clone https://github.com/iotbzh/winstar-relay
cd winstar-relay
npm install && npm run build

cd ..

git clone https://github.com/iotbzh/civintec-server.git
cd civintec-server
npm install && npm run build && npm install pm2@latest -g


