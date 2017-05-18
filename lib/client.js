'use strict';

const Joi = require('joi');
const request = require('request');

const internals = {};
internals.schema = Joi.object({
    url: Joi.string().required(),
    access_key: Joi.string().required(),
    secret_key: Joi.string().required()
});

class RancherClient {
    constructor(config) {
        
        Joi.assert(config, internals.schema);
        this.request = request.defaults({
            baseUrl: `${config.url}`,
            headers: {
                Authorization: 'Basic ' + new Buffer(config.access_key + ':' + config.secret_key).toString('base64')
                'Content-Type': 'application/json'
            }
        });

        this._request = (method, url, options) => {

            return new Promise((resolve, reject) => {

                this.request(url, Object.assign({ method: method, json: (method.toLowerCase() != "get") }, options), (err, res, json) => {
                    if (err) {
                        return reject(err);
                    }

                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        const e = new Error('Invalid response code: ' + res.statusCode);
                        e.statusCode = res.statusCode;
                        e.headers = res.headers;
                        return reject(e);
                    }
                    
                    return resolve( json );
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
        return this._request('post', '/stacks', { payload: JSON.stringify(stack) });
    }

    getStack(stackId) {

        Joi.assert(stackId, Joi.string().required(), 'Must specify stack id');
        return this._request('get', `/stacks/${stackId}`);
    }

    getStackServices(stackId) {

        Joi.assert(stackId, Joi.string().required(), 'Must specify stack id');
        return this._request('get', `/stacks/${stackId}/services`);
    }

    removeStack(stackId) {

        Joi.assert(stackId, Joi.string().required(), 'Must specify stack id');
        return this._request('post', `/stacks/${stackId}/?action=remove`);
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
    
    
    
    
    createVolume(volume) {
        return this._request('post', '/volume', { payload: JSON.stringify(volume) });
    }
    getVolume(volumeId) {

        Joi.assert(volumeId, Joi.string().required(), 'Must specify volumeId');
        return this._request('get', `/volume/${volumeId}`);
    }
    removeVolume(volumeId) {

        Joi.assert(volumeId, Joi.string().required(), 'Must specify volumeId');
        return this._request('post', `/volume/${volumeId}/?action=remove`);
    }
    
    
};

module.exports = RancherClient;
