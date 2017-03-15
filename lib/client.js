'use strict';

const Joi = require('joi');
const Wreck = require('wreck');

const internals = {};
internals.schema = Joi.object({
    url: Joi.string().required(),
    access_key: Joi.string().required(),
    secret_key: Joi.string().required()
});

class RancherClient {
    constructor(config) {
        
        Joi.assert(config, internals.schema);
        this._wreck = Wreck.defaults({
            baseUrl: `${config.url}`,
            headers: {
                Authorization: 'Basic ' + new Buffer(config.access_key + ':' + config.secret_key).toString('base64')
            }
        });

        this._request = (method, url, options) => {

            return new Promise((resolve, reject) => {

                this._wreck.request(method, url, options, (err, res) => {

                    if (err) {
                        return reject(err);
                    }

                    if (res.statusCode < 200 ||
                        res.statusCode >= 300) {

                        const e = new Error('Invalid response code: ' + res.statusCode);
                        e.statusCode = res.statusCode;
                        e.headers = res.headers;
                        return reject(e);
                    }

                    this._wreck.read(res, { json: true }, (err, payload) => {

                        if (err) {
                            return reject(err);
                        }

                        return resolve(payload);
                    });
                });
            });
        };
    };

    createContainer(container) {
        return this._request('post', '/container', { payload: JSON.stringify(container) });
    };

    getContainer(containerId) {

        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('get', `/container/${containerId}`);
    }

    updateContainer(container) {
        return this._request('post', `/container/${container.id}`, { payload: JSON.stringify(container) });
    }

    stopContainer(containerId, stopParams) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('post', `/container/${containerId}/?action=stop`, { payload: JSON.stringify(stopParams) });
    }

    startContainer(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('post', `/container/${containerId}/?action=start`);
    }

    restartContainer(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('post', `/container/${containerId}/?action=restart`);
    }

    removeContainer(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('delete', `/container/${containerId}`);
    }

    purgeContainer(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('post', `/container/${containerId}/?action=purge`);
    }

    getContainerLogs(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('post', `/container/${containerId}/?action=logs`);
    }

    createStack(stack) {
        return this._request('post', '/stack', { payload: JSON.stringify(stack) });
    }

    getStack(stackId) {

        Joi.assert(stackId, Joi.string().required(), 'Must specify stack id');
        return this._request('get', `/stack/${stackId}`);
    }

    getStackServices(stackId) {

        Joi.assert(stackId, Joi.string().required(), 'Must specify stack id');
        return this._request('get', `/stack/${stackId}/services`);
    }

    removeStack(stackId) {

        Joi.assert(stackId, Joi.string().required(), 'Must specify stack id');
        return this._request('post', `/stack/${stackId}/?action=remove`);
    }

    getPorts() {
        return this._request('get', `/ports`);
    }

    getHosts(query) {
        return new Promise((resolve, reject) => {
            this._request('get', `/hosts?${query}`).then(resp => {
                resolve(resp.data);
            }).catch(err => {
                reject(err);
            });
        });
    }

    getHost(hostId) {
        return this._request('get', `/hosts/${hostId}`);
    }

    deleteHost(hostId) {
        return this._request('delete', `/hosts/${hostId}`);
    }

    getRegistrationToken() {
        return new Promise((resolve, reject) => {

            this._request('post', '/registrationtokens').then(resp => {

                this._request('get', '/registrationtokens/' + resp.id).then(resp => {
                    resolve(resp.command);
                }).catch(err => {
                    reject(err);
                });

            }).catch(err => {
                reject(err);
            });

        });
    }

    getService(serviceId) {

        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('get', `/services/${serviceId}`);
    }

    stopService(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('post', `/services/${serviceId}/?action=deactivate`);
    }

    startService(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('post', `/services/${serviceId}/?action=activate`);
    }

    restartService(serviceId, restartParams) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('post', `/services/${serviceId}/?action=restart`, { payload: JSON.stringify(restartParams) });
    }
};

module.exports = RancherClient;
