# SiteChatty

<img width="150" alt="SiteChatty" src="https://raw.githubusercontent.com/astrooom/sitechatty/master/frontend/public/logo/rounded.png?raw=true"/>

SiteChatty is a web-driven AI-answer machine based on sources from your website. SiteChatty will answer from the contents of your website or manually input text-sources.

Powered by ChatGPT and ChromaDB as a Vector DB to grab relevant sources for queries.

## Requirements

Install the NVIDIA Container Toolkit. This guide will install it for Debian 11.

```
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey > /etc/apt/keyrings/nvidia-docker.key

curl -s -L https://nvidia.github.io/nvidia-docker/debian11/nvidia-docker.list > /etc/apt/sources.list.d/nvidia-docker.list

sed -i -e "s/^deb/deb \[signed-by=\/etc\/apt\/keyrings\/nvidia-docker.key\]/g" /etc/apt/sources.list.d/nvidia-docker.list

apt update

apt -y install nvidia-container-toolkit

systemctl restart docker
```

Failure to install the NVIDIA Container Toolkit will cause the postgresml database to fail initializing.
