/*!
 * Copyright (c) Autodesk, Inc. All rights reserved.
 * Licensed under the MIT License.
 */
const yargs = require('yargs');
const Fixtures = require('../../test/db/fixtures');

global.targets = {
  mhServerUrl: 'http://127.0.0.1:3070'
};

const processArgs = () => {
  const argv = yargs.option('branchGuid', {
    alias: 'b',
    description: 'Branch guid',
    type: 'string'
  })
  .option('commitGuid', {
    alias: 'c',
    description: 'Commit guid',
    type: 'string'
  })
  .demandOption(['branchGuid', 'commitGuid']).argv;

  return Promise.resolve(argv);
};

const doWork = async (a) => {
  const headers = Fixtures.getRequestSignatureHeaders(a.branchGuid);
  const cs = await Fixtures.fetchSingleCommit(a.branchGuid, a.commitGuid, headers);
  const commit = await Fixtures.getCommit(a.branchGuid, a.commitGuid, headers);
  commit.commit.changeSet = cs.changeSet;
  console.log(JSON.stringify(commit.commit, null, 2));
};

processArgs().then((a) => doWork(a));
