FROM node:0.12.7
MAINTAINER inProgress SARL <contact@in-progress.io>

RUN git clone https://github.com/inProgress-team/BlueStormJS /bluestorm #REDO

RUN cd /bluestorm && npm install
RUN cd /bluestorm && npm link

# INSTALL BOWER
RUN npm install -g bower
