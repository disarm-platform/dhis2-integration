/* This function is designed to be run as a serverless function.
 * Check the README.md for configurable environment variables
 *
 * The `main` function contains the outline.
 * The `handler` function is responsible for CORS and handling the cloud function request
 * The `disarm` file contains functionality related to preparing data and running DiSARM function
 * The `dhis2` file contains functionality that reads and writes data from DHIS2
 */
import express from 'express';
import { main } from './main';

exports.handler = async (req: express.Request, res: express.Response) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  const ran_ok = await main();
  if (ran_ok) {
    res.sendStatus(200);
  } else {
    res.sendStatus(502);
  }
};
