"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
/* This function is designed to be run as a serverless function.
 * Check the README.md for configurable environment variables
 *
 * The `main` function contains the outline.
 * The `handler` function is responsible for CORS and handling the cloud function request
 */
var fs_1 = require("fs");
var node_fetch_1 = require("node-fetch");
// CONFIG
var static_period = '201912';
var dhis2_root_url = process.env.DHIS2_ROOT_URL || "http://dhis2.disarm.io:8080";
var dhis2_headers = {
    Authorization: process.env.DHIS2_AUTH || 'Basic YWRtaW46ZGlzdHJpY3Q='
};
var disarm_fn_url = process.env.DISARM_FN_URL || 'https://faas.srv.disarm.io/function/fn-prevalence-predictor-mgcv';
var DEBUG = process.env.DEBUG;
var debug_file_count = 0;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, dataValueSets, orgUnitsFeatures, dataElementLookup, fn_request, run_result, data_for_dhis2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, get_data_from_dhis2()];
                case 1:
                    _a = _b.sent(), dataValueSets = _a.dataValueSets, orgUnitsFeatures = _a.orgUnitsFeatures, dataElementLookup = _a.dataElementLookup;
                    return [4 /*yield*/, shape_data_for_disarm(dataValueSets, orgUnitsFeatures, dataElementLookup)];
                case 2:
                    fn_request = _b.sent();
                    return [4 /*yield*/, run_disarm_algorithm(fn_request)];
                case 3:
                    run_result = _b.sent();
                    return [4 /*yield*/, shape_result_for_dhis2(run_result, dataElementLookup)];
                case 4:
                    data_for_dhis2 = _b.sent();
                    return [4 /*yield*/, write_result_to_dhis2(data_for_dhis2)];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, trigger_dhis2_analytics()];
                case 6:
                    _b.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.handler = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var worked;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                res.set('Access-Control-Allow-Origin', '*');
                res.set('Access-Control-Allow-Methods', 'GET, POST');
                res.set('Access-Control-Allow-Headers', 'content-type');
                if (req.method === 'OPTIONS') {
                    res.sendStatus(200);
                    return [2 /*return*/];
                }
                return [4 /*yield*/, main()];
            case 1:
                worked = _a.sent();
                if (worked) {
                    res.sendStatus(200);
                }
                else {
                    res.sendStatus(502);
                }
                return [2 /*return*/];
        }
    });
}); };
function get_data_from_dhis2() {
    return __awaiter(this, void 0, void 0, function () {
        var metadata_url, metadata_res, metadata, dataSetId, orgUnitIds, orgUnitParams, dataValueSetsUrl, dataValueSetsUrl_res, dataValueSets, rawOrgUnits, rawDataElements, orgUnitsFeatures, dataElementLookup;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    metadata_url = dhis2_root_url + "/api/metadata.json?assumeTrue=false&dataElements=true&organisationUnits=true&dataSets=true&users=true";
                    return [4 /*yield*/, node_fetch_1["default"](metadata_url, { headers: dhis2_headers })];
                case 1:
                    metadata_res = _a.sent();
                    return [4 /*yield*/, metadata_res.json()];
                case 2:
                    metadata = _a.sent();
                    return [4 /*yield*/, write_debug_file(metadata, 'metadata')];
                case 3:
                    _a.sent();
                    dataSetId = metadata.dataSets[0].id;
                    orgUnitIds = metadata.organisationUnits.filter(function (i) { return i.hasOwnProperty('parent'); }).map(function (i) { return i.id; });
                    orgUnitParams = orgUnitIds.map(function (i) { return "&orgUnit=" + i; }).join('');
                    dataValueSetsUrl = dhis2_root_url + "/api/dataValueSets.json?dataSet=" + dataSetId + "&period=" + static_period + orgUnitParams;
                    return [4 /*yield*/, node_fetch_1["default"](dataValueSetsUrl, { headers: dhis2_headers })];
                case 4:
                    dataValueSetsUrl_res = _a.sent();
                    return [4 /*yield*/, dataValueSetsUrl_res.json()];
                case 5:
                    dataValueSets = _a.sent();
                    return [4 /*yield*/, write_debug_file(dataValueSets, 'dataValueSets')];
                case 6:
                    _a.sent();
                    rawOrgUnits = metadata.organisationUnits;
                    return [4 /*yield*/, write_debug_file(rawOrgUnits, 'rawOrgUnits')];
                case 7:
                    _a.sent();
                    rawDataElements = metadata.dataElements;
                    return [4 /*yield*/, write_debug_file(rawDataElements, 'rawDataElements')];
                case 8:
                    _a.sent();
                    orgUnitsFeatures = rawOrgUnits.filter(function (i) { return i.hasOwnProperty('parent'); }).map(function (i) {
                        return {
                            type: 'Feature',
                            properties: {
                                id: i.id,
                                orgUnit_id: i.id,
                                orgUnit_name: i.name
                            },
                            geometry: {
                                type: 'Point',
                                coordinates: i.geometry.coordinates
                            }
                        };
                    });
                    dataElementLookup = rawDataElements.reduce(function (acc, i) {
                        acc[i.id] = i.name;
                        acc[i.name] = i.id;
                        return acc;
                    }, {});
                    return [4 /*yield*/, write_debug_file(dataElementLookup, 'dataElementLookup')];
                case 9:
                    _a.sent();
                    return [2 /*return*/, { dataValueSets: dataValueSets, orgUnitsFeatures: orgUnitsFeatures, dataElementLookup: dataElementLookup }];
            }
        });
    });
}
function shape_data_for_disarm(dataValueSets, orgUnitsFeatures, dataElementLookup) {
    return __awaiter(this, void 0, void 0, function () {
        var orgUnitsGeoJSON, fn_request;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dataValueSets.dataValues.forEach(function (d) {
                        var found_orgUnit = orgUnitsFeatures.find(function (o) { return o.properties.orgUnit_id === d.orgUnit; });
                        if (!found_orgUnit) {
                            console.error('Cannot find orgUnit for', d);
                            return;
                        }
                        var found_dataElement = dataElementLookup[d.dataElement];
                        if (!found_dataElement) {
                            console.error('Cannot find dataElement for', d);
                            return;
                        }
                        var value = parseFloat(d.value);
                        found_orgUnit.properties[found_dataElement] = value;
                    });
                    orgUnitsGeoJSON = {
                        type: 'FeatureCollection',
                        features: orgUnitsFeatures
                    };
                    fn_request = { point_data: {
                            type: 'FeatureCollection',
                            features: orgUnitsFeatures
                        } };
                    return [4 /*yield*/, write_debug_file(fn_request, 'send_to_disarm')];
                case 1:
                    _a.sent();
                    return [2 /*return*/, fn_request];
            }
        });
    });
}
function run_disarm_algorithm(fn_request) {
    return __awaiter(this, void 0, void 0, function () {
        var real_run_Url, real_run_Url_res, real_run_result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    real_run_Url = "" + disarm_fn_url;
                    return [4 /*yield*/, node_fetch_1["default"](real_run_Url, {
                            method: 'post',
                            headers: dhis2_headers,
                            body: JSON.stringify(fn_request)
                        })];
                case 1:
                    real_run_Url_res = _a.sent();
                    return [4 /*yield*/, real_run_Url_res.json()];
                case 2:
                    real_run_result = _a.sent();
                    return [4 /*yield*/, write_debug_file(real_run_result, 'disarm_output')];
                case 3:
                    _a.sent();
                    return [2 /*return*/, real_run_result];
            }
        });
    });
}
function shape_result_for_dhis2(real_run_result, dataElementLookup) {
    return __awaiter(this, void 0, void 0, function () {
        var dataValues, data_for_dhis2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dataValues = real_run_result.result.features.reduce(function (acc, f) {
                        for (var _i = 0, _a = ['n_trials', 'n_positive', 'prevalence_prediction']; _i < _a.length; _i++) {
                            var field_name = _a[_i];
                            var properties = f.properties;
                            var dataElement = dataElementLookup[field_name];
                            var value = properties[field_name];
                            var orgUnit = properties.orgUnit_id;
                            var lastUpdated = new Date;
                            acc.push({
                                dataElement: dataElement,
                                value: value,
                                period: static_period,
                                orgUnit: orgUnit,
                                lastUpdated: lastUpdated
                            });
                        }
                        return acc;
                    }, []);
                    data_for_dhis2 = {
                        dataValues: dataValues
                    };
                    return [4 /*yield*/, write_debug_file(data_for_dhis2, 'data_for_dhis2')];
                case 1:
                    _a.sent();
                    return [2 /*return*/, data_for_dhis2];
            }
        });
    });
}
function write_result_to_dhis2(data_for_dhis2) {
    return __awaiter(this, void 0, void 0, function () {
        var post_data_to_dhis2_url, post_data_to_dhis2_res, post_data_to_dhis2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    post_data_to_dhis2_url = dhis2_root_url + "/api/dataValueSets.json?importStrategy=UPDATE";
                    return [4 /*yield*/, node_fetch_1["default"](post_data_to_dhis2_url, {
                            method: 'post',
                            headers: __assign(__assign({}, dhis2_headers), { 'Content-Type': 'application/json' }),
                            body: JSON.stringify(data_for_dhis2)
                        })];
                case 1:
                    post_data_to_dhis2_res = _a.sent();
                    return [4 /*yield*/, post_data_to_dhis2_res.json()];
                case 2:
                    post_data_to_dhis2 = _a.sent();
                    return [4 /*yield*/, write_debug_file(post_data_to_dhis2, 'response_from_dhis2')];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function trigger_dhis2_analytics(delay) {
    if (delay === void 0) { delay = 2000; }
    return __awaiter(this, void 0, void 0, function () {
        var dhis2_trigger_analytics_url, dhis2_trigger_analytics_res, dhis2_trigger_analytics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            console.log('Trigger analytics');
                            resolve();
                        }, delay);
                    })];
                case 1:
                    _a.sent();
                    dhis2_trigger_analytics_url = dhis2_root_url + "/api/resourceTables/analytics";
                    return [4 /*yield*/, node_fetch_1["default"](dhis2_trigger_analytics_url, {
                            method: 'post',
                            headers: dhis2_headers
                        })];
                case 2:
                    dhis2_trigger_analytics_res = _a.sent();
                    return [4 /*yield*/, dhis2_trigger_analytics_res.json()];
                case 3:
                    dhis2_trigger_analytics = _a.sent();
                    return [4 /*yield*/, write_debug_file(dhis2_trigger_analytics, 'response_from_dhis2_analytics_bump')];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function write_debug_file(content, filename) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(DEBUG === 'file')) return [3 /*break*/, 2];
                    return [4 /*yield*/, fs_1["default"].writeFileSync("data/4_real_run_function/" + debug_file_count++ + "_" + filename + ".json", JSON.stringify(content, null, 2))];
                case 1: 
                // console.log(filename, content);
                return [2 /*return*/, _a.sent()];
                case 2:
                    if (DEBUG === 'log') {
                        console.log(content);
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
main();
