FROM node:0.12.7
MAINTAINER inProgress SARL <contact@in-progress.io>

RUN git clone https://github.com/inProgress-team/BlueStormJS --depth 1 /bluestorm && \
    cd /bluestorm && npm install && npm link && \
    npm install -g bower
