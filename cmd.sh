#!/bin/bash

export $(cat .env | xargs)

java -jar hono-cli-*-exec.jar --hono.client.host=$AMQP_NETWORK_IP --hono.client.port=15672 --hono.client.username=consumer@HONO --hono.client.password=verysecret --tenant.id=$MY_TENANT --device.id=$MY_DEVICE --spring.profiles.active=command

