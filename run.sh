#!/bin/bash

export $(cat .env | xargs)

yarn ts-node index.ts
