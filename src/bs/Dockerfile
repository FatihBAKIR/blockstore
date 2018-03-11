FROM node:9-stretch

RUN npm install -g typescript

WORKDIR /usr/src/app/bs/cpp

COPY ./cpp/package.json .

RUN npm install

RUN echo "deb http://ftp.us.debian.org/debian testing main contrib non-free" >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y cmake
RUN apt-get install -t testing -y g++-7

COPY ./cpp ./

RUN rm -rf build
RUN npm install -g cmake-js
ENV CC gcc-7
ENV CXX g++-7
RUN cmake-js build

WORKDIR /usr/src/app/bs/ts

COPY ./ts/package.json .

RUN npm install

COPY ./ts .

RUN tsc
EXPOSE 8080
EXPOSE 9090

WORKDIR /usr/src/app/bs/ts

CMD ["npm", "start"]
