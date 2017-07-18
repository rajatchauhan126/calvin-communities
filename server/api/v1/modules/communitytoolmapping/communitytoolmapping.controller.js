const jwt = require('jsonwebtoken');
const async = require('async');
const _ = require('lodash');
const logger = require('../../../../logger');
const communitytoolsCtrl = require('../communitytools/communitytools.controller');
const eventmappingServices = require('./communitytoolmapping.service');
const token = require('../../../../config').jwtdetails;


const COMMUNITY_TOOL_EVENT_MAP = 'communitytooleventmap';

function authenticate(domain, toolid, done) {
  jwt.sign({ domain: domain, toolid: toolid }, token.secret, (err, code) => {
    if (err) { logger.debug(err); return done([400, 'Error in Operation']) }
    if (code) return done(undefined, code);
  })

}

function getToolEventMapping(parameters, done) {
  eventmappingServices.getToolEventMapping(parameters, done);
}

function getToolMapping(parameters, done) {
  eventmappingServices.getToolMapping(parameters, done);
}

function postEventMapping(parameters, details, done) {


  console.log(parameters, details);
  let wrongvalues = 0;
  const queries = [];
  let query;
  if (!_.has(parameters, 'domain') || !_.has(parameters, 'toolid')) return done([400, 'Domain and Toolid Required']);
  details.events.forEach((data) => {
    if (!_.has(data, 'eventid') || !_.has(data, 'eventname') || !_.has(data, 'description') || !_.has(data, 'activity') ||
      !_.has(data, 'activity') || !_.has(data, 'metadata') || !_.has(data, 'actor') || !_.has(data, 'object')) {
      wrongvalues++;
    }
    query = 'insert into ' + COMMUNITY_TOOL_EVENT_MAP + '(domain, toolid, eventid, eventname, description, activity,actor, object, metadata) values (?,?,?,?,?,?,?,?,?)';

    queries.push({
      query,
      params: [parameters.domain, parameters.toolid, data.eventid,
        data.eventname, data.description, data.activity, data.actor, data.object, data.metadata,
      ],
    });
  });

  console.log(wrongvalues, "here");
  if (wrongvalues === 0) {
    async.waterfall([
      eventmappingServices.getToolMapping.bind(null, parameters),
      eventmappingServices.postEventMapping.bind(null, queries),
      authenticate.bind(null, parameters.domain, parameters.toolid, done)
    ], (err, result) => {
      if (err) { logger.error('err', err); return done([400, 'Seems you\'re trying to reintegrate this tool with same domain']); }
      if (result) done(undefined, result);
    });
  } else {
    done([400, 'Required data inputs were not found']);
  }
}

function updateEventMapping(parameters, details, done) {
  let wrongvalues = 0;
  const queries = [];
  let query;
  details.forEach((data) => {
    if (!_.has(data, 'eventname') || !_.has(data, 'description') || !_.has(data, 'eventid') ||
      !_.has(data, 'activity') || !_.has(data, 'actor') || !_.has(data, 'object') || !_.has(data, 'metadata')) {
      wrongvalues++;
    }
    query = `update ${COMMUNITY_TOOL_EVENT_MAP} set eventname=?, description=?, activity=? , actor =?, object=?metadata=? where domain=? and toolid=? and eventid=?`;

    queries.push({ query, params: [data.eventname, data.description, data.activity, data.actor, data.object, data.metadata, parameters.domain, parameters.toolid, data.eventid] });
  });
  console.log('out')
  if (wrongvalues === 0) {
    async.waterfall([
      eventmappingServices.getToolMapping.bind(null, parameters),
      eventmappingServices.updateEventMapping.bind(null, queries),
      authenticate.bind(null, parameters.domain, parameters.toolid, done)

    ], (err, result) => {
      if (err) { logger.error('err', err); return done([400, 'Unexpected Error, or maybe the tool isn\'t integrated yet']); }
      if (result) return done(undefined, result);
    });
  } else {
    done([400, 'Required data inputs were not found']);
  }
}


module.exports = {
  getToolMapping,
  getToolEventMapping,
  postEventMapping,
  authenticate,
  updateEventMapping,
};
