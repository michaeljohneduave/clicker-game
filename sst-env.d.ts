/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
/* deno-fmt-ignore-file */
import "sst"
export {}
declare module "sst" {
  export interface Resource {
    "Db": {
      "database": string
      "host": string
      "password": string
      "port": number
      "type": "sst.aws.Postgres"
      "username": string
    }
    "Vpc": {
      "type": "sst.aws.Vpc"
    }
    "Web": {
      "type": "sst.aws.SvelteKit"
      "url": string
    }
  }
}
